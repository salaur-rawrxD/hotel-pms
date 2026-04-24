import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { isAuthenticated, loginAsync, isLoggingIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname ?? "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    try {
      await loginAsync({ email: email.trim(), password });
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          "Sign-in failed. Check your credentials and try again.",
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-teal-dark p-6">
      <div className="w-full max-w-md rounded-2xl border border-navy-700 bg-navy-800/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gold font-serif text-2xl font-black text-navy-900">
            M
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-50">
            The Meridian
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Property Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@meridian.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="gold"
            className="w-full"
            loading={isLoggingIn}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Seeded logins end in <code>@meridian.test</code> · password{" "}
          <code>password123</code>
        </p>
      </div>
    </div>
  );
}
