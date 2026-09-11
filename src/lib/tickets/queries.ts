import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, tickets, users } from "@/db/schema";

type StatusFilter = "OPEN" | "IN_PROGRESS" | "RESOLVED" | undefined;
type PriorityFilter = "LOW" | "MEDIUM" | "HIGH" | undefined;

export async function getTicketsForUser(userId: string) {
  return db
    .select()
    .from(tickets)
    .where(eq(tickets.createdById, userId))
    .orderBy(desc(tickets.createdAt));
}

export async function getAllTickets(filters: {
  status?: StatusFilter;
  priority?: PriorityFilter;
}) {
  const conditions = [];
  if (filters.status) conditions.push(eq(tickets.status, filters.status));
  if (filters.priority) conditions.push(eq(tickets.priority, filters.priority));

  return db
    .select({
      id: tickets.id,
      title: tickets.title,
      status: tickets.status,
      priority: tickets.priority,
      createdAt: tickets.createdAt,
      createdById: tickets.createdById,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(tickets)
    .innerJoin(users, eq(tickets.createdById, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketById(ticketId: string) {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
  return ticket ?? null;
}

export async function getTicketWithComments(ticketId: string) {
  const [ticket] = await db
    .select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      createdById: tickets.createdById,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      creatorName: users.name,
    })
    .from(tickets)
    .innerJoin(users, eq(tickets.createdById, users.id))
    .where(eq(tickets.id, ticketId));
  if (!ticket) return null;

  const ticketComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.ticketId, ticketId))
    .orderBy(comments.createdAt);

  return { ticket, comments: ticketComments };
}
