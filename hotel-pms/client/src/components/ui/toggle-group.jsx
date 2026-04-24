import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "../../lib/utils.js";
import { toggleVariants } from "./toggle.jsx";

const ToggleGroupContext = React.createContext({ size: "default", variant: "default" });

const ToggleGroup = React.forwardRef(function ToggleGroup(
  { className, variant, size, children, ...props },
  ref,
) {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn("flex items-center justify-start gap-1", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});

const ToggleGroupItem = React.forwardRef(function ToggleGroupItem(
  { className, children, variant, size, ...props },
  ref,
) {
  const ctx = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: ctx.variant ?? variant,
          size: ctx.size ?? size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

export { ToggleGroup, ToggleGroupItem };
