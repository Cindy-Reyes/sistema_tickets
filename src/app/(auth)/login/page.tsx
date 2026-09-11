"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-pink-100"
      >
        <h1 className="mb-1 text-2xl font-semibold text-pink-900">
          Iniciar sesión
        </h1>
        <p className="mb-6 text-sm text-pink-400">
          Entra para reportar y dar seguimiento a tus tickets.
        </p>

        {state.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-pink-800"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-pink-800"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-5 text-center text-sm text-pink-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-pink-600 underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </main>
  );
}
