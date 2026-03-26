import {
  getSupportOverview,
  listFraudAlerts,
  listInvestigations,
  listRefundDisputes,
  listSupportTickets,
  type FraudAlert,
  type InvestigationRecord,
  type RefundDispute,
  type SupportTicket,
} from "@/lib/support-management";
import {
  createInvestigationAction,
  createTicketAction,
  flagFraudAction,
  updateDisputeStatusAction,
  updateFraudStatusAction,
  updateInvestigationAction,
  updateTicketStatusAction,
} from "./actions";
import { SupportFilters } from "./components/support-filters";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);

const ticketStatusOrder: Array<{
  status: SupportTicket["status"];
  label: string;
}> = [
  { status: "open", label: "Open" },
  { status: "in_progress", label: "In progress" },
  { status: "resolved", label: "Resolved" },
  { status: "closed", label: "Closed" },
];

const disputeStatusOrder: Array<{
  status: RefundDispute["status"];
  label: string;
}> = [
  { status: "pending", label: "Pending" },
  { status: "escalated", label: "Escalated" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected" },
];

const investigationStatusOrder: Array<{
  status: InvestigationRecord["status"];
  label: string;
}> = [
  { status: "pending", label: "Pending" },
  { status: "reviewing", label: "Reviewing" },
  { status: "closed", label: "Closed" },
];

const fraudStatusOrder: Array<{
  status: FraudAlert["status"];
  label: string;
}> = [
  { status: "new", label: "New" },
  { status: "investigating", label: "Investigating" },
  { status: "cleared", label: "Cleared" },
];

type SupportSearchParams = {
  ticketStatus?: SupportTicket["status"] | "all";
  disputeStatus?: RefundDispute["status"] | "all";
  investigationStatus?: InvestigationRecord["status"] | "all";
  fraudStatus?: FraudAlert["status"] | "all";
  ticketSearch?: string;
};

function asTicketStatus(value?: string): SupportTicket["status"] | "all" {
  if (value === "open" || value === "in_progress" || value === "resolved" || value === "closed") {
    return value;
  }
  return "all";
}

function asDisputeStatus(
  value?: string
): RefundDispute["status"] | "all" {
  if (value === "pending" || value === "escalated" || value === "approved" || value === "rejected") {
    return value;
  }
  return "all";
}

function asInvestigationStatus(
  value?: string
): InvestigationRecord["status"] | "all" {
  if (value === "pending" || value === "reviewing" || value === "closed") {
    return value;
  }
  return "all";
}

function asFraudStatus(value?: string): FraudAlert["status"] | "all" {
  if (value === "new" || value === "investigating" || value === "cleared") {
    return value;
  }
  return "all";
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: SupportSearchParams;
}) {
  const ticketStatus = asTicketStatus(searchParams?.ticketStatus);
  const disputeStatus = asDisputeStatus(searchParams?.disputeStatus);
  const investigationStatus = asInvestigationStatus(
    searchParams?.investigationStatus
  );
  const fraudStatus = asFraudStatus(searchParams?.fraudStatus);
  const ticketSearch = searchParams?.ticketSearch ?? "";

  const [overview, tickets, disputes, investigations, fraudAlerts] =
    await Promise.all([
      getSupportOverview(),
      listSupportTickets({
        status: ticketStatus === "all" ? undefined : ticketStatus,
        search: ticketSearch,
      }),
      listRefundDisputes({
        status: disputeStatus === "all" ? undefined : disputeStatus,
      }),
      listInvestigations({
        status: investigationStatus === "all" ? undefined : investigationStatus,
      }),
      listFraudAlerts({
        status: fraudStatus === "all" ? undefined : fraudStatus,
      }),
    ]);

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Support & disputes
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-950">
          Resolve tickets, disputes, investigations, and fraud flags
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Keep tickets moving to resolution, escalate refund disputes, launch
          investigations, and monitor fraud trends from one place.
        </p>
      </section>

      <section className="space-y-4">
        <SupportFilters
          ticketStatus={ticketStatus}
          disputeStatus={disputeStatus}
          investigationStatus={investigationStatus}
          fraudStatus={fraudStatus}
          ticketSearch={ticketSearch}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[26px] border border-stone-200 bg-white p-4 text-xs text-stone-500 shadow-[0_20px_60px_rgba(28,25,23,0.05)]">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-stone-400">
              Tickets
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {Object.values(overview.tickets).reduce((total, current) => total + current, 0)}
            </p>
            <div className="mt-3 space-y-2 text-[0.75rem] text-stone-500">
              {ticketStatusOrder.map(({ status, label }) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-0 last:pb-0"
                >
                  <span>{label}</span>
                  <span className="font-semibold text-stone-900">
                    {overview.tickets[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] border border-stone-200 bg-white p-4 text-xs text-stone-500 shadow-[0_20px_60px_rgba(28,25,23,0.05)]">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-stone-400">
              Disputes
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {Object.values(overview.disputes).reduce((total, current) => total + current, 0)}
            </p>
            <div className="mt-3 space-y-2 text-[0.75rem] text-stone-500">
              {disputeStatusOrder.map(({ status, label }) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-0 last:pb-0"
                >
                  <span>{label}</span>
                  <span className="font-semibold text-stone-900">
                    {overview.disputes[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] border border-stone-200 bg-white p-4 text-xs text-stone-500 shadow-[0_20px_60px_rgba(28,25,23,0.05)]">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-stone-400">
              Investigations
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {Object.values(overview.investigations).reduce((total, current) => total + current, 0)}
            </p>
            <div className="mt-3 space-y-2 text-[0.75rem] text-stone-500">
              {investigationStatusOrder.map(({ status, label }) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-0 last:pb-0"
                >
                  <span>{label}</span>
                  <span className="font-semibold text-stone-900">
                    {overview.investigations[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] border border-stone-200 bg-white p-4 text-xs text-stone-500 shadow-[0_20px_60px_rgba(28,25,23,0.05)]">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-stone-400">
              Fraud alerts
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {Object.values(overview.fraudAlerts).reduce((total, current) => total + current, 0)}
            </p>
            <div className="mt-3 space-y-2 text-[0.75rem] text-stone-500">
              {fraudStatusOrder.map(({ status, label }) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-0 last:pb-0"
                >
                  <span>{label}</span>
                  <span className="font-semibold text-stone-900">
                    {overview.fraudAlerts[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Ticketing system
              </h2>
              <p className="text-xs text-stone-500">
                Create new tickets and update status per passenger issue.
              </p>
            </div>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-500">
              {tickets.length} tickets
            </span>
          </header>
          <form action={createTicketAction} className="mt-4 grid gap-3 text-xs">
            <input
              name="subject"
              required
              placeholder="Subject"
              className="rounded-full border border-stone-200 bg-white px-3 py-2"
            />
            <textarea
              name="message"
              required
              rows={2}
              placeholder="Message"
              className="rounded-2xl border border-stone-200 bg-white px-3 py-2"
            />
            <div className="flex flex-wrap gap-2">
              <input
                name="passengerId"
                required
                placeholder="Passenger ID"
                className="w-40 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
              <input
                name="assignedTo"
                required
                placeholder="Assigned to"
                className="w-48 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
              <select
                name="priority"
                defaultValue="medium"
                className="w-32 rounded-full border border-stone-200 bg-white px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                name="channel"
                defaultValue="email"
                className="w-32 rounded-full border border-stone-200 bg-white px-3 py-2"
              >
                <option value="email">Email</option>
                <option value="chat">Chat</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-200"
            >
              Create ticket
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-stone-100 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {ticket.subject}
                    </p>
                    <p className="text-[0.65rem] text-stone-500">
                      {ticket.message}
                    </p>
                  </div>
                  <span className="text-[0.6rem] text-stone-400">
                    {formatDate(ticket.updatedAt)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] text-stone-500">
                  <span className="rounded-full border border-stone-200 px-3 py-1 uppercase tracking-[0.2em]">
                    {ticket.priority}
                  </span>
                  <span className="rounded-full border border-stone-200 px-3 py-1">
                    {ticket.channel}
                  </span>
                  <span>#{ticket.id}</span>
                  <span>Passenger {ticket.passengerId}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={updateTicketStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={ticket.id} />
                    <select
                      name="status"
                      defaultValue={ticket.status}
                      className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem]"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem] font-semibold"
                    >
                      Save
                    </button>
                  </form>
                  <span className="text-[0.65rem] text-stone-400">
                    Assigned to {ticket.assignedTo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Refund disputes
              </h2>
              <p className="text-xs text-stone-500">
                Track dispute status and escalate to finance when required.
              </p>
            </div>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-500">
              {disputes.length} open
            </span>
          </header>
          <div className="mt-4 space-y-3 text-xs">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-900">
                    {dispute.bookingId} — ${dispute.amount}
                  </p>
                  <span className="text-[0.65rem] text-stone-500">
                    {formatDate(dispute.submittedAt)}
                  </span>
                </div>
                <p className="text-[0.75rem] text-stone-600">{dispute.reason}</p>
                <p className="text-[0.65rem] text-stone-400">
                  Notes: {dispute.resolutionNotes}
                </p>
                <form action={updateDisputeStatusAction} className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={dispute.id} />
                  <select
                    name="status"
                    defaultValue={dispute.status}
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem]"
                  >
                    <option value="pending">Pending</option>
                    <option value="escalated">Escalated</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input
                    name="notes"
                    placeholder="Update notes"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem]"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem] font-semibold"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Booking investigation
              </h2>
              <p className="text-xs text-stone-500">
                Launch investigations and track findings per operator.
              </p>
            </div>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-500">
              {investigations.length} active
            </span>
          </header>
          <form
            action={createInvestigationAction}
            className="mt-4 grid gap-3 text-xs"
          >
            <input
              name="bookingId"
              required
              placeholder="Booking ID"
              className="rounded-full border border-stone-200 bg-white px-3 py-2"
            />
            <div className="flex flex-wrap gap-2">
              <input
                name="operatorId"
                required
                placeholder="Operator ID"
                className="w-40 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
              <input
                name="requestedBy"
                required
                placeholder="Requested by"
                className="w-48 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
            </div>
            <textarea
              name="findings"
              placeholder="Findings"
              rows={2}
              className="rounded-2xl border border-stone-200 bg-white px-3 py-2"
            />
            <textarea
              name="recommendedAction"
              placeholder="Recommended action"
              rows={2}
              className="rounded-2xl border border-stone-200 bg-white px-3 py-2"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-200"
            >
              Launch investigation
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {investigations.map((investigation) => (
              <div
                key={investigation.id}
                className="rounded-2xl border border-stone-100 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-900">
                    {investigation.bookingId} — {investigation.operatorId}
                  </p>
                  <span className="text-[0.65rem] text-stone-500">
                    {formatDate(investigation.updatedAt)}
                  </span>
                </div>
                <p className="text-[0.7rem] text-stone-500">
                  {investigation.findings}
                </p>
                <p className="text-[0.65rem] text-stone-400">
                  Action: {investigation.recommendedAction}
                </p>
                <form
                  action={updateInvestigationAction}
                  className="mt-2 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="id" value={investigation.id} />
                  <select
                    name="status"
                    defaultValue={investigation.status}
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem]"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="closed">Closed</option>
                  </select>
                  <input
                    name="findings"
                    placeholder="Add update"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem]"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem] font-semibold"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Fraud monitoring
              </h2>
              <p className="text-xs text-stone-500">
                Flag suspicious bookings and keep the risk register clean.
              </p>
            </div>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-500">
              {fraudAlerts.length} alerts
            </span>
          </header>
          <form action={flagFraudAction} className="mt-4 grid gap-3 text-xs">
            <div className="flex flex-wrap gap-2">
              <input
                name="passengerId"
                required
                placeholder="Passenger ID"
                className="w-40 rounded-full border border-stone-200 px-3 py-2"
              />
              <input
                name="bookingReference"
                required
                placeholder="Booking reference"
                className="w-48 rounded-full border border-stone-200 px-3 py-2"
              />
            </div>
            <select
              name="type"
              className="rounded-full border border-stone-200 px-3 py-2 text-xs"
            >
              <option value="identity">Identity</option>
              <option value="chargeback">Chargeback</option>
              <option value="duplicate">Duplicate</option>
            </select>
            <textarea
              name="notes"
              required
              rows={2}
              placeholder="Notes"
              className="rounded-2xl border border-stone-200 px-3 py-2"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900"
            >
              Flag fraud
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-900">
                    {alert.bookingReference}
                  </p>
                  <span className="text-[0.65rem] text-stone-500">
                    {formatDate(alert.updatedAt)}
                  </span>
                </div>
                <p className="text-[0.7rem] text-stone-500">{alert.notes}</p>
                <p className="text-[0.65rem] text-stone-400">
                  Passenger {alert.passengerId} • Risk {alert.riskScore}
                </p>
                <form action={updateFraudStatusAction} className="mt-2 flex items-center gap-2">
                  <input type="hidden" name="id" value={alert.id} />
                  <select
                    name="status"
                    defaultValue={alert.status}
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem]"
                  >
                    <option value="new">New</option>
                    <option value="investigating">Investigating</option>
                    <option value="cleared">Cleared</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.7rem] font-semibold"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
