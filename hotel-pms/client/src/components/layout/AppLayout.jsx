import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f1c2e",
            color: "#f8fafc",
            border: "1px solid #1e3048",
          },
          success: {
            iconTheme: { primary: "#c9a84c", secondary: "#0f1c2e" },
          },
        }}
      />
    </div>
  );
}
