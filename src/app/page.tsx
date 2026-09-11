import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/auth/actions";
import { getAllTickets, getTicketsForUser } from "@/lib/tickets/queries";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const user = await requireUser();
  const { status, priority } = await searchParams;

  const isAdmin = user.role === "ADMIN";

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
              {isAdmin ? "All tickets" : "My tickets"}
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
              Log out
            </button>
          </form>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {!isAdmin && (
            <Link
              href="/tickets/new"
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              + New ticket
            </Link>
          )}

          {isAdmin && (
            <form method="get" className="flex gap-2">
              <select
                name="status"
                defaultValue={status ?? ""}
                className="rounded-lg border border-pink-200 px-2 py-1.5 text-sm text-pink-700"
              >
                <option value="">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <select
                name="priority"
                defaultValue={priority ?? ""}
                className="rounded-lg border border-pink-200 px-2 py-1.5 text-sm text-pink-700"
              >
                <option value="">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
              >
                Filter
              </button>
            </form>
          )}
        </div>

        <ul className="space-y-3">
          {ticketList.length === 0 && (
            <li className="rounded-xl bg-white p-6 text-center text-sm text-pink-400 ring-1 ring-pink-100">
              No tickets yet.
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
                      by {ticket.creatorName}
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
