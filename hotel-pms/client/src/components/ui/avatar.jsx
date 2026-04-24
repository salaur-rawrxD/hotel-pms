import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../../lib/utils.js";

const Avatar = React.forwardRef(function Avatar({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
});

const AvatarImage = React.forwardRef(function AvatarImage({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});

const AvatarFallback = React.forwardRef(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

// ── Brand helper ─────────────────────────────────────────

const SIZE_MAP = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-14 w-14 text-lg",
};

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

function UserAvatar({ name, src, size = "md", className, fallbackClassName }) {
  return (
    <Avatar className={cn(SIZE_MAP[size], className)}>
      {src && <AvatarImage src={src} alt={name ?? ""} />}
      <AvatarFallback
        className={cn(
          "bg-teal text-white font-semibold",
          fallbackClassName,
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, getInitials };
