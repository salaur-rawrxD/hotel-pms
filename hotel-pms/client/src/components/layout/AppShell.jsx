import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function AppShell() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
