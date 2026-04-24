import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-6xl font-black text-gold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-slate-100">
        Page not found
      </h1>
      <p className="mt-1 max-w-md text-sm text-slate-400">
        The page you're looking for doesn't exist or you don't have access to it.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="gold">Back to dashboard</Button>
      </Link>
    </div>
  );
}
