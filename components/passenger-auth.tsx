"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import type { PassengerSession } from "@/lib/passenger-types";

const STORAGE_KEY = "passenger_session";

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as PassengerSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistSession(session: PassengerSession) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function usePassengerSession() {
  const [session, setSessionState] = useState<PassengerSession | null>(() => readStoredSession());

  useEffect(() => {
    let isMounted = true;

    async function syncPassengerSession() {
      try {
        const response = await fetch("/api/passenger/session", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          clearStoredSession();
          if (isMounted) {
            setSessionState(null);
          }
          return;
        }

        const payload = (await response.json()) as { session?: PassengerSession };
        if (!payload.session) {
          clearStoredSession();
          if (isMounted) {
            setSessionState(null);
          }
          return;
        }

        persistSession(payload.session);
        if (isMounted) {
          setSessionState(payload.session);
        }
      } catch {
        if (!readStoredSession() && isMounted) {
          setSessionState(null);
        }
      }
    }

    void syncPassengerSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateSession(value: PassengerSession) {
    persistSession(value);
    setSessionState(value);
  }

  async function clearSession() {
    clearStoredSession();
    setSessionState(null);

    try {
      await fetch("/api/passenger/session", {
        method: "DELETE",
      });
    } catch {
      // Best effort logout. The local session is already cleared.
    }
  }

  return { session, setSession: updateSession, clearSession };
}

type PassengerAuthFormProps = {
  onSuccess: (session: PassengerSession) => void;
  redirectTo?: string;
  defaultMode?: "login" | "signup";
};

export function PassengerAuthForm({
  onSuccess,
  redirectTo,
  defaultMode = "login",
}: PassengerAuthFormProps) {
  const router = useRouter();
  const id = useId();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const nameValue = name.trim();
    const phoneValue = phone.trim();
    const passwordValue = password;

    if (mode === "signup") {
      if (!nameValue) {
        setError("Full name is required for sign up.");
        setIsLoading(false);
        return;
      }

      if (!phoneValue) {
        setError("Phone number is required for sign up.");
        setIsLoading(false);
        return;
      }

      if (passwordValue.length < 6) {
        setError("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }

      if (passwordValue !== confirmPassword) {
        setError("Password and confirm password must match.");
        setIsLoading(false);
        return;
      }
    } else if (normalizedEmail === "" || passwordValue === "") {
      setError("Email and password are required for login.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/passenger/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          fullName: nameValue,
          email: normalizedEmail,
          phone: phoneValue,
          password: passwordValue,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { session?: PassengerSession; message?: string }
        | null;

      if (!response.ok || !payload?.session) {
        throw new Error(payload?.message ?? "Unable to continue with passenger access.");
      }

      onSuccess(payload.session);

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to continue with passenger access."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
            mode === "login"
              ? "border-b-2 border-red-600 text-red-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "border-b-2 border-red-600 text-red-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign Up
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            id={`${id}-email`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Enter your email"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              id={`${id}-phone`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              placeholder="Enter phone number"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <input
            id={`${id}-password`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Enter password"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              id={`${id}-confirm-password`}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              placeholder="Confirm password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? "Processing..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

export type { PassengerSession };
