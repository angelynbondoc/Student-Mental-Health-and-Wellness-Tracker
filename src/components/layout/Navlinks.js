// =============================================================================
// navLinks.js
// Single source of truth for all navigation links and their Lucide icons.
// Imported by TopBar, Sidebar, and BottomNav components.
// =============================================================================
import {
  Home,
  BookOpen,
  PlusCircle,
  CheckSquare,
  BookMarked,
  Inbox,
  Users,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/create", label: "Create", icon: PlusCircle },
  { to: "/habits", label: "Habits", icon: CheckSquare },  
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/resources", label: "Resources", icon: BookMarked },
  { to: "/inbox", label: "Notification", icon: Inbox },
];

export default NAV_LINKS;
