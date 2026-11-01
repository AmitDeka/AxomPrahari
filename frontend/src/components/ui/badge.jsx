import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-traffic-red/15 text-traffic-red border border-traffic-red/20 hover:bg-traffic-red/25",
        outline: "text-foreground",
        success:
          "border-transparent bg-traffic-green/15 text-traffic-green border border-traffic-green/20 hover:bg-traffic-green/25",
        warning:
          "border-transparent bg-traffic-amber/15 text-traffic-amber border border-traffic-amber/20 hover:bg-traffic-amber/25",
        info: "border-transparent bg-blue-500/15 text-blue-500 border border-blue-500/20 hover:bg-blue-500/25",
        gold: "border-transparent bg-primary/15 text-secondary-gold dark:text-primary-gold border border-primary/25 hover:bg-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
