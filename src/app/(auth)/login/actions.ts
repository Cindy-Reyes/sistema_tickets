"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

type ActionState = { error: string | null };

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
    }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email));
    if (!user) {
    return { error: "Credenciales inválidas" };
    }
    
  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
    return { error: "Credenciales inválidas" };
    }


  await createSession(user.id)

  redirect("/");
}
