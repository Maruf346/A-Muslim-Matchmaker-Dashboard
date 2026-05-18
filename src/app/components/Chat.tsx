import { useState } from "react";
import { Link } from "react-router";
import { Search, Send, Circle, Info, Eye, MessageCircle, ChevronLeft, ChevronRight, X, MapPin, Briefcase } from "lucide-react";
// import { Phone, Video } from "lucide-react"; // commented out — not needed
import { mockUsers as profileData } from "../data/mockUsers";

interface User {
  id: number;
  name: string;
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

const SIDEBAR_PAGE_SIZE = 5;

const chatContacts: User[] = [
  { id: 1,  name: "Sarah Ahmed",      online: true,  lastMessage: "By the way, is there a mobile app coming?",      lastMessageTime: "2m ago",   unreadCount: 2 },
  { id: 2,  name: "Mohammed Ali",     online: true,  lastMessage: "When will my profile be approved?",              lastMessageTime: "10m ago",  unreadCount: 1 },
  { id: 3,  name: "Fatima Khan",      online: false, lastMessage: "I don't see that option on mobile",              lastMessageTime: "45m ago",  unreadCount: 0 },
  { id: 4,  name: "Ahmed Hassan",     online: false, lastMessage: "How do I send her a contact request?",           lastMessageTime: "2h ago",   unreadCount: 0 },
  { id: 5,  name: "Aisha Rahman",     online: true,  lastMessage: "Perfect, thank you!",                            lastMessageTime: "3h ago",   unreadCount: 0 },
  { id: 6,  name: "Omar Farooq",      online: false, lastMessage: "I can't find the family information section",    lastMessageTime: "5h ago",   unreadCount: 0 },
  { id: 7,  name: "Zainab Malik",     online: true,  lastMessage: "When is the expected launch?",                   lastMessageTime: "Yesterday",unreadCount: 0 },
  { id: 8,  name: "Ibrahim Yusuf",    online: false, lastMessage: "I'll try a different photo. Thanks.",            lastMessageTime: "Yesterday",unreadCount: 0 },
  { id: 9,  name: "Nadia Hussain",    online: false, lastMessage: "Great, that's reassuring. I'll respond to them.",lastMessageTime: "2 days",   unreadCount: 0 },
  { id: 10, name: "Khalid Al-Rashid", online: false, lastMessage: "How long can I keep it paused?",                 lastMessageTime: "2 days",   unreadCount: 0 },
  { id: 11, name: "Maryam Chaudhry",  online: true,  lastMessage: "Thank you for taking action.",                   lastMessageTime: "3 days",   unreadCount: 3 },
  { id: 12, name: "Tariq Siddiqui",   online: false, lastMessage: "Can I adjust the algorithm's criteria?",         lastMessageTime: "3 days",   unreadCount: 0 },
  { id: 13, name: "Hina Baig",        online: false, lastMessage: "Fixed it, thank you!",                           lastMessageTime: "4 days",   unreadCount: 0 },
  { id: 14, name: "Yusuf Osman",      online: false, lastMessage: "I'd prefer to find someone nearby if possible.", lastMessageTime: "4 days",   unreadCount: 0 },
  { id: 15, name: "Ruqayyah Patel",   online: true,  lastMessage: "Can I specify I want to marry after my studies?",lastMessageTime: "5 days",   unreadCount: 0 },
  { id: 16, name: "Bilal Mahmoud",    online: false, lastMessage: "And what about photos?",                         lastMessageTime: "5 days",   unreadCount: 0 },
  { id: 17, name: "Safia Jama",       online: true,  lastMessage: "That's very helpful, jazakAllah khair",          lastMessageTime: "6 days",   unreadCount: 1 },
  { id: 18, name: "Hamid Qureshi",    online: false, lastMessage: "Okay understood. Please add it soon!",           lastMessageTime: "1 week",   unreadCount: 0 },
  { id: 19, name: "Leila Benali",     online: false, lastMessage: "My profile ID is #0019",                         lastMessageTime: "1 week",   unreadCount: 0 },
  { id: 20, name: "Dawud Thompson",   online: true,  lastMessage: "That's really important to me. Alhamdulillah!",  lastMessageTime: "1 week",   unreadCount: 0 },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1,  senderId: 1, text: "Hello, I need help with my profile",                                                                            time: "10:30 AM", isAdmin: false },
    { id: 2,  senderId: 0, text: "Hi Sarah! I'd be happy to help. What do you need assistance with?",                                              time: "10:32 AM", isAdmin: true  },
    { id: 3,  senderId: 1, text: "I want to add more photos to my profile",                                                                        time: "10:33 AM", isAdmin: false },
    { id: 4,  senderId: 0, text: "You can upload up to 5 photos in your profile settings. Go to Profile > Photos > Upload.",                       time: "10:35 AM", isAdmin: true  },
    { id: 5,  senderId: 1, text: "Thank you! Also, I received a match suggestion. How do I view it?",                                              time: "10:36 AM", isAdmin: false },
    { id: 6,  senderId: 0, text: "Go to your Matches section. You'll see all suggested matches there. Let me know if you need anything else!",     time: "10:38 AM", isAdmin: true  },
    { id: 7,  senderId: 1, text: "Got it, thanks so much!",                                                                                        time: "10:39 AM", isAdmin: false },
    { id: 8,  senderId: 1, text: "By the way, is there a mobile app coming?",                                                                      time: "10:40 AM", isAdmin: false },
  ],
  2: [
    { id: 1, senderId: 2, text: "When will my profile be approved?",                                                                               time: "11:00 AM", isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Mohammed! I'm reviewing your profile now. It should be approved within the next hour.",                        time: "11:15 AM", isAdmin: true  },
    { id: 3, senderId: 2, text: "When will my profile be approved?",                                                                               time: "11:30 AM", isAdmin: false },
  ],
  3: [
    { id: 1, senderId: 3, text: "I need to update my preferences",                                                                                  time: "2:00 PM",  isAdmin: false },
    { id: 2, senderId: 0, text: "Hello Fatima! You can update your partner preferences in your Profile section under Preferences.",                 time: "2:05 PM",  isAdmin: true  },
    { id: 3, senderId: 3, text: "I don't see that option on mobile",                                                                                time: "2:08 PM",  isAdmin: false },
  ],
  4: [
    { id: 1, senderId: 4, text: "Thanks for the match suggestion!",                                                                                 time: "9:00 AM",  isAdmin: false },
    { id: 2, senderId: 0, text: "You're welcome Ahmed! We thought it would be a great match based on your preferences.",                            time: "9:10 AM",  isAdmin: true  },
    { id: 3, senderId: 4, text: "How do I send her a contact request?",                                                                             time: "9:12 AM",  isAdmin: false },
  ],
  5: [
    { id: 1, senderId: 5, text: "Can I change my profile photo?",                                                                                   time: "8:30 AM",  isAdmin: false },
    { id: 2, senderId: 0, text: "Yes Aisha! Go to Profile > Edit > Change Photo. The new photo will be reviewed before going live.",                time: "8:35 AM",  isAdmin: true  },
    { id: 3, senderId: 5, text: "How long does the review take?",                                                                                   time: "8:36 AM",  isAdmin: false },
    { id: 4, senderId: 0, text: "Usually within 24 hours. We ensure all photos meet our community guidelines.",                                     time: "8:40 AM",  isAdmin: true  },
    { id: 5, senderId: 5, text: "Perfect, thank you!",                                                                                              time: "8:41 AM",  isAdmin: false },
  ],
  6: [
    { id: 1, senderId: 6, text: "How do I add more details to my profile?",                                                                         time: "3:00 PM",  isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Omar! Go to your profile and click 'Edit Profile'. You can add family info, education and more.",               time: "3:05 PM",  isAdmin: true  },
    { id: 3, senderId: 6, text: "I can't find the family information section",                                                                      time: "3:07 PM",  isAdmin: false },
  ],
  7: [
    { id: 1, senderId: 7, text: "Is there a mobile app available?",                                                                                 time: "4:00 PM",  isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Zainab! A mobile app is in development and will be available soon. Our website is mobile-friendly for now.",   time: "4:05 PM",  isAdmin: true  },
    { id: 3, senderId: 7, text: "When is the expected launch?",                                                                                     time: "4:06 PM",  isAdmin: false },
  ],
  8: [
    { id: 1, senderId: 8, text: "My profile photo wasn't approved. Can you tell me why?",                                                           time: "1:00 PM",  isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Ibrahim! Photos with excessive background activity or non-compliant attire may be declined. Please try a clear, appropriate photo.", time: "1:10 PM", isAdmin: true },
    { id: 3, senderId: 8, text: "I'll try a different photo. Thanks.",                                                                              time: "1:12 PM",  isAdmin: false },
  ],
  9: [
    { id: 1, senderId: 9, text: "I received a contact request. Is this person verified?",                                                           time: "10:00 AM", isAdmin: false },
    { id: 2, senderId: 0, text: "Hi Nadia! Yes, all profiles go through a verification process. The user who sent the request has been verified.",  time: "10:05 AM", isAdmin: true  },
    { id: 3, senderId: 9, text: "Great, that's reassuring. I'll respond to them.",                                                                  time: "10:06 AM", isAdmin: false },
    { id: 4, senderId: 0, text: "Wonderful! Feel free to reach out if you have any questions about the matching process.",                          time: "10:08 AM", isAdmin: true  },
  ],
  10: [
    { id: 1, senderId: 10, text: "Can I pause my profile for a while?",                                                                             time: "9:30 AM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Khalid! Yes, you can set your profile to 'Inactive' from account settings. You can reactivate anytime.",      time: "9:35 AM",  isAdmin: true  },
    { id: 3, senderId: 10, text: "How long can I keep it paused?",                                                                                  time: "9:37 AM",  isAdmin: false },
    { id: 4, senderId: 0,  text: "As long as you need. Your profile and all data will be saved.",                                                    time: "9:40 AM",  isAdmin: true  },
  ],
  11: [
    { id: 1, senderId: 11, text: "I want to report a user for inappropriate messages",                                                              time: "2:00 PM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Maryam! I'm sorry to hear that. Please go to the user's profile and click 'Report'. We take this very seriously.", time: "2:05 PM", isAdmin: true },
    { id: 3, senderId: 11, text: "I've done that. What happens next?",                                                                              time: "2:07 PM",  isAdmin: false },
    { id: 4, senderId: 0,  text: "Our team will review the report within 24 hours. The user will be suspended pending investigation.",              time: "2:10 PM",  isAdmin: true  },
    { id: 5, senderId: 11, text: "Thank you for taking action.",                                                                                    time: "2:11 PM",  isAdmin: false },
    { id: 6, senderId: 11, text: "One more thing — can I block them directly?",                                                                     time: "2:12 PM",  isAdmin: false },
    { id: 7, senderId: 11, text: "Or do I have to wait for the review?",                                                                            time: "2:13 PM",  isAdmin: false },
  ],
  12: [
    { id: 1, senderId: 12, text: "How do match suggestions work?",                                                                                  time: "11:00 AM", isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Tariq! Our algorithm considers your preferences, location, age range, and compatibility when suggesting matches.", time: "11:05 AM", isAdmin: true },
    { id: 3, senderId: 12, text: "Can I adjust the algorithm's criteria?",                                                                          time: "11:07 AM", isAdmin: false },
  ],
  13: [
    { id: 1, senderId: 13, text: "My account shows a warning. What does it mean?",                                                                  time: "10:00 AM", isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Hina! Could you describe what it says? It might be a profile completion reminder.",                             time: "10:05 AM", isAdmin: true  },
    { id: 3, senderId: 13, text: "It says 'Profile requires attention'",                                                                            time: "10:06 AM", isAdmin: false },
    { id: 4, senderId: 0,  text: "That means some required fields are empty. Please check Personal Details and fill in any missing information.",   time: "10:08 AM", isAdmin: true  },
    { id: 5, senderId: 13, text: "Fixed it, thank you!",                                                                                            time: "10:10 AM", isAdmin: false },
  ],
  14: [
    { id: 1, senderId: 14, text: "Are there any members from East Africa on the platform?",                                                         time: "9:00 AM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Yusuf! Yes, we have members from Kenya, Tanzania, Uganda and other East African countries.",                   time: "9:05 AM",  isAdmin: true  },
    { id: 3, senderId: 14, text: "I'd prefer to find someone nearby if possible.",                                                                  time: "9:07 AM",  isAdmin: false },
    { id: 4, senderId: 0,  text: "You can set a location preference in your partner preferences to narrow your matches geographically.",            time: "9:10 AM",  isAdmin: true  },
  ],
  15: [
    { id: 1, senderId: 15, text: "I'm a student — does the platform have age restrictions?",                                                        time: "3:30 PM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Ruqayyah! The platform is open to anyone 18 and above. Your profile clearly shows your current status.",      time: "3:35 PM",  isAdmin: true  },
    { id: 3, senderId: 15, text: "Can I specify I want to marry after my studies?",                                                                 time: "3:37 PM",  isAdmin: false },
    { id: 4, senderId: 0,  text: "Absolutely! You can add a personal note in your profile bio explaining your timeline preferences.",               time: "3:40 PM",  isAdmin: true  },
  ],
  16: [
    { id: 1, senderId: 16, text: "How secure is my personal information?",                                                                          time: "1:00 PM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Bilal! We take privacy very seriously. Your contact details are never shared without your explicit consent.",  time: "1:05 PM",  isAdmin: true  },
    { id: 3, senderId: 16, text: "And what about photos?",                                                                                          time: "1:06 PM",  isAdmin: false },
  ],
  17: [
    { id: 1, senderId: 17, text: "Can I contact the matchmaker directly for guidance?",                                                             time: "11:00 AM", isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Safia! That's exactly what this chat is for! What guidance do you need?",                                     time: "11:05 AM", isAdmin: true  },
    { id: 3, senderId: 17, text: "I'm unsure about accepting a match suggestion. Any advice?",                                                      time: "11:07 AM", isAdmin: false },
    { id: 4, senderId: 0,  text: "Take your time! Review their full profile, preferences, and bio. There's no pressure to decide quickly.",        time: "11:10 AM", isAdmin: true  },
    { id: 5, senderId: 17, text: "That's very helpful, jazakAllah khair",                                                                           time: "11:11 AM", isAdmin: false },
    { id: 6, senderId: 0,  text: "WaiyyakI! Don't hesitate to reach out anytime.",                                                                  time: "11:12 AM", isAdmin: true  },
    { id: 7, senderId: 17, text: "Will do! One last thing — how do I know if a profile has been verified?",                                         time: "11:14 AM", isAdmin: false },
  ],
  18: [
    { id: 1, senderId: 18, text: "Can I hide my profile from specific countries?",                                                                  time: "10:00 AM", isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Hamid! Country-based visibility filtering isn't available yet but it's on our roadmap.",                      time: "10:05 AM", isAdmin: true  },
    { id: 3, senderId: 18, text: "Okay understood. Please add it soon!",                                                                            time: "10:06 AM", isAdmin: false },
    { id: 4, senderId: 0,  text: "Noted! We'll keep you updated on new features.",                                                                  time: "10:08 AM", isAdmin: true  },
  ],
  19: [
    { id: 1, senderId: 19, text: "I updated my profile but the changes don't show",                                                                 time: "2:00 PM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Leila! Profile changes may take a few minutes. If the issue persists after 30 minutes, let us know.",         time: "2:05 PM",  isAdmin: true  },
    { id: 3, senderId: 19, text: "It's been an hour and still not updated",                                                                         time: "3:10 PM",  isAdmin: false },
    { id: 4, senderId: 0,  text: "I'll escalate this to our technical team right away. Please provide your profile ID.",                            time: "3:12 PM",  isAdmin: true  },
    { id: 5, senderId: 19, text: "My profile ID is #0019",                                                                                          time: "3:13 PM",  isAdmin: false },
    { id: 6, senderId: 0,  text: "Got it! We'll have this resolved within 2 hours. Apologies for the inconvenience!",                              time: "3:15 PM",  isAdmin: true  },
  ],
  20: [
    { id: 1, senderId: 20, text: "Is the platform halal and sharia compliant?",                                                                     time: "9:00 AM",  isAdmin: false },
    { id: 2, senderId: 0,  text: "Hi Dawud! Yes, our platform follows Islamic marriage guidance and encourages the proper wali process.",           time: "9:05 AM",  isAdmin: true  },
    { id: 3, senderId: 20, text: "That's really important to me. Alhamdulillah!",                                                                   time: "9:06 AM",  isAdmin: false },
    { id: 4, senderId: 0,  text: "We share those values. Our platform is built specifically for Muslim matrimonial matching.",                      time: "9:08 AM",  isAdmin: true  },
  ],
};

export function Chat() {
  const [selectedUser, setSelectedUser] = useState<User | null>(chatContacts[0]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [messageText, setMessageText]   = useState("");
  const [messages, setMessages]         = useState<Record<number, Message[]>>(mockMessages);
  const [sidebarPage, setSidebarPage]   = useState(1);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const filteredContacts = chatContacts.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages       = Math.max(1, Math.ceil(filteredContacts.length / SIDEBAR_PAGE_SIZE));
  const paginatedContacts = filteredContacts.slice(
    (sidebarPage - 1) * SIDEBAR_PAGE_SIZE,
    sidebarPage * SIDEBAR_PAGE_SIZE
  );

  const selectedProfile = selectedUser ? profileData.find((u) => u.id === selectedUser.id) : null;

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;
    const newMessage: Message = {
      id: (messages[selectedUser.id]?.length || 0) + 1,
      senderId: 0,
      text: messageText,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      isAdmin: true,
    };
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-[#FFFFFF]">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-[#F9FAFB]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSidebarPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {paginatedContacts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
          ) : (
            paginatedContacts.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? "bg-[#415192]/10" : "hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#415192] flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
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
                        <span className="bg-[#415192] text-white text-xs px-2 py-0.5 rounded-full shrink-0 ml-1">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{user.lastMessageTime}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setSidebarPage((p) => Math.max(1, p - 1))}
            disabled={sidebarPage === 1}
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
            disabled={sidebarPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ── Chat Area ────────────────────────────────────── */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white font-medium">
                  {selectedUser.name.charAt(0)}
                </div>
                <Circle
                  className={`absolute bottom-0 right-0 w-3 h-3 ${
                    selectedUser.online ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.online ? "Online" : "Offline"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Phone className="w-5 h-5 text-gray-600" /></button> */}
              {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Video className="w-5 h-5 text-gray-600" /></button> */}

              <Link
                to={`/users/${selectedUser.id}`}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {(messages[selectedUser.id] || []).map((message) => (
              <div key={message.id} className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
                    message.isAdmin
                      ? "bg-[#415192] text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isAdmin ? "text-white/70" : "text-gray-500"}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white shrink-0">
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

      {/* ── Info / Profile Overview Popup ────────────────── */}
      {showInfoPopup && selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowInfoPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
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
                <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center text-white text-2xl font-semibold shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg leading-tight">{selectedUser.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${selectedUser.online ? "bg-green-400" : "bg-white/50"}`} />
                    <span className="text-sm text-white/80">{selectedUser.online ? "Online now" : "Offline"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile details */}
            <div className="p-5 space-y-4">
              {selectedProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Age</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.age} years</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Status</p>
                      <p className={`text-sm font-semibold ${selectedProfile.status === "Active" ? "text-green-600" : "text-gray-500"}`}>
                        {selectedProfile.status}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {selectedProfile.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {selectedProfile.profession}
                    </div>
                  </div>

                  {/* Profile completion */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-gray-500">Profile Completion</p>
                      <p className="text-xs font-semibold text-[#415192]">{selectedProfile.completion}%</p>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#415192] h-2 rounded-full transition-all"
                        style={{ width: `${selectedProfile.completion}%` }}
                      />
                    </div>
                  </div>

                  {/* Last activity */}
                  {selectedProfile.recentActivity.length > 0 && (
                    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 mb-1">Last Activity</p>
                      <p className="text-sm text-gray-700">{selectedProfile.recentActivity[selectedProfile.recentActivity.length - 1].event}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedProfile.recentActivity[selectedProfile.recentActivity.length - 1].time}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No extended profile data available.</p>
              )}

              <Link
                to={`/users/${selectedUser.id}`}
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
