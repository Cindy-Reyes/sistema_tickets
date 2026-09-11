"use server";

import { redirect } from "next/navigation";
import { destroySession } from "./session";

// Server action de logout: borra la sesión (BD + cookie) y manda a /login.
// No necesita useActionState porque no hay nada que validar ni errores que mostrar.
export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
