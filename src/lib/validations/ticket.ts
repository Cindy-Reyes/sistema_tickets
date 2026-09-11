import { z } from "zod";

// Se usa tanto para crear como para editar un ticket: mismos campos.
export const ticketSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200),
  description: z.string().min(1, "La descripción es requerida"),
});

export const commentSchema = z.object({
  content: z.string().min(1, "El comentario no puede estar vacío"),
});

// Estos dos reflejan exactamente los enums del schema de la BD.
// Si el valor no es uno de estos, zod lo rechaza antes de tocar la base.
export const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export type TicketInput = z.infer<typeof ticketSchema>;
