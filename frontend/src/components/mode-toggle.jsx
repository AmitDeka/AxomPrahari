"use client";

import * as React from "react";
import { MoonIcon, SunIcon, LaptopIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ModeToggle({ variant = "outline", size = "icon" }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className="relative size-9 rounded-lg">
        <SunIcon className="size-4 opacity-50" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="relative size-9 rounded-lg border-border hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
          title={`Theme: ${theme || "system"}`}
        >
          <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-traffic-amber" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl border border-border bg-popover shadow-lg">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`cursor-pointer gap-2 ${theme === "light" ? "font-semibold text-primary" : ""}`}
        >
          <SunIcon className="size-4 text-traffic-amber" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`cursor-pointer gap-2 ${theme === "dark" ? "font-semibold text-primary" : ""}`}
        >
          <MoonIcon className="size-4 text-primary" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`cursor-pointer gap-2 ${theme === "system" ? "font-semibold text-primary" : ""}`}
        >
          <LaptopIcon className="size-4 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
