import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

import { Button } from "../components/ui/button.jsx";
import { useAuthStore } from "../store/authStore.js";

export default function Unauthorized() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <ShieldOff className="h-10 w-10 text-red-500/70" />
      </div>

      <p className="font-serif text-5xl font-bold leading-none text-foreground">
        403
      </p>
      <h1 className="mt-3 text-xl font-semibold text-foreground">
        Access Restricted
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your role
        {user?.role ? (
          <>
            {" "}
            (<span className="font-semibold">{user.role}</span>)
          </>
        ) : null}{" "}
        doesn't have permission to view this page.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        <Button variant="outline" onClick={() => logout()}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
