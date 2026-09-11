"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createTicketAction } from "../actions";

export default function NewTicketPage() {
  const [state, formAction, isPending] = useActionState(createTicketAction, {
    error: null,
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50 px-4">
      <form
        action={formAction}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-pink-100"
      >
        <h1 className="mb-6 text-2xl font-semibold text-pink-900">
          Nuevo ticket
        </h1>

        {state.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-pink-800">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-pink-800">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creando..." : "Crear ticket"}
          </button>
          <Link href="/" className="text-sm text-pink-500 underline">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
