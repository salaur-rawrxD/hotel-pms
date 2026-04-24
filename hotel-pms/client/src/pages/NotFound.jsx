import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "#f9f6f0" }}
    >
      <p
        className="font-serif font-black leading-none"
        style={{ fontSize: "6rem", color: "#0f1c2e" }}
      >
        404
      </p>
      <h1
        className="mt-3 font-serif text-2xl font-semibold"
        style={{ color: "#0f1c2e" }}
      >
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mt-6 rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-dark"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
