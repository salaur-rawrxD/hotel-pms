import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "../store/authStore.js";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Separator } from "../components/ui/separator.jsx";

const DEV_ACCOUNTS = [
  { role: "Admin",        icon: "👑", email: "admin@meridian.com" },
  { role: "Manager",      icon: "📋", email: "manager@meridian.com" },
  { role: "Front Desk",   icon: "🛎️", email: "frontdesk1@meridian.com" },
  { role: "Housekeeping", icon: "🧹", email: "housekeeping1@meridian.com" },
];

const FEATURES = [
  "Full front desk operations",
  "500+ distribution channels",
  "Real-time housekeeping management",
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

  const clearErrorOnEdit = (setter) => (event) => {
    setter(event.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (event) => {
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
  };

  const prefillAccount = (account) => {
    setEmail(account.email);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="login-shell">
      {/* Left panel */}
      <aside className="login-left">
        <div>
          <div
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: "hsl(var(--gold) / 0.15)" }}
          >
            <Building2 className="h-7 w-7" style={{ color: "hsl(var(--gold))" }} />
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-none tracking-tight text-white">
            Fair
            <span className="text-gold">bridge</span>
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Cloud property management for modern hotels
          </p>
        </div>

        <div className="space-y-5">
          <div
            className="h-px w-16"
            style={{ background: "hsl(var(--gold) / 0.4)" }}
          />
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{ background: "hsl(var(--teal) / 0.25)" }}
                >
                  <Check className="h-3 w-3 text-teal-light" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
          Fairbridge PMS · v1.0
        </p>
      </aside>

      {/* Right panel */}
      <main className="login-right">
        <div className="login-card">
          <header>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your dashboard
            </p>
          </header>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@fairbridgehotel.com"
                value={email}
                onChange={clearErrorOnEdit(setEmail)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={clearErrorOnEdit(setPassword)}
                  className="pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in to Dashboard"
              )}
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-3">
                <Separator className="flex-1" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick access — test accounts
                </p>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-1.5 rounded-lg border bg-muted/30 p-2">
                {DEV_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => prefillAccount(a)}
                    className="flex items-center justify-between rounded-md border border-transparent bg-background px-3 py-2 text-left text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{a.icon}</span>
                      <span className="font-semibold text-foreground">
                        {a.role}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
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
