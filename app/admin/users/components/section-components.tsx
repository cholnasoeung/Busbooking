"use client";

import Link from "next/link";
import {
  createOperatorAction,
  createPassengerAction,
  createStaffAction,
  deleteOperatorAction,
  deletePassengerAction,
  deleteStaffAction,
  rejectOperatorAction,
  restoreOperatorAction,
  suspendOperatorAction,
  updatePassengerStatusAction,
  updateStaffStatusAction,
  verifyOperatorAction,
} from "@/app/admin/users/actions";
import { DeleteConfirmButton } from "@/app/admin/users/components/delete-confirm-button";
import {
  type OperatorRecord,
  type PassengerRecord,
  type StaffRecord,
} from "@/lib/admin-user-management";

export function PassengerSection({
  records,
}: {
  records: PassengerRecord[];
}) {
  return (
    <>
      <div className="mb-4 text-xs">
        <Link
          href="/admin/users"
          className="text-amber-500 hover:text-amber-400"
        >
          ← Back to overview
        </Link>
      </div>
      <div className="mb-4 text-sm font-semibold text-stone-700">
        Quick add
      </div>
      <form
        action={createPassengerAction}
        className="mb-6 flex flex-wrap gap-2 text-xs"
      >
        <input
          name="fullName"
          required
          placeholder="Full name"
          className="flex-1 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <input
          name="phone"
          required
          placeholder="Phone"
          className="w-32 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <input
          name="email"
          required
          placeholder="Email"
          className="w-40 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <button
          type="submit"
          className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-900 hover:bg-amber-200"
        >
          Add
        </button>
      </form>
      <div className="overflow-hidden rounded-[24px] border border-stone-200">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Passenger</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Trips</th>
              <th className="px-4 py-3 font-medium">Last Booking</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white text-stone-700">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-4">
                  <div className="font-medium text-stone-950">
                    {record.fullName}
                  </div>
                  <div className="text-xs text-stone-500">{record.id}</div>
                </td>
                <td className="px-4 py-4">
                  <div>{record.phone}</div>
                  <div className="text-xs text-stone-500">{record.email}</div>
                </td>
                <td className="px-4 py-4">{record.tripsCompleted}</td>
                <td className="px-4 py-4">{record.lastBooking}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <form action={updatePassengerStatusAction}>
                      <input type="hidden" name="id" value={record.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={record.status === "suspended" ? "active" : "suspended"}
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-stone-50 hover:bg-stone-800"
                      >
                        {record.status === "suspended" ? "Restore" : "Suspend"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      id={record.id}
                      action={deletePassengerAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function OperatorSection({
  records,
}: {
  records: OperatorRecord[];
}) {
  return (
    <>
      <div className="mb-4 text-xs">
        <Link
          href="/admin/users"
          className="text-amber-500 hover:text-amber-400"
        >
          ← Back to overview
        </Link>
      </div>
      <div className="mb-4 text-sm font-semibold text-stone-700">
        Quick add
      </div>
      <form
        action={createOperatorAction}
        className="mb-6 flex flex-wrap gap-2 text-xs"
      >
        <input
          name="companyName"
          required
          placeholder="Company"
          className="flex-1 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <input
          name="contactName"
          required
          placeholder="Contact"
          className="w-40 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <input
          name="phone"
          required
          placeholder="Phone"
          className="w-32 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <button
          type="submit"
          className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-900 hover:bg-amber-200"
        >
          Add
        </button>
      </form>
      <div className="overflow-hidden rounded-[24px] border border-stone-200">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Operator</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Routes</th>
              <th className="px-4 py-3 font-medium">Verification</th>
              <th className="px-4 py-3 font-medium">Documents</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white text-stone-700">
            {records.map((record) => (
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
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {record.verification}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs">
                  {record.documentsComplete ? "Complete" : "Missing files"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {record.verification === "pending" ? (
                      <>
                        <form action={verifyOperatorAction}>
                          <input type="hidden" name="id" value={record.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
                          >
                            Verify
                          </button>
                        </form>
                        <form action={rejectOperatorAction}>
                          <input type="hidden" name="id" value={record.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-500"
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
                          className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-stone-50 hover:bg-stone-800"
                        >
                          Re-open
                        </button>
                      </form>
                    ) : (
                      <form action={suspendOperatorAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-stone-50 hover:bg-stone-800"
                        >
                          Suspend
                        </button>
                      </form>
                    )}
                    <DeleteConfirmButton
                      id={record.id}
                      action={deleteOperatorAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function StaffSection({ records }: { records: StaffRecord[] }) {
  return (
    <>
      <div className="mb-4 text-xs">
        <Link
          href="/admin/users"
          className="text-amber-500 hover:text-amber-400"
        >
          ← Back to overview
        </Link>
      </div>
      <div className="mb-4 text-sm font-semibold text-stone-700">
        Quick add
      </div>
      <form
        action={createStaffAction}
        className="mb-6 flex flex-wrap gap-2 text-xs"
      >
        <input
          name="fullName"
          required
          placeholder="Full name"
          className="flex-1 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <input
          name="email"
          required
          type="email"
          placeholder="Email"
          className="w-40 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        />
        <select
          name="role"
          className="w-36 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
        >
          <option value="super_admin">Super admin</option>
          <option value="ops_admin">Ops admin</option>
          <option value="support_admin">Support</option>
          <option value="finance_admin">Finance</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-900 hover:bg-amber-200"
        >
          Add
        </button>
      </form>
      <div className="overflow-hidden rounded-[24px] border border-stone-200">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Staff Member</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Access Scope</th>
              <th className="px-4 py-3 font-medium">Last Sign In</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white text-stone-700">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-4">
                  <div className="font-medium text-stone-950">{record.fullName}</div>
                  <div className="text-xs text-stone-500">{record.email}</div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-700">
                    {record.role}
                  </span>
                </td>
                <td className="px-4 py-4">{record.accessScope}</td>
                <td className="px-4 py-4">{record.lastSignIn}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2 text-xs">
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
                        className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-stone-50 hover:bg-stone-800"
                      >
                        {record.status === "suspended" ? "Restore" : "Suspend"}
                      </button>
                    </form>
                    <DeleteConfirmButton
                      id={record.id}
                      action={deleteStaffAction}
                      label="Delete"
                      description="Staff accounts can be recreated later."
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
