import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "../store/authStore.js";

const DEV_ACCOUNTS = [
  { role: "Admin",        icon: "👑", email: "admin@meridian.com" },
  { role: "Manager",      icon: "📋", email: "manager@meridian.com" },
  { role: "Front Desk",   icon: "🛎️", email: "frontdesk1@meridian.com" },
  { role: "Housekeeping", icon: "🧹", email: "housekeeping1@meridian.com" },
];

const FEATURES = [
  "Real-time room management",
  "500+ distribution channels",
  "Automated yield optimization",
];

export default function Login() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (isAuthenticated && !isInitializing) {
    const redirectTo = location.state?.from?.pathname ?? "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  function clearErrorOnEdit(setter) {
    return (event) => {
      setter(event.target.value);
      if (error) setError(null);
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function prefillAccount(account) {
    setEmail(account.email);
    setPassword("password123");
    setError(null);
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL — 40% */}
      <aside
        className="relative hidden w-2/5 flex-col justify-between p-12 text-white md:flex"
        style={{ background: "#0f1c2e" }}
      >
        <div className="flex flex-1 flex-col items-start justify-center gap-6">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl"
            style={{ backgroundColor: "rgba(201, 168, 76, 0.12)" }}
          >
            <Building2 className="h-8 w-8" style={{ color: "#c9a84c" }} />
          </div>

          <h1
            className="font-serif font-bold leading-none"
            style={{ fontSize: "3rem", color: "#c9a84c" }}
          >
            The Meridian
          </h1>

          <p className="text-sm text-white/50">Hotel Management System</p>

          <div className="h-px w-16" style={{ backgroundColor: "#c9a84c" }} />

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{ backgroundColor: "rgba(201, 168, 76, 0.2)" }}
                >
                  <Check className="h-3 w-3" style={{ color: "#c9a84c" }} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
          FairCloud PMS v1.0
        </p>
      </aside>

      {/* RIGHT PANEL — 60% */}
      <main
        className="flex flex-1 items-center justify-center px-6 py-12"
        style={{ background: "#f9f6f0" }}
      >
        <div className="w-full max-w-md">
          <header className="mb-8">
            <h2
              className="font-serif font-bold"
              style={{ fontSize: "2rem", color: "#0f1c2e" }}
            >
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to The Meridian dashboard
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-navy-900"
              >
                Email address
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@meridianhotel.com"
                value={email}
                onChange={clearErrorOnEdit(setEmail)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-navy-900"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={clearErrorOnEdit(setPassword)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-navy-900 placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-navy-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in to Dashboard"
              )}
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-300/60" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Quick access — dev accounts
                </p>
                <div className="h-px flex-1 bg-slate-300/60" />
              </div>
              <div className="grid gap-1.5">
                {DEV_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => prefillAccount(a)}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs transition-colors hover:border-teal/40 hover:bg-teal/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{a.icon}</span>
                      <span className="font-semibold text-navy-900">{a.role}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {a.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
