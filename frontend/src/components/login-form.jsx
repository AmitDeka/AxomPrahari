"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/admin/login", { email, password });
      if (response.data?.status === "success" && response.data?.token) {
        localStorage.setItem("admin_token", response.data.token);
        router.push("/admin/dashboard");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err) {
      console.error("[Login Error]", err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to Admin Panel</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your credentials to access the admin panel
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-950/20 border border-red-900/30 rounded-md text-center">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="admin@axomprahari.gov.in"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background text-zinc-100 border-zinc-800"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            required
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background text-zinc-100 border-zinc-800"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
