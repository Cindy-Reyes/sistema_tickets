import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(1, "Description is required"),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment can't be empty"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export type TicketInput = z.infer<typeof ticketSchema>;
