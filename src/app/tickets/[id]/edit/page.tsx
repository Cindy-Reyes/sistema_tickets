import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getTicketById } from "@/lib/tickets/queries";
import EditForm from "./EditForm";

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const ticket = await getTicketById(id);
  if (!ticket) notFound();

  if (ticket.createdById !== user.id) notFound();
  if (ticket.status === "RESOLVED") notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50 px-4">
      <EditForm
        ticketId={ticket.id}
        initialTitle={ticket.title}
        initialDescription={ticket.description}
      />
    </main>
  );
}
