"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

type ActionState = { error: string | null };

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existingUser = await db.select().from(users).where(eq(users.email, parsed.data.email));
  if (existingUser.length > 0) {
    return { error: "That email is already registered" };
  }

  const hash = await hashPassword(parsed.data.password)
  const [nuevo] = await db.insert(users)
  .values({ name: parsed.data.name, email: parsed.data.email, passwordHash: hash, role: "USER" })
  .returning({ id: users.id })


 await createSession(nuevo.id)
  redirect("/");
}
