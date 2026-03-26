import {
  getAdminUserManagementData,
  type AccountStatus,
} from "@/lib/admin-user-management";
import { PassengerSection } from "@/app/admin/users/components/section-components";

type SearchParams = {
  status?: AccountStatus | "all";
};

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

export default async function PassengersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const data = await getAdminUserManagementData(asStatusParam(searchParams.status));

  return (
    <main className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Passenger management</h1>
        <p className="text-sm text-stone-500">
          Suspend users, delete stale accounts, or add a new rider manually.
        </p>
      </div>
      <PassengerSection records={data.passengers} />
    </main>
  );
}
