import { useState } from "react";
import { Search, Send, MoreVertical, Circle, Phone, Video, Info } from "lucide-react";

interface User {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: number;
  text: string;
  time: string;
  isAdmin: boolean;
}

const mockUsers: User[] = [
  { id: 1, name: "Sarah Ahmed", avatar: "S", online: true, lastMessage: "Thank you for your help!", lastMessageTime: "2m ago", unreadCount: 2 },
  { id: 2, name: "Mohammed Ali", avatar: "M", online: true, lastMessage: "When will my profile be approved?", lastMessageTime: "15m ago", unreadCount: 1 },
  { id: 3, name: "Fatima Khan", avatar: "F", online: false, lastMessage: "I need to update my preferences", lastMessageTime: "1h ago", unreadCount: 0 },
  { id: 4, name: "Ahmed Hassan", avatar: "A", online: false, lastMessage: "Thanks for the match suggestion", lastMessageTime: "3h ago", unreadCount: 0 },
  { id: 5, name: "Aisha Rahman", avatar: "A", online: true, lastMessage: "Can I change my profile photo?", lastMessageTime: "5h ago", unreadCount: 0 },
  { id: 6, name: "Omar Farooq", avatar: "O", online: false, lastMessage: "How do I add more details?", lastMessageTime: "Yesterday", unreadCount: 0 },
  { id: 7, name: "Zainab Malik", avatar: "Z", online: true, lastMessage: "Is there a mobile app?", lastMessageTime: "Yesterday", unreadCount: 0 },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1, senderId: 1, text: "Hello, I need help with my profile", time: "10:30 AM", isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Sarah! I'd be happy to help. What do you need assistance with?", time: "10:32 AM", isAdmin: true },
    { id: 3, senderId: 1, text: "I want to add more photos to my profile", time: "10:33 AM", isAdmin: false },
    { id: 4, senderId: 0, text: "You can upload up to 5 photos in your profile settings. Go to Profile > Photos > Upload", time: "10:35 AM", isAdmin: true },
    { id: 5, senderId: 1, text: "Thank you for your help!", time: "10:36 AM", isAdmin: false },
  ],
  2: [
    { id: 1, senderId: 2, text: "When will my profile be approved?", time: "11:00 AM", isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Mohammed! I'm reviewing your profile now. It should be approved within the next hour.", time: "11:15 AM", isAdmin: true },
  ],
  3: [
    { id: 1, senderId: 3, text: "I need to update my preferences", time: "2:00 PM", isAdmin: false },
  ],
};

export function Chat() {
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Record<number, Message[]>>(mockMessages);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: (messages[selectedUser.id]?.length || 0) + 1,
      senderId: 0,
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isAdmin: true,
    };

    setMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));

    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-[#FFFFFF]">
      {/* Users List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-[#F9FAFB]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                selectedUser?.id === user.id ? "bg-[#415192]/10" : "hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#415192] flex items-center justify-center text-white">
                    {user.avatar}
                  </div>
                  <Circle
                    className={`absolute bottom-0 right-0 w-3 h-3 ${
                      user.online ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    {user.unreadCount > 0 && (
                      <span className="bg-[#415192] text-white text-xs px-2 py-0.5 rounded-full">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">{user.lastMessageTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white">
                  {selectedUser.avatar}
                </div>
                <Circle
                  className={`absolute bottom-0 right-0 w-3 h-3 ${
                    selectedUser.online ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedUser.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Info className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {(messages[selectedUser.id] || []).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
                    message.isAdmin
                      ? "bg-[#415192] text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isAdmin ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
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
    </div>
  );
}
