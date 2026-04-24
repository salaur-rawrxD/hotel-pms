import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore.js";

export default function Unauthorized() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "#f9f6f0" }}
    >
      <p
        className="font-serif font-black leading-none"
        style={{ fontSize: "6rem", color: "#c9a84c" }}
      >
        403
      </p>
      <h1
        className="mt-3 font-serif text-2xl font-semibold"
        style={{ color: "#0f1c2e" }}
      >
        Access Restricted
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
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
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-dark"
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-slate-300 bg-transparent px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
