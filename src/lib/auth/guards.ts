import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

/**
 * Usar al inicio de cualquier página o server action que requiera estar logueado.
 * Si no hay sesión válida, corta la ejecución con un redirect a /login.
 * (El proxy ya protege las rutas, pero esto es una segunda capa: nunca confíes
 * en una sola barrera. Si alguien llega aquí sin sesión por cualquier motivo,
 * esto lo detiene también.)
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Igual que requireUser, pero además exige rol ADMIN.
 * Un USER que intente entrar a una página/acción de admin es mandado a "/".
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
