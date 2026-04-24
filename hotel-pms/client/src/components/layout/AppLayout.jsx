import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import { Toaster } from "../ui/sonner.jsx";
import { TooltipProvider } from "../ui/tooltip.jsx";

export default function AppLayout() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative">
        <Sidebar />
        <div className="page-shell">
          <TopBar />
          <main className="page-content">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
