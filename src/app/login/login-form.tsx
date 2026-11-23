"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const message = state.error ?? notice;

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-navy-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-petal-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-navy-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-petal-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15"
        />
      </div>
      {message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
