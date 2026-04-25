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
} from "lucide-react";

const NAV_LINKS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/create", label: "Create", icon: PlusCircle },
  { to: "/habits", label: "Habits", icon: CheckSquare },
  { to: "/resources", label: "Resources", icon: BookMarked },
  { to: "/inbox", label: "Inbox", icon: Inbox },
];

export default NAV_LINKS;
