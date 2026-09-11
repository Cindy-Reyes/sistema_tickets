import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getTicketWithComments } from "@/lib/tickets/queries";
import { updateStatusAction, updatePriorityAction } from "../actions";
import CommentForm from "./CommentForm";

export const dynamic = "force-dynamic";

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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const data = await getTicketWithComments(id);
  if (!data) notFound();

  const { ticket, comments } = data;
  const isAdmin = user.role === "ADMIN";
  const isOwner = ticket.createdById === user.id;

  if (!isOwner && !isAdmin) notFound();

  const canEdit = isOwner && ticket.status !== "RESOLVED";

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-4 inline-block text-sm text-pink-500 underline">
          ← Back
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-pink-100">
          <div className="mb-1 flex items-start justify-between">
            <h1 className="text-2xl font-semibold text-pink-900">{ticket.title}</h1>
            {canEdit && (
              <Link
                href={`/tickets/${ticket.id}/edit`}
                className="rounded-lg border border-pink-200 px-3 py-1 text-sm text-pink-700 hover:bg-pink-50"
              >
                Edit
              </Link>
            )}
          </div>

          <p className="mb-4 text-sm text-pink-400">Created by: {ticket.creatorName}</p>

          <p className="mb-4 whitespace-pre-wrap text-pink-800">{ticket.description}</p>

          <div className="mb-2 flex flex-wrap gap-4 text-sm text-pink-500">
            <span>Created: {ticket.createdAt.toLocaleString()}</span>
            <span>Updated: {ticket.updatedAt.toLocaleString()}</span>
          </div>

          {!isAdmin && (
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-700">
                {STATUS_LABEL[ticket.status]}
              </span>
              <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-700">
                {PRIORITY_LABEL[ticket.priority]}
              </span>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-pink-100 pt-4">
              <form action={updateStatusAction.bind(null, ticket.id)} className="flex items-center gap-2">
                <label className="text-sm text-pink-700">Status:</label>
                <select
                  key={ticket.status}
                  name="status"
                  defaultValue={ticket.status}
                  className="rounded-lg border border-pink-200 px-2 py-1 text-sm text-pink-700"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-pink-500 px-2 py-1 text-xs font-medium text-white hover:bg-pink-600"
                >
                  Save
                </button>
              </form>

              <form action={updatePriorityAction.bind(null, ticket.id)} className="flex items-center gap-2">
                <label className="text-sm text-pink-700">Priority:</label>
                <select
                  key={ticket.priority}
                  name="priority"
                  defaultValue={ticket.priority}
                  className="rounded-lg border border-pink-200 px-2 py-1 text-sm text-pink-700"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-pink-500 px-2 py-1 text-xs font-medium text-white hover:bg-pink-600"
                >
                  Save
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-pink-100">
          <h2 className="mb-3 text-lg font-semibold text-pink-900">
            Comments ({comments.length})
          </h2>

          <ul className="mb-4 space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-lg bg-pink-50 p-3 text-sm">
                <p className="mb-1 font-medium text-pink-800">{c.authorName}</p>
                <p className="text-pink-700">{c.content}</p>
                <p className="mt-1 text-xs text-pink-400">{c.createdAt.toLocaleString()}</p>
              </li>
            ))}
            {comments.length === 0 && (
              <li className="text-sm text-pink-400">No comments yet.</li>
            )}
          </ul>

          <CommentForm ticketId={ticket.id} />
        </div>
      </div>
    </main>
  );
}
