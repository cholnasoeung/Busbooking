import {
  getAdminUserManagementData,
  type AccountStatus,
} from "@/lib/admin-user-management";
import { FilterPagination } from "@/app/admin/users/components/filter-pagination";
import {
  recordOperatorComplianceAction,
  updateOperatorDocumentStatusAction,
} from "@/app/admin/users/actions";

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

export default async function OperatorApprovalPage({
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
    pageSize: 8,
  });

  const operators = data.operators;

  return (
    <main className="space-y-6">
      <header className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Operator Approval
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Review operator documents</h1>
        <p className="text-sm text-stone-500">
          Approve/reject bus companies based on their paperwork and keep compliance
          notes in one place.
        </p>
      </header>

      <FilterPagination
        currentStatus={status}
        currentSearch={search}
        currentPage={page}
      />

      <div className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 text-left">Operator</th>
              <th className="px-4 py-3 text-left">Document status</th>
              <th className="px-4 py-3 text-left">Compliance</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {operators.map((operator) => (
              <tr key={operator.id} className="text-stone-700">
                <td className="px-4 py-5">
                  <div className="font-medium text-stone-900">{operator.companyName}</div>
                  <div className="text-xs text-stone-500">{operator.contactName}</div>
                  <div className="text-xs text-stone-500">{operator.id}</div>
                </td>
                <td className="px-4 py-5">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium capitalize text-stone-700">
                    {operator.documentStatus}
                  </span>
                </td>
                <td className="px-4 py-5">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                    {operator.complianceStatus}
                  </span>
                </td>
                <td className="px-4 py-5 text-xs text-stone-600">
                  {operator.complianceNotes}
                </td>
                <td className="px-4 py-5">
                  <div className="space-y-3 text-xs text-stone-500">
                    <form
                      action={updateOperatorDocumentStatusAction}
                      className="space-y-1 rounded-xl border border-stone-100 p-3"
                    >
                      <input type="hidden" name="id" value={operator.id} />
                      <select
                        name="documentStatus"
                        defaultValue={operator.documentStatus}
                        className="w-full rounded-full border border-stone-200 px-3 py-2 text-xs focus:border-amber-300"
                      >
                        <option value="complete">Complete</option>
                        <option value="pending">Pending</option>
                        <option value="issues">Issues</option>
                      </select>
                      <input
                        name="note"
                        placeholder="Document note"
                        className="w-full rounded-full border border-stone-200 px-3 py-2 text-xs focus:border-amber-300"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-amber-300 px-3 py-2 font-semibold text-stone-900 hover:bg-amber-200"
                      >
                        Update docs
                      </button>
                    </form>
                    <form
                      action={recordOperatorComplianceAction}
                      className="space-y-1 rounded-xl border border-stone-100 p-3"
                    >
                      <input type="hidden" name="id" value={operator.id} />
                      <select
                        name="complianceStatus"
                        defaultValue={operator.complianceStatus}
                        className="w-full rounded-full border border-stone-200 px-3 py-2 text-xs focus:border-amber-300"
                      >
                        <option value="pending">Pending</option>
                        <option value="compliant">Compliant</option>
                        <option value="needs_followup">Needs follow-up</option>
                      </select>
                      <input
                        name="note"
                        placeholder="Compliance note"
                        className="w-full rounded-full border border-stone-200 px-3 py-2 text-xs focus:border-amber-300"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-stone-900 px-3 py-2 font-semibold text-white hover:bg-stone-800"
                      >
                        Save compliance
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
