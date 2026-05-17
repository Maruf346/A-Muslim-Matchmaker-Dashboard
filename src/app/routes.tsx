import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./components/Dashboard";
import { Users } from "./components/Users";
import { UserDetail } from "./components/UserDetail";
import { Matchmaking } from "./components/Matchmaking";
import { Requests } from "./components/Requests";
import { Matches } from "./components/Matches";
import { Leads } from "./components/Leads";
import { CustomFields } from "./components/CustomFields";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { Profile } from "./components/Profile";
import { Chat } from "./components/Chat";
import { Subscriptions } from "./components/Subscriptions";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: Users },
      { path: "users/:id", Component: UserDetail },
      { path: "matchmaking", Component: Matchmaking },
      { path: "requests", Component: Requests },
      { path: "matches", Component: Matches },
      { path: "leads", Component: Leads },
      { path: "chat", Component: Chat },
      { path: "subscriptions", Component: Subscriptions },
      { path: "custom-fields", Component: CustomFields },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
      { path: "profile", Component: Profile },
    ],
  },
]);
