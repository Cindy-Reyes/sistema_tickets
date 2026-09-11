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
      createdById: user.id,
    })
    .returning({ id: tickets.id });

  redirect(`/tickets/${ticket.id}`);
}

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

  if (!ticket || ticket.createdById !== user.id) {
    return { error: "You don't have permission to edit this ticket" };
  }
  if (ticket.status === "RESOLVED") {
    return { error: "A resolved ticket can't be edited" };
  }

  await db
    .update(tickets)
    .set({ title: parsed.data.title, description: parsed.data.description })
    .where(eq(tickets.id, ticketId));

  redirect(`/tickets/${ticketId}`);
}

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
    return { error: "Ticket not found" };
  }
  if (user.role !== "ADMIN" && ticket.createdById !== user.id) {
    return { error: "You don't have permission to comment on this ticket" };
  }

  await db.insert(comments).values({
    ticketId,
    authorId: user.id,
    content: parsed.data.content,
  });

  revalidatePath(`/tickets/${ticketId}`);
  return { error: null };
}

export async function updateStatusAction(ticketId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  await db.update(tickets).set({ status: parsed.data.status }).where(eq(tickets.id, ticketId));
  revalidatePath(`/tickets/${ticketId}`);
}

export async function updatePriorityAction(ticketId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updatePrioritySchema.safeParse({ priority: formData.get("priority") });
  if (!parsed.success) return;

  await db.update(tickets).set({ priority: parsed.data.priority }).where(eq(tickets.id, ticketId));
  revalidatePath(`/tickets/${ticketId}`);
}
