import { getAccessToken } from "../lib/authStorage";
import { apiRequest } from "./client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://api.amuslimmatchmaker.com/api";

export interface ChatRoom {
  id: string;
  user_id: string;
  codename: string | null;
  full_name: string | null;
  profile_picture: string | null;
  role: string | null;
  last_active: string | null;
  last_active_display: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface ChatRoomListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatRoom[];
}

export interface ChatMessage {
  id: string;
  room: string;
  sender_id: string;
  sender_codename: string | null;
  sender_name: string | null;
  sender_is_admin: boolean;
  text: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ChatMessageListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
}

export interface MarkChatRoomReadResponse {
  marked_count: number;
}

export type ChatWebSocketPayload =
  | {
      type: "chat_message";
      message: ChatMessage;
    }
  | {
      type: "read_receipt";
      message_ids?: string[];
      room?: string;
    }
  | Record<string, unknown>;

function appendParams(params: URLSearchParams, values: Record<string, string | number | undefined>) {
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    params.set(key, String(value));
  });
}

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${base}${normalizedPath}`;
}

export function listChatRooms(params: {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  appendParams(searchParams, params);

  const query = searchParams.toString();

  return apiRequest<ChatRoomListResponse | null>(`chat/admin/rooms/${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function getChatRoom(id: string) {
  return apiRequest<ChatRoom | null>(`chat/admin/rooms/${id}/`, {
    method: "GET",
    auth: true,
  });
}

export function listChatMessages(roomId: string, params: { page?: number; page_size?: number } = {}) {
  const searchParams = new URLSearchParams();
  appendParams(searchParams, params);

  const query = searchParams.toString();

  return apiRequest<ChatMessageListResponse | null>(
    `chat/admin/rooms/${roomId}/messages/${query ? `?${query}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export function sendChatMessage(roomId: string, payload: { text?: string; attachment?: File | null }) {
  const formData = new FormData();
  if (payload.text) formData.set("text", payload.text);
  if (payload.attachment instanceof File) formData.set("attachment", payload.attachment);

  return apiRequest<ChatMessage>(`chat/admin/rooms/${roomId}/messages/`, {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export function markChatRoomRead(roomId: string) {
  return apiRequest<MarkChatRoomReadResponse | null>(`chat/admin/rooms/${roomId}/mark-read/`, {
    method: "POST",
    auth: true,
  });
}

export async function downloadChatAttachment(roomId: string, messageId: string, fallbackName = "attachment") {
  const token = getAccessToken();
  const response = await fetch(buildApiUrl(`chat/admin/rooms/${roomId}/messages/${messageId}/download/`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error("Unable to download attachment.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
  const fileName = decodeURIComponent(match?.[1] ?? match?.[2] ?? fallbackName);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildChatWebSocketUrl(roomId: string) {
  const token = getAccessToken();
  const apiRoot = API_BASE_URL.replace(/\/api\/?$/, "");
  const url = new URL(apiRoot);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `/ws/chat/${roomId}/`;
  if (token) url.searchParams.set("token", token);
  return url.toString();
}
