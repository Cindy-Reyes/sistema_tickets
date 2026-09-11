"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tickets, comments } from "@/db/schema";
import {
  ticketSchema,
  commentSchema,
  updateStatusSchema,
  updatePrioritySchema,
} from "@/lib/validations/ticket";
import { requireUser, requireAdmin } from "@/lib/auth/guards";

type ActionState = { error: string | null };

// ---------------------------------------------------------------
// Crear ticket. Cualquier usuario logueado puede crear el suyo.
export async function createTicketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = ticketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [ticket] = await db
    .insert(tickets)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      createdById: user.id, // <- el dueño SIEMPRE es quien está logueado,
      //    nunca un valor que venga del formulario/cliente.
    })
    .returning({ id: tickets.id });

  redirect(`/tickets/${ticket.id}`);
}

// ---------------------------------------------------------------
// Editar ticket. Se usa con .bind(null, ticketId) desde el formulario,
// así llega como primer argumento antes que (prevState, formData).
export async function updateTicketAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = ticketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));

  // ESTA es la verificación central de seguridad de la edición:
  // sin importar qué mande el formulario, se vuelve a comprobar en el
  // servidor que (a) el ticket existe y (b) es del usuario logueado.
  if (!ticket || ticket.createdById !== user.id) {
    return { error: "No tienes permiso para editar este ticket" };
  }
  if (ticket.status === "RESOLVED") {
    return { error: "No se puede editar un ticket ya resuelto" };
  }

  await db
    .update(tickets)
    .set({ title: parsed.data.title, description: parsed.data.description })
    .where(eq(tickets.id, ticketId));

  redirect(`/tickets/${ticketId}`);
}

// ---------------------------------------------------------------
// Agregar comentario. Dueño del ticket O admin pueden comentar.
export async function addCommentAction(
  ticketId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
  if (!ticket) {
    return { error: "Ticket no encontrado" };
  }
  if (user.role !== "ADMIN" && ticket.createdById !== user.id) {
    return { error: "No tienes permiso para comentar este ticket" };
  }

  await db.insert(comments).values({
    ticketId,
    authorId: user.id,
    content: parsed.data.content,
  });

  revalidatePath(`/tickets/${ticketId}`);
  return { error: null };
}

// ---------------------------------------------------------------
// Cambiar estado. SOLO admin (requireAdmin corta si no lo es).
export async function updateStatusAction(ticketId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  await db.update(tickets).set({ status: parsed.data.status }).where(eq(tickets.id, ticketId));
  revalidatePath(`/tickets/${ticketId}`);
}

// ---------------------------------------------------------------
// Cambiar prioridad. SOLO admin.
export async function updatePriorityAction(ticketId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updatePrioritySchema.safeParse({ priority: formData.get("priority") });
  if (!parsed.success) return;

  await db.update(tickets).set({ priority: parsed.data.priority }).where(eq(tickets.id, ticketId));
  revalidatePath(`/tickets/${ticketId}`);
}
