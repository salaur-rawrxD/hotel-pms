import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";

import { Button } from "../components/ui/button.jsx";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Compass className="h-10 w-10 text-muted-foreground" />
      </div>

      <p className="font-serif text-5xl font-bold leading-none text-foreground">
        404
      </p>
      <h1 className="mt-3 text-xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Button className="mt-6" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </div>
  );
}
