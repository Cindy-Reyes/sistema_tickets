"use client";

import { useActionState } from "react";
import { addCommentAction } from "../actions";

// Client component porque useActionState es un hook de React (solo cliente).
// .bind(null, ticketId) "precarga" el primer argumento de la action;
// React llama a lo que queda con (prevState, formData), que es lo que espera useActionState.
export default function CommentForm({ ticketId }: { ticketId: string }) {
  const boundAction = addCommentAction.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(boundAction, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-4">
      {state.error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <textarea
        name="content"
        rows={3}
        required
        placeholder="Escribe un comentario..."
        className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
      />
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-pink-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Comentar"}
      </button>
    </form>
  );
}
