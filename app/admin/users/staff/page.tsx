import {
  getAdminUserManagementData,
  type AccountStatus,
} from "@/lib/admin-user-management";
import { StaffSection } from "@/app/admin/users/components/section-components";
import { FilterPagination } from "@/app/admin/users/components/filter-pagination";

type SearchParams = {
  status?: AccountStatus | "all";
  search?: string;
  page?: string;
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

export default async function StaffPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const status = asStatusParam(searchParams.status);
  const search = searchParams.search ?? "";
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const data = await getAdminUserManagementData({
    status,
    search,
    page,
    pageSize: 10,
  });

  return (
    <main className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Staff & admin control</h1>
        <p className="text-sm text-stone-500">
          Manage internal roles, suspend misuse, and create new admins quickly.
        </p>
      </div>
      <FilterPagination currentStatus={status} currentSearch={search} />
      <StaffSection records={data.staff} />
    </main>
  );
}
