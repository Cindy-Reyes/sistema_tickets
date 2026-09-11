import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/auth/actions";
import { getAllTickets, getTicketsForUser } from "@/lib/tickets/queries";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  RESOLVED: "Resuelto",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  // requireUser(): si no hay sesión, esto redirige a /login solo.
  // El proxy ya protege "/", pero esta es la segunda capa de la que hablamos.
  const user = await requireUser();
  const { status, priority } = await searchParams;

  const isAdmin = user.role === "ADMIN";

  // Admin ve TODOS los tickets (con filtros); un USER solo ve los suyos.
  const ticketList = isAdmin
    ? await getAllTickets({
        status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | undefined,
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | undefined,
      })
    : await getTicketsForUser(user.id);

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-pink-900">
              {isAdmin ? "Todos los tickets" : "Mis tickets"}
            </h1>
            <p className="text-sm text-pink-400">
              {user.name} · {user.role}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-pink-200 px-3 py-1.5 text-sm text-pink-700 hover:bg-pink-100"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {!isAdmin && (
            <Link
              href="/tickets/new"
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              + Nuevo ticket
            </Link>
          )}

          {isAdmin && (
            // Form GET simple: al enviar, recarga la página con ?status=...&priority=...
            // No necesita JS ni client component, Next lee los searchParams solo.
            <form method="get" className="flex gap-2">
              <select
                name="status"
                defaultValue={status ?? ""}
                className="rounded-lg border border-pink-200 px-2 py-1.5 text-sm text-pink-700"
              >
                <option value="">Todos los estados</option>
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="RESOLVED">Resuelto</option>
              </select>
              <select
                name="priority"
                defaultValue={priority ?? ""}
                className="rounded-lg border border-pink-200 px-2 py-1.5 text-sm text-pink-700"
              >
                <option value="">Todas las prioridades</option>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
              >
                Filtrar
              </button>
            </form>
          )}
        </div>

        <ul className="space-y-3">
          {ticketList.length === 0 && (
            <li className="rounded-xl bg-white p-6 text-center text-sm text-pink-400 ring-1 ring-pink-100">
              No hay tickets todavía.
            </li>
          )}

          {ticketList.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100 hover:ring-pink-300"
              >
                <div>
                  <p className="font-medium text-pink-900">{ticket.title}</p>
                  {isAdmin && "creatorName" in ticket && (
                    <p className="text-xs text-pink-400">
                      por {ticket.creatorName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-700">
                    {STATUS_LABEL[ticket.status]}
                  </span>
                  <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-700">
                    {PRIORITY_LABEL[ticket.priority]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
