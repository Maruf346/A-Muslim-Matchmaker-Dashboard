import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Eye,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import {
  buildChatWebSocketUrl,
  downloadChatAttachment,
  listChatMessages,
  listChatRooms,
  markChatRoomRead,
  sendChatMessage,
  type ChatMessage,
  type ChatRoom,
  type ChatWebSocketPayload,
} from "../api/chat";
import { getUserDetail, type AdminUserDetail } from "../api/adminUsers";
import { ApiError } from "../api/errors";

const SIDEBAR_PAGE_SIZE = 5;
const MESSAGE_PAGE_SIZE = 30;

function displayName(room: ChatRoom) {
  return room.full_name?.trim() || room.codename || "Unnamed user";
}

function initialsFor(room: ChatRoom) {
  const name = displayName(room);
  return name.charAt(0).toUpperCase();
}

function isRoomOnline(room: ChatRoom) {
  return room.last_active_display?.trim().toLowerCase() === "active now";
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLocation(user: AdminUserDetail | null) {
  const parts = [user?.city, user?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

function formatRole(value: string | null | undefined) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizePercentage(value: string | number | null | undefined) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.max(0, Math.min(100, numberValue));
}

function dedupeMessages(messages: ChatMessage[]) {
  const seen = new Set<string>();
  return messages.filter((message) => {
    if (seen.has(message.id)) return false;
    seen.add(message.id);
    return true;
  });
}

async function retryNull<T>(request: () => Promise<T | null>) {
  let response = await request();
  if (response === null) response = await request();
  return response;
}

export function Chat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarPage, setSidebarPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [messagePage, setMessagePage] = useState(1);
  const [messageTotalPages, setMessageTotalPages] = useState(1);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AdminUserDetail | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [reloadRoomsIndex, setReloadRoomsIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalRooms / SIDEBAR_PAGE_SIZE));
  const hasOlderMessages = messagePage > 1;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      setLoadingRooms(true);
      setError(null);

      try {
        const response = await retryNull(() =>
          listChatRooms({
            page: sidebarPage,
            page_size: SIDEBAR_PAGE_SIZE,
            search: debouncedSearch || undefined,
          }),
        );

        if (cancelled) return;

        const nextRooms = Array.isArray(response?.results) ? response.results : [];
        setRooms(nextRooms);
        setTotalRooms(typeof response?.count === "number" ? response.count : 0);

        setSelectedRoom((current) => {
          if (!current) return nextRooms[0] ?? null;
          return nextRooms.find((room) => room.id === current.id) ?? current;
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load chat inbox.");
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    };

    void loadRooms();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, reloadRoomsIndex, sidebarPage]);

  useEffect(() => {
    if (!selectedRoom) return;

    let cancelled = false;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessageError(null);
      setMessages([]);

      try {
        const firstResponse = await retryNull(() =>
          listChatMessages(selectedRoom.id, {
            page: 1,
            page_size: MESSAGE_PAGE_SIZE,
          }),
        );

        if (cancelled) return;

        const totalCount = typeof firstResponse?.count === "number" ? firstResponse.count : 0;
        const lastPage = Math.max(1, Math.ceil(totalCount / MESSAGE_PAGE_SIZE));
        const finalResponse =
          lastPage > 1
            ? await retryNull(() =>
                listChatMessages(selectedRoom.id, {
                  page: lastPage,
                  page_size: MESSAGE_PAGE_SIZE,
                }),
              )
            : firstResponse;

        if (cancelled) return;

        const nextMessages = Array.isArray(finalResponse?.results) ? finalResponse.results : [];
        setMessages(nextMessages);
        setMessagePage(lastPage);
        setMessageTotalPages(lastPage);
        setRooms((prev) =>
          prev.map((room) => (room.id === selectedRoom.id ? { ...room, unread_count: 0 } : room)),
        );
        setSelectedRoom((prev) => (prev?.id === selectedRoom.id ? { ...prev, unread_count: 0 } : prev));

        void markChatRoomRead(selectedRoom.id).catch(() => undefined);

        window.setTimeout(() => {
          const container = messagesContainerRef.current;
          if (container) container.scrollTop = container.scrollHeight;
        }, 0);
      } catch (err) {
        if (cancelled) return;
        setMessageError(err instanceof ApiError ? err.message : "Unable to load messages.");
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedRoom?.id]);

  useEffect(() => {
    if (!selectedRoom) return;

    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let active = true;

    const connect = () => {
      const socket = new WebSocket(buildChatWebSocketUrl(selectedRoom.id));
      wsRef.current = socket;

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data) as ChatWebSocketPayload;

        if (payload.type === "chat_message" && "message" in payload && payload.message?.room === selectedRoom.id) {
          const incoming = payload.message;

          setMessages((prev) => dedupeMessages([...prev, incoming]));
          setRooms((prev) =>
            prev.map((room) =>
              room.id === incoming.room
                ? {
                    ...room,
                    last_message_preview: incoming.text || (incoming.attachment_name ? "Sent an attachment" : ""),
                    last_message_at: incoming.created_at,
                    unread_count: incoming.sender_is_admin ? room.unread_count : 0,
                  }
                : room,
            ),
          );
          setSelectedRoom((prev) =>
            prev?.id === incoming.room
              ? {
                  ...prev,
                  last_message_preview: incoming.text || (incoming.attachment_name ? "Sent an attachment" : ""),
                  last_message_at: incoming.created_at,
                  unread_count: incoming.sender_is_admin ? prev.unread_count : 0,
                }
              : prev,
          );

          if (!incoming.sender_is_admin) {
            void markChatRoomRead(selectedRoom.id).catch(() => undefined);
          }

          window.setTimeout(() => {
            const container = messagesContainerRef.current;
            if (container) container.scrollTop = container.scrollHeight;
          }, 0);
        }

        if (payload.type === "read_receipt") {
          const ids = Array.isArray(payload.message_ids) ? new Set(payload.message_ids) : null;
          setMessages((prev) =>
            prev.map((message) =>
              !ids || ids.has(message.id)
                ? {
                    ...message,
                    is_read: true,
                    read_at: message.read_at ?? new Date().toISOString(),
                  }
                : message,
            ),
          );
        }
      };

      socket.onclose = () => {
        if (!active) return;
        reconnectTimer = window.setTimeout(connect, 2500);
      };
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [selectedRoom?.id]);

  useEffect(() => {
    if (!showInfoPopup || !selectedRoom) return;

    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      try {
        const detail = await getUserDetail(selectedRoom.user_id);
        if (cancelled) return;
        setSelectedProfile(detail);
      } catch (err) {
        if (cancelled) return;
        setProfileError(err instanceof ApiError ? err.message : "Unable to load profile overview.");
        setSelectedProfile(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [selectedRoom, showInfoPopup]);

  const loadOlderMessages = async () => {
    if (!selectedRoom || loadingOlder || !hasOlderMessages) return;

    const container = messagesContainerRef.current;
    const previousHeight = container?.scrollHeight ?? 0;
    const nextPage = messagePage - 1;

    setLoadingOlder(true);
    setMessageError(null);

    try {
      const response = await retryNull(() =>
        listChatMessages(selectedRoom.id, {
          page: nextPage,
          page_size: MESSAGE_PAGE_SIZE,
        }),
      );
      const olderMessages = Array.isArray(response?.results) ? response.results : [];

      setMessages((prev) => dedupeMessages([...olderMessages, ...prev]));
      setMessagePage(nextPage);
      setMessageTotalPages(Math.max(1, Math.ceil((response?.count ?? 0) / MESSAGE_PAGE_SIZE)) || messageTotalPages);

      window.setTimeout(() => {
        const nextContainer = messagesContainerRef.current;
        if (nextContainer) {
          nextContainer.scrollTop = nextContainer.scrollHeight - previousHeight;
        }
      }, 0);
    } catch (err) {
      setMessageError(err instanceof ApiError ? err.message : "Unable to load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleScrollMessages = () => {
    const container = messagesContainerRef.current;
    if (!container || container.scrollTop > 24) return;
    void loadOlderMessages();
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowInfoPopup(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !fileAttachment) return;
    if (!selectedRoom || sending) return;

    const text = messageText.trim();
    const attachment = fileAttachment;

    setSending(true);
    setMessageError(null);

    try {
      const sent = await sendChatMessage(selectedRoom.id, {
        text,
        attachment,
      });

      setMessages((prev) => dedupeMessages([...prev, sent]));
      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoom.id
            ? {
                ...room,
                last_message_preview: sent.text || (sent.attachment_name ? "Sent an attachment" : ""),
                last_message_at: sent.created_at,
              }
            : room,
        ),
      );
      setSelectedRoom((prev) =>
        prev?.id === selectedRoom.id
          ? {
              ...prev,
              last_message_preview: sent.text || (sent.attachment_name ? "Sent an attachment" : ""),
              last_message_at: sent.created_at,
            }
          : prev,
      );
      setMessageText("");
      setFileAttachment(null);

      window.setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      }, 0);
    } catch (err) {
      setMessageError(err instanceof ApiError ? err.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileAttachment(file);
    e.target.value = "";
  };

  const handleDownload = async (message: ChatMessage) => {
    if (!selectedRoom) return;
    setDownloadingId(message.id);

    try {
      await downloadChatAttachment(selectedRoom.id, message.id, message.attachment_name ?? "attachment");
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : "Unable to download attachment.");
    } finally {
      setDownloadingId(null);
    }
  };

  const profileCompletion = normalizePercentage(selectedProfile?.profile_completion_percentage);
  const popupName = selectedProfile
    ? `${selectedProfile.first_name ?? ""} ${selectedProfile.last_name ?? ""}`.trim() || selectedRoom?.full_name || selectedRoom?.codename
    : selectedRoom
      ? displayName(selectedRoom)
      : "";

  return (
    <div className="h-screen flex bg-[#FFFFFF]">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-[#F9FAFB]">
        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSidebarPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="text-sm text-gray-400 text-center py-8 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
              Loading inbox...
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 text-center py-8 px-4">
              <p>{error}</p>
              <button
                onClick={() => setReloadRoomsIndex((prev) => prev + 1)}
                className="mt-3 text-xs font-semibold text-[#415192] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id ? "bg-[#415192]/10" : "hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#415192] flex items-center justify-center text-white font-medium overflow-hidden">
                      {room.profile_picture ? (
                        <img src={room.profile_picture} alt={displayName(room)} className="w-full h-full object-cover" />
                      ) : (
                        initialsFor(room)
                      )}
                    </div>
                    <Circle
                      className={`absolute bottom-0 right-0 w-3 h-3 ${
                        isRoomOnline(room) ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">{displayName(room)}</p>
                      {room.unread_count > 0 && (
                        <span className="bg-[#415192] text-white text-xs px-2 py-0.5 rounded-full shrink-0 ml-1">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{room.last_message_preview || "No messages yet"}</p>
                    <p className="text-xs text-gray-400 mt-1">{room.last_active_display || "No activity yet"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setSidebarPage((p) => Math.max(1, p - 1))}
            disabled={sidebarPage === 1 || loadingRooms}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-500">
            Page <span className="font-medium text-gray-700">{sidebarPage}</span> of{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </span>
          <button
            onClick={() => setSidebarPage((p) => Math.min(totalPages, p + 1))}
            disabled={sidebarPage === totalPages || loadingRooms}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white font-medium overflow-hidden">
                  {selectedRoom.profile_picture ? (
                    <img src={selectedRoom.profile_picture} alt={displayName(selectedRoom)} className="w-full h-full object-cover" />
                  ) : (
                    initialsFor(selectedRoom)
                  )}
                </div>
                <Circle
                  className={`absolute bottom-0 right-0 w-3 h-3 ${
                    isRoomOnline(selectedRoom) ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{displayName(selectedRoom)}</p>
                <p className="text-xs text-gray-500">{selectedRoom.last_active_display || "No activity yet"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to={`/users/${selectedRoom.user_id}`}
                title="View full profile"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </Link>
              <button
                onClick={() => setShowInfoPopup(true)}
                title="Profile overview"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            onScroll={handleScrollMessages}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
          >
            {hasOlderMessages && (
              <div className="flex justify-center" onMouseEnter={() => void loadOlderMessages()}>
                <button
                  type="button"
                  onClick={() => void loadOlderMessages()}
                  disabled={loadingOlder}
                  className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {loadingOlder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Load previous messages
                </button>
              </div>
            )}

            {loadingMessages ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
                Loading messages...
              </div>
            ) : messageError && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-red-600">{messageError}</div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">No messages yet.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_is_admin ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      message.sender_is_admin
                        ? "bg-[#415192] text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                    {message.attachment_name && (
                      <button
                        type="button"
                        onClick={() => void handleDownload(message)}
                        className={`mt-2 inline-flex items-center gap-2 rounded-md px-3 py-2 ${
                          message.sender_is_admin
                            ? "bg-white/10 border border-white/20"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <Paperclip className={`w-4 h-4 ${message.sender_is_admin ? "text-white/80" : "text-gray-500"}`} />
                        <span className={`text-sm ${message.sender_is_admin ? "text-white/80" : "text-gray-700"}`}>
                          {message.attachment_name}
                        </span>
                        {downloadingId === message.id ? (
                          <Loader2 className={`w-4 h-4 animate-spin ${message.sender_is_admin ? "text-white/80" : "text-gray-500"}`} />
                        ) : (
                          <Download className={`w-4 h-4 ${message.sender_is_admin ? "text-white/80" : "text-gray-500"}`} />
                        )}
                      </button>
                    )}
                    <p className={`text-xs mt-1 ${message.sender_is_admin ? "text-white/70" : "text-gray-500"}`}>
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}

            {messageError && messages.length > 0 && (
              <div className="text-xs text-red-600 text-center">{messageError}</div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-white shrink-0">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            {fileAttachment && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-sm text-gray-700">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="truncate max-w-xs">{fileAttachment.name}</span>
                <button
                  type="button"
                  onClick={() => setFileAttachment(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleAttachClick}
                className="p-2 bg-[#F9FAFB] border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] resize-none"
              />
              <button
                onClick={() => void handleSendMessage()}
                disabled={sending || (!messageText.trim() && !fileAttachment)}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        </div>
      )}

      {showInfoPopup && selectedRoom && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowInfoPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#415192] to-[#ACB5DA] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Profile Overview</h3>
                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center text-white text-2xl font-semibold shrink-0 overflow-hidden">
                  {(selectedProfile?.profile_picture ?? selectedRoom.profile_picture) ? (
                    <img
                      src={selectedProfile?.profile_picture ?? selectedRoom.profile_picture ?? ""}
                      alt={popupName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initialsFor(selectedRoom)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg leading-tight truncate">{popupName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${isRoomOnline(selectedRoom) ? "bg-green-400" : "bg-white/50"}`} />
                    <span className="text-sm text-white/80">{selectedRoom.last_active_display || "No activity yet"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {loadingProfile ? (
                <div className="py-10 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
                  Loading profile...
                </div>
              ) : profileError ? (
                <p className="text-sm text-red-600 text-center py-2">{profileError}</p>
              ) : selectedProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Code Name</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.codename || "-"}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Verified</p>
                      <p className={`text-sm font-semibold ${selectedProfile.is_verified ? "text-green-600" : "text-red-600"}`}>
                        {selectedProfile.is_verified ? "Verified" : "Unverified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Age</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.age ?? "-"}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                      <p className="text-sm font-semibold text-gray-900">{formatRole(selectedProfile.gender)}</p>
                    </div>
                  </div>

                  <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BadgeCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {selectedProfile.email || "-"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {formatLocation(selectedProfile)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {formatRole(selectedProfile.subscription_plan)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-gray-500">Profile Completion</p>
                      <p className="text-xs font-semibold text-[#415192]">{profileCompletion}%</p>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#415192] h-2 rounded-full transition-all"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No extended profile data available.</p>
              )}

              <Link
                to={`/users/${selectedRoom.user_id}`}
                onClick={() => setShowInfoPopup(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#415192] text-white rounded-xl font-medium hover:bg-[#354177] transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View Full Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
