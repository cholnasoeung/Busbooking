import Link from "next/link";

import {
  getAdminUserManagementData,
  type AccountStatus,
  type OperatorRecord,
  type PassengerRecord,
  type StaffRecord,
} from "@/lib/admin-user-management";
import {
  rejectOperatorAction,
  restoreOperatorAction,
  suspendOperatorAction,
  updatePassengerStatusAction,
  updateStaffStatusAction,
  verifyOperatorAction,
} from "@/app/admin/users/actions";

type SearchParams = Promise<{
  section?: string;
  status?: AccountStatus | "all";
}>;

export const dynamic = "force-dynamic";

const statusStyles: Record<AccountStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  pending_review: "bg-amber-100 text-amber-800",
  suspended: "bg-rose-100 text-rose-800",
};

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function asStatusParam(value: string | undefined): AccountStatus | "all" {
  if (
    value === "active" ||
    value === "suspended" ||
    value === "pending_review" ||
    value === "all"
  ) {
    return value;
  }

  return "all";
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function SectionTabs({
  currentSection,
  currentStatus,
}: {
  currentSection: string;
  currentStatus: AccountStatus | "all";
}) {
  const sections = [
    { key: "all", label: "All Accounts" },
    { key: "passengers", label: "Passengers" },
    { key: "operators", label: "Operators" },
    { key: "staff", label: "Staff & Admins" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {sections.map((section) => {
        const active = section.key === currentSection;

        return (
          <Link
            key={section.key}
            href={`/admin/users?section=${section.key}&status=${currentStatus}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-stone-950 text-stone-50"
                : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </div>
  );
}

function StatusFilters({
  currentSection,
  currentStatus,
}: {
  currentSection: string;
  currentStatus: AccountStatus | "all";
}) {
  const filters: Array<{ key: AccountStatus | "all"; label: string }> = [
    { key: "all", label: "All statuses" },
    { key: "active", label: "Active" },
    { key: "pending_review", label: "Pending review" },
    { key: "suspended", label: "Suspended" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => {
        const active = filter.key === currentStatus;

        return (
          <Link
            key={filter.key}
            href={`/admin/users?section=${currentSection}&status=${filter.key}`}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-amber-300 text-stone-950"
                : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_70px_rgba(28,25,23,0.08)]">
      <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
        {eyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-500">
          <span className="rounded-full bg-stone-100 px-3 py-2">
            Suspend accounts
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-2">
            Verify operators
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-2">
            Live MongoDB data
          </span>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function PassengerTable({ records }: { records: PassengerRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
        <thead className="bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Passenger</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Trips</th>
            <th className="px-4 py-3 font-medium">Last Booking</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white text-stone-700">
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-4">
                  <div className="font-medium text-stone-950">{record.fullName}</div>
                  <div className="text-xs text-stone-500">{record.id}</div>
                </td>
                <td className="px-4 py-4">
                  <div>{record.phone}</div>
                  <div className="text-xs text-stone-500">{record.email}</div>
                </td>
                <td className="px-4 py-4">{record.tripsCompleted}</td>
                <td className="px-4 py-4">{record.lastBooking}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusStyles[record.status]
                    }`}
                  >
                    {formatStatus(record.status)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <form action={updatePassengerStatusAction}>
                    <input type="hidden" name="id" value={record.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={
                        record.status === "suspended" ? "active" : "suspended"
                      }
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-stone-50 transition hover:bg-stone-800"
                    >
                      {record.status === "suspended"
                        ? "Restore account"
                        : "Suspend"}
                    </button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                No passenger accounts match this filter yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function OperatorTable({ records }: { records: OperatorRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
        <thead className="bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Operator</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Routes</th>
            <th className="px-4 py-3 font-medium">Verification</th>
            <th className="px-4 py-3 font-medium">Documents</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white text-stone-700">
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-4">
                  <div className="font-medium text-stone-950">
                    {record.companyName}
                  </div>
                  <div className="text-xs text-stone-500">{record.id}</div>
                </td>
                <td className="px-4 py-4">
                  <div>{record.contactName}</div>
                  <div className="text-xs text-stone-500">{record.phone}</div>
                </td>
                <td className="px-4 py-4">{record.activeRoutes}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        statusStyles[record.status]
                      }`}
                    >
                      {formatStatus(record.status)}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      {record.verification}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {record.documentsComplete ? "Complete" : "Missing files"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {record.verification === "pending" ? (
                      <>
                        <form action={verifyOperatorAction}>
                          <input type="hidden" name="id" value={record.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                          >
                            Verify
                          </button>
                        </form>
                        <form action={rejectOperatorAction}>
                          <input type="hidden" name="id" value={record.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                          >
                            Reject
                          </button>
                        </form>
                      </>
                    ) : record.status === "suspended" ? (
                      <form action={restoreOperatorAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-stone-50 transition hover:bg-stone-800"
                        >
                          Re-open review
                        </button>
                      </form>
                    ) : (
                      <form action={suspendOperatorAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-stone-50 transition hover:bg-stone-800"
                        >
                          Suspend
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                No operator accounts match this filter yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StaffTable({ records }: { records: StaffRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
        <thead className="bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Staff Member</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Access Scope</th>
            <th className="px-4 py-3 font-medium">Last Sign In</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white text-stone-700">
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-4">
                  <div className="font-medium text-stone-950">{record.fullName}</div>
                  <div className="text-xs text-stone-500">{record.email}</div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-700">
                    {formatStatus(record.role)}
                  </span>
                </td>
                <td className="px-4 py-4">{record.accessScope}</td>
                <td className="px-4 py-4">{record.lastSignIn}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusStyles[record.status]
                    }`}
                  >
                    {formatStatus(record.status)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <form action={updateStaffStatusAction}>
                    <input type="hidden" name="id" value={record.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={
                        record.status === "suspended" ? "active" : "suspended"
                      }
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-stone-50 transition hover:bg-stone-800"
                    >
                      {record.status === "suspended"
                        ? "Restore access"
                        : "Suspend"}
                    </button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                No staff accounts match this filter yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentSection = params.section ?? "all";
  const currentStatus = asStatusParam(params.status);

  const data = await getAdminUserManagementData(currentStatus);

  const showPassengers =
    currentSection === "all" || currentSection === "passengers";
  const showOperators =
    currentSection === "all" || currentSection === "operators";
  const showStaff = currentSection === "all" || currentSection === "staff";

  return (
    <main className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,#f9d8a4,transparent_32%),linear-gradient(135deg,#1f1b16_0%,#2d241d_55%,#7c4a1d_100%)] px-6 py-8 text-stone-50 shadow-[0_25px_80px_rgba(28,25,23,0.14)]">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
          Admin Feature 01
        </p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight">
              User management for passengers, operators, and staff
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-200">
              This admin page now reads live account data from MongoDB and
              updates account states directly on the server with each action.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-300">
              Current focus
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              Dynamic user management
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_18px_40px_rgba(28,25,23,0.06)]"
          >
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              {formatCount(stat.value)}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_70px_rgba(28,25,23,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Explore Accounts
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
              Filter by user group and account state
            </h2>
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
            Live data source: MongoDB
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <SectionTabs
            currentSection={currentSection}
            currentStatus={currentStatus}
          />
          <StatusFilters
            currentSection={currentSection}
            currentStatus={currentStatus}
          />
        </div>
      </section>

      <div className="space-y-6">
        {showPassengers ? (
          <SectionCard
            eyebrow="Passenger Accounts"
            title="Manage passenger profiles and risky accounts"
            description="Review activity, suspend passenger access when needed, and restore accounts after manual checks."
          >
            <PassengerTable records={data.passengers} />
          </SectionCard>
        ) : null}

        {showOperators ? (
          <SectionCard
            eyebrow="Operator Accounts"
            title="Manage bus companies and verification status"
            description="Approve operators when documents are ready, reject weak submissions, and suspend verified operators when compliance issues appear."
          >
            <OperatorTable records={data.operators} />
          </SectionCard>
        ) : null}

        {showStaff ? (
          <SectionCard
            eyebrow="Internal Access"
            title="Manage staff and admin permissions"
            description="Keep platform access controlled by reviewing internal accounts and suspending staff profiles that should no longer stay active."
          >
            <StaffTable records={data.staff} />
          </SectionCard>
        ) : null}
      </div>
    </main>
  );
}
