// import {
//   getOperatorProfile,
//   listDocuments,
//   listOperatorStaff,
//   listRoles,
//   type OperatorDocument,
//   type OperatorStaff,
//   type RoleRecord,
// } from "@/lib/operator-portal";
// import {
//   addStaffAction,
//   assignRoleAction,
//   changeStaffRoleAction,
//   createRoleAction,
//   deactivateOperatorAction,
//   editRoleAction,
//   editStaffAction,
//   disableRoleAction,
//   forgotPasswordAction,
//   logoutAction,
//   removeStaffAction,
//   resetPasswordAction,
//   toggleStaffStatusAction,
//   uploadDocumentAction,
//   updateCompanyAction,
// } from "@/app/operator/actions";

// const roleLabels: Record<string, string> = {
//   operations_lead: "Operations Lead",
//   sales_lead: "Sales Lead",
//   support_lead: "Support Lead",
//   finance_lead: "Finance Lead",
// };

// const statusLabel: Record<string, string> = {
//   active: "Active",
//   suspended: "Suspended",
// };

// const docStatusColors: Record<string, string> = {
//   uploaded: "text-white bg-stone-700",
//   under_review: "text-amber-900 bg-amber-100",
//   accepted: "text-emerald-900 bg-emerald-100",
//   rejected: "text-rose-900 bg-rose-100",
// };

// export default async function OperatorDashboardPage() {
//   const [profile, staff, documents, roles] = await Promise.all([
//     getOperatorProfile(),
//     listOperatorStaff(),
//     listDocuments(),
//     listRoles(),
//   ]);

//   return (
//     <div className="space-y-6">
//       <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
//         <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
//           Operator dashboard
//         </p>
//         <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-semibold text-white">{profile.companyName}</h1>
//             <p className="text-sm text-stone-200">
//               Lead by {profile.contactName}. Staff {profile.staffCount}, managing {profile.routesManaged} routes.
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <span
//               className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${profile.active ? "border-emerald-300 text-emerald-300" : "border-rose-300 text-rose-300"}`}
//             >
//               {profile.active ? "Active" : "Deactivated"}
//             </span>
//             <form action={logoutAction}>
//               <button
//                 type="submit"
//                 className="rounded-full border border-white/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-amber-300"
//               >
//                 Log out
//               </button>
//             </form>
//           </div>
//         </div>
//         <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
//             <p className="text-xs text-stone-400">Headquarters</p>
//             <p className="text-lg font-semibold text-white">{profile.headquarters}</p>
//           </div>
//           <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
//             <p className="text-xs text-stone-400">Contact</p>
//             <p className="text-lg font-semibold text-white">{profile.phone}</p>
//           </div>
//           <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
//             <p className="text-xs text-stone-400">Email</p>
//             <p className="text-lg font-semibold text-white">{profile.email}</p>
//           </div>
//           <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
//             <p className="text-xs text-stone-400">Updated</p>
//             <p className="text-lg font-semibold text-white">
//               {profile.updatedAt.toLocaleDateString()}
//             </p>
//           </div>
//         </div>
//       </section>

//       <section className="grid gap-6 md:grid-cols-3">
//         <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:col-span-2">
//           <h2 className="text-lg font-semibold text-white">Company profile</h2>
//           <form action={updateCompanyAction} className="mt-4 grid gap-3 text-xs">
//             <input
//               name="companyName"
//               defaultValue={profile.companyName}
//               required
//               className="w-full rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
//             />
//             <input
//               name="contactName"
//               defaultValue={profile.contactName}
//               required
//               className="w-full rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
//             />
//             <div className="grid gap-3 sm:grid-cols-2">
//               <input
//                 name="phone"
//                 defaultValue={profile.phone}
//                 required
//                 className="rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
//               />
//               <input
//                 name="email"
//                 defaultValue={profile.email}
//                 required
//                 className="rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
//               />
//             </div>
//             <input
//               name="headquarters"
//               defaultValue={profile.headquarters}
//               required
//               className="w-full rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
//             />
//             <button
//               type="submit"
//               className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-[0.75rem] font-semibold text-stone-900"
//             >
//               Save profile
//             </button>
//           </form>
//         </article>

//         <article className="rounded-[28px] border border-white/10 bg-stone-900/50 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
//           <h2 className="text-lg font-semibold text-white">Documents & status</h2>
//           <p className="mt-1 text-xs text-stone-400">
//             Upload registration, insurance, and compliance docs for review.
//           </p>
//           <form action={uploadDocumentAction} className="mt-4 space-y-3 text-xs">
//             <input
//               name="name"
//               placeholder="Document name"
//               className="w-full rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//             />
//             <input
//               name="document"
//               type="file"
//               className="text-xs text-stone-300"
//             />
//             <button
//               type="submit"
//               className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
//             >
//               Upload
//             </button>
//           </form>
//           <div className="mt-4 space-y-2 text-xs text-stone-300">
//             {documents.map((doc: OperatorDocument) => (
//               <div
//                 key={doc.id}
//                 className="flex items-center justify-between rounded-2xl border border-white/10 bg-stone-900/70 px-3 py-2"
//               >
//                 <div>
//                   <p className="font-semibold text-white">{doc.name}</p>
//                   <p className="text-[0.65rem] text-stone-400">{doc.filename}</p>
//                 </div>
//                 <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold ${docStatusColors[doc.status] ?? "text-white bg-stone-700"}`}>
//                   {doc.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <form action={deactivateOperatorAction} className="mt-4 flex justify-between text-[0.7rem] text-stone-300">
//             <input type="hidden" name="active" value={profile.active ? "false" : "true"} />
//             <button
//               type="submit"
//               className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white hover:border-rose-300"
//             >
//               {profile.active ? "Deactivate operator" : "Reactivate operator"}
//             </button>
//             <span>{profile.active ? "Live on platform" : "Currently deactivated"}</span>
//           </form>
//         </article>
//       </section>

//       <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
//         <h2 className="text-lg font-semibold text-white">Authentication helpers</h2>
//         <div className="mt-3 grid gap-6 md:grid-cols-3">
//           <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-[0.75rem] text-stone-300">
//             <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
//               Credentials
//             </p>
//             <p className="mt-2 text-sm text-white">Login page at <strong>/operator/login</strong></p>
//             <p className="text-[0.65rem] text-stone-400">Demo password: operator-demo</p>
//           </div>
//           <form action={forgotPasswordAction} className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300">
//             <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">Forgot password</p>
//             <input
//               name="email"
//               placeholder="Email"
//               className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
//             />
//             <button
//               type="submit"
//               className="mt-2 rounded-full border border-amber-300 px-4 py-2 text-[0.65rem] font-semibold text-amber-200"
//             >
//               Send reset link
//             </button>
//           </form>
//           <form action={resetPasswordAction} className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300">
//             <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">Reset password</p>
//             <input
//               name="token"
//               placeholder="Reset token"
//               className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
//             />
//             <input
//               name="secret"
//               type="password"
//               placeholder="New secret"
//               className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
//             />
//             <button
//               type="submit"
//               className="mt-2 rounded-full border border-amber-300 px-4 py-2 text-[0.65rem] font-semibold text-amber-200"
//             >
//               Apply
//             </button>
//           </form>
//         </div>
//       </section>

//       <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
//         <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-white">Staff accounts</h2>
//             <p className="text-xs text-stone-300">
//               Create, edit, suspend, and remove team members.
//             </p>
//           </div>
//           <form action={addStaffAction} className="flex flex-wrap gap-2 text-xs">
//             <input
//               name="fullName"
//               required
//               placeholder="Full name"
//               className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//             />
//             <select
//               name="role"
//               className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//               defaultValue="operations_lead"
//             >
//               <option value="operations_lead">Operations</option>
//               <option value="sales_lead">Sales</option>
//               <option value="support_lead">Support</option>
//               <option value="finance_lead">Finance</option>
//             </select>
//             <button
//               type="submit"
//               className="rounded-full bg-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-stone-900"
//             >
//               Add staff
//             </button>
//           </form>
//         </header>
//         <div className="overflow-hidden rounded-[24px] border border-white/10">
//           <table className="min-w-full text-sm text-stone-100">
//             <thead className="bg-white/5 text-stone-300">
//               <tr>
//                 <th className="px-4 py-3 text-left">Team member</th>
//                 <th className="px-4 py-3 text-center">Role</th>
//                 <th className="px-4 py-3 text-center">Status</th>
//                 <th className="px-4 py-3 text-center">Permissions</th>
//                 <th className="px-4 py-3 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5 bg-stone-950">
//               {staff.map((member: OperatorStaff) => (
//                 <tr key={member.id} className="text-stone-200">
//                   <td className="px-4 py-4">
//                     <form action={editStaffAction} className="flex flex-col gap-1 text-xs">
//                       <input type="hidden" name="id" value={member.id} />
//                       <input
//                         name="fullName"
//                         defaultValue={member.fullName}
//                         className="rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
//                       />
//                       <div className="flex items-center justify-between text-[0.65rem] text-stone-400">
//                         <span>Last seen {member.lastSeen.toLocaleDateString()}</span>
//                         <button
//                           type="submit"
//                           className="rounded-full border border-white/10 px-2 py-0.5 font-semibold"
//                         >
//                           Save
//                         </button>
//                       </div>
//                     </form>
//                     <form action={removeStaffAction} className="mt-2 inline-flex gap-2 text-[0.65rem]">
//                       <input type="hidden" name="id" value={member.id} />
//                       <button
//                         type="submit"
//                         className="rounded-full border border-rose-600 px-3 py-1 font-semibold text-rose-400 hover:border-rose-400"
//                       >
//                         Remove
//                       </button>
//                     </form>
//                   </td>
//                   <td className="px-4 py-4 text-center">
//                     <form action={changeStaffRoleAction} className="flex flex-col gap-1 text-[0.7rem]">
//                       <input type="hidden" name="id" value={member.id} />
//                       <select
//                         name="role"
//                         defaultValue={member.role}
//                         className="rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
//                       >
//                         {Object.entries(roleLabels).map(([key, label]) => (
//                           <option key={key} value={key}>
//                             {label}
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         type="submit"
//                         className="rounded-full border border-white/10 px-3 py-1 font-semibold"
//                       >
//                         Save
//                       </button>
//                     </form>
//                   </td>
//                   <td className="px-4 py-4 text-center">
//                     <form action={toggleStaffStatusAction} className="flex flex-col gap-1 text-[0.65rem]">
//                       <input type="hidden" name="id" value={member.id} />
//                       <input
//                         type="hidden"
//                         name="status"
//                         value={member.status === "active" ? "suspended" : "active"}
//                       />
//                       <button
//                         type="submit"
//                         className="rounded-full border border-white/10 px-3 py-1 font-semibold"
//                       >
//                         {statusLabel[member.status]}
//                       </button>
//                     </form>
//                   </td>
//                   <td className="px-4 py-4 text-center text-[0.7rem] text-stone-300">
//                     {member.permissions.join(", ")}
//                   </td>
//                   <td className="px-4 py-4 text-center text-[0.7rem] text-stone-300">
//                     {roleLabels[member.role]}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <form className="grid gap-3 text-xs md:grid-cols-2" action={assignRoleAction}>
//           <select
//             name="staffId"
//             className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//           >
//             <option value="">Assign staff</option>
//             {staff.map((member: OperatorStaff) => (
//               <option key={member.id} value={member.id}>
//                 {member.fullName}
//               </option>
//             ))}
//           </select>
//           <select
//             name="roleId"
//             className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//           >
//             <option value="">Select role</option>
//             {roles.map((role: RoleRecord) => (
//               <option key={role.id} value={role.id} disabled={!role.active}>
//                 {role.name} {role.active ? "" : "(disabled)"}
//               </option>
//             ))}
//           </select>
//           <button
//             type="submit"
//             className="rounded-full bg-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-stone-900"
//           >
//             Assign role
//           </button>
//         </form>
//       </section>

//       <section className="space-y-4 rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
//         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-white">Roles & permissions</h2>
//             <p className="text-xs text-stone-300">
//               Create, edit, assign, and deactivate role templates for your staff.
//             </p>
//           </div>
//           <form action={createRoleAction} className="flex flex-wrap gap-2 text-xs">
//             <input
//               name="name"
//               required
//               placeholder="Role title"
//               className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//             />
//             <input
//               name="description"
//               placeholder="Description"
//               className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//             />
//             <input
//               name="permissions"
//               placeholder="Permissions (comma separated)"
//               className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
//             />
//             <button
//               type="submit"
//               className="rounded-full border border-amber-300 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
//             >
//               Create role
//             </button>
//           </form>
//         </div>
//         <div className="grid gap-3 md:grid-cols-2">
//           {roles.map((role: RoleRecord) => (
//             <div key={role.id} className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-300">
//               <div className="flex items-center justify-between">
//                 <p className="text-sm font-semibold text-white">
//                   {role.name} {role.active ? "" : "(disabled)"}
//                 </p>
//                 <form action={disableRoleAction}>
//                   <input type="hidden" name="id" value={role.id} />
//                   <button
//                     type="submit"
//                     className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-semibold"
//                   >
//                     Disable
//                   </button>
//                 </form>
//               </div>
//               <p className="text-[0.65rem] text-stone-400">{role.description}</p>
//               <p className="mt-2 text-[0.65rem] text-stone-400">Permissions:</p>
//               <div className="mt-1 flex flex-wrap gap-1">
//                 {role.permissions.map((permission) => (
//                   <span
//                     key={permission}
//                     className="rounded-full border border-white/10 px-2 py-0.5 text-[0.6rem]"
//                   >
//                     {permission}
//                   </span>
//                 ))}
//               </div>
//               <form action={editRoleAction} className="mt-3 grid gap-2 text-[0.65rem]">
//                 <input type="hidden" name="id" value={role.id} />
//                 <input
//                   name="name"
//                   defaultValue={role.name}
//                   className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
//                 />
//                 <input
//                   name="description"
//                   defaultValue={role.description}
//                   className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
//                 />
//                 <input
//                   name="permissions"
//                   defaultValue={role.permissions.join(", ")}
//                   className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
//                 />
//                 <button
//                   type="submit"
//                   className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-semibold"
//                 >
//                   Update role
//                 </button>
//               </form>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

import {
  getOperatorProfile,
  listDocuments,
  listOperatorStaff,
  listRoles,
  type OperatorDocument,
  type OperatorStaff,
  type RoleRecord,
} from "@/lib/operator-portal";
import {
  addStaffAction,
  assignRoleAction,
  changeStaffRoleAction,
  createRoleAction,
  deactivateOperatorAction,
  editRoleAction,
  editStaffAction,
  disableRoleAction,
  forgotPasswordAction,
  logoutAction,
  removeStaffAction,
  resetPasswordAction,
  toggleStaffStatusAction,
  uploadDocumentAction,
  updateCompanyAction,
} from "@/app/operator/actions";

const roleLabels: Record<string, string> = {
  operations_lead: "Operations Lead",
  sales_lead: "Sales Lead",
  support_lead: "Support Lead",
  finance_lead: "Finance Lead",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  suspended: "Suspended",
};

const docStatusColors: Record<string, string> = {
  uploaded: "text-white bg-stone-700",
  under_review: "text-amber-900 bg-amber-100",
  accepted: "text-emerald-900 bg-emerald-100",
  rejected: "text-rose-900 bg-rose-100",
};

export default async function OperatorDashboardPage() {
  const [profile, staffResult, documentsResult, rolesResult] = await Promise.all([
    getOperatorProfile(),
    listOperatorStaff(),
    listDocuments(),
    listRoles(),
  ]);

  const staff: OperatorStaff[] = Array.isArray(staffResult) ? staffResult : [];
  const documents: OperatorDocument[] = Array.isArray(documentsResult)
    ? documentsResult
    : [];
  const roles: RoleRecord[] = Array.isArray(rolesResult) ? rolesResult : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
          Operator dashboard
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">{profile.companyName}</h1>
            <p className="text-sm text-stone-200">
              Lead by {profile.contactName}. Staff {profile.staffCount}, managing{" "}
              {profile.routesManaged} routes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${
                profile.active
                  ? "border-emerald-300 text-emerald-300"
                  : "border-rose-300 text-rose-300"
              }`}
            >
              {profile.active ? "Active" : "Deactivated"}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-amber-300"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
            <p className="text-xs text-stone-400">Headquarters</p>
            <p className="text-lg font-semibold text-white">{profile.headquarters}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
            <p className="text-xs text-stone-400">Contact</p>
            <p className="text-lg font-semibold text-white">{profile.phone}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
            <p className="text-xs text-stone-400">Email</p>
            <p className="text-lg font-semibold text-white">{profile.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-sm">
            <p className="text-xs text-stone-400">Updated</p>
            <p className="text-lg font-semibold text-white">
              {profile.updatedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:col-span-2">
          <h2 className="text-lg font-semibold text-white">Company profile</h2>
          <form action={updateCompanyAction} className="mt-4 grid gap-3 text-xs">
            <input
              name="companyName"
              defaultValue={profile.companyName}
              required
              className="w-full rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
            />
            <input
              name="contactName"
              defaultValue={profile.contactName}
              required
              className="w-full rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="phone"
                defaultValue={profile.phone}
                required
                className="rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
              />
              <input
                name="email"
                defaultValue={profile.email}
                required
                className="rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
              />
            </div>
            <input
              name="headquarters"
              defaultValue={profile.headquarters}
              required
              className="w-full rounded-full border border-white/20 bg-stone-900 px-4 py-2 text-white"
            />
            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-[0.75rem] font-semibold text-stone-900"
            >
              Save profile
            </button>
          </form>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-stone-900/50 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <h2 className="text-lg font-semibold text-white">Documents & status</h2>
          <p className="mt-1 text-xs text-stone-400">
            Upload registration, insurance, and compliance docs for review.
          </p>

          <form action={uploadDocumentAction} className="mt-4 space-y-3 text-xs">
            <input
              name="name"
              placeholder="Document name"
              className="w-full rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
            />
            <input name="document" type="file" className="text-xs text-stone-300" />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
            >
              Upload
            </button>
          </form>

          <div className="mt-4 space-y-2 text-xs text-stone-300">
            {documents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-stone-900/70 px-3 py-4 text-center text-stone-400">
                No documents uploaded yet.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-stone-900/70 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-white">{doc.name}</p>
                    <p className="text-[0.65rem] text-stone-400">{doc.filename}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold ${
                      docStatusColors[doc.status] ?? "text-white bg-stone-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <form
            action={deactivateOperatorAction}
            className="mt-4 flex justify-between text-[0.7rem] text-stone-300"
          >
            <input type="hidden" name="active" value={profile.active ? "false" : "true"} />
            <button
              type="submit"
              className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white hover:border-rose-300"
            >
              {profile.active ? "Deactivate operator" : "Reactivate operator"}
            </button>
            <span>{profile.active ? "Live on platform" : "Currently deactivated"}</span>
          </form>
        </article>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <h2 className="text-lg font-semibold text-white">Authentication helpers</h2>
        <div className="mt-3 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-[0.75rem] text-stone-300">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
              Credentials
            </p>
            <p className="mt-2 text-sm text-white">
              Login page at <strong>/operator/login</strong>
            </p>
            <p className="text-[0.65rem] text-stone-400">Demo password: operator-demo</p>
          </div>

          <form
            action={forgotPasswordAction}
            className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
              Forgot password
            </p>
            <input
              name="email"
              placeholder="Email"
              className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <button
              type="submit"
              className="mt-2 rounded-full border border-amber-300 px-4 py-2 text-[0.65rem] font-semibold text-amber-200"
            >
              Send reset link
            </button>
          </form>

          <form
            action={resetPasswordAction}
            className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
              Reset password
            </p>
            <input
              name="token"
              placeholder="Reset token"
              className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <input
              name="secret"
              type="password"
              placeholder="New secret"
              className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <button
              type="submit"
              className="mt-2 rounded-full border border-amber-300 px-4 py-2 text-[0.65rem] font-semibold text-amber-200"
            >
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Staff accounts</h2>
            <p className="text-xs text-stone-300">
              Create, edit, suspend, and remove team members.
            </p>
          </div>

          <form action={addStaffAction} className="flex flex-wrap gap-2 text-xs">
            <input
              name="fullName"
              required
              placeholder="Full name"
              className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
            />
            <select
              name="role"
              className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
              defaultValue="operations_lead"
            >
              <option value="operations_lead">Operations</option>
              <option value="sales_lead">Sales</option>
              <option value="support_lead">Support</option>
              <option value="finance_lead">Finance</option>
            </select>
            <button
              type="submit"
              className="rounded-full bg-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-stone-900"
            >
              Add staff
            </button>
          </form>
        </header>

        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <table className="min-w-full text-sm text-stone-100">
            <thead className="bg-white/5 text-stone-300">
              <tr>
                <th className="px-4 py-3 text-left">Team member</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Permissions</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-stone-950">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-400">
                    No staff found.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="text-stone-200">
                    <td className="px-4 py-4">
                      <form action={editStaffAction} className="flex flex-col gap-1 text-xs">
                        <input type="hidden" name="id" value={member.id} />
                        <input
                          name="fullName"
                          defaultValue={member.fullName}
                          className="rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
                        />
                        <div className="flex items-center justify-between text-[0.65rem] text-stone-400">
                          <span>Last seen {member.lastSeen.toLocaleDateString()}</span>
                          <button
                            type="submit"
                            className="rounded-full border border-white/10 px-2 py-0.5 font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </form>

                      <form action={removeStaffAction} className="mt-2 inline-flex gap-2 text-[0.65rem]">
                        <input type="hidden" name="id" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-rose-600 px-3 py-1 font-semibold text-rose-400 hover:border-rose-400"
                        >
                          Remove
                        </button>
                      </form>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <form action={changeStaffRoleAction} className="flex flex-col gap-1 text-[0.7rem]">
                        <input type="hidden" name="id" value={member.id} />
                        <select
                          name="role"
                          defaultValue={member.role}
                          className="rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
                        >
                          {Object.entries(roleLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-full border border-white/10 px-3 py-1 font-semibold"
                        >
                          Save
                        </button>
                      </form>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <form action={toggleStaffStatusAction} className="flex flex-col gap-1 text-[0.65rem]">
                        <input type="hidden" name="id" value={member.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={member.status === "active" ? "suspended" : "active"}
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-white/10 px-3 py-1 font-semibold"
                        >
                          {statusLabel[member.status]}
                        </button>
                      </form>
                    </td>

                    <td className="px-4 py-4 text-center text-[0.7rem] text-stone-300">
                      {member.permissions.join(", ")}
                    </td>

                    <td className="px-4 py-4 text-center text-[0.7rem] text-stone-300">
                      {roleLabels[member.role]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form className="grid gap-3 text-xs md:grid-cols-2" action={assignRoleAction}>
          <select
            name="staffId"
            className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
          >
            <option value="">Assign staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>

          <select
            name="roleId"
            className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} disabled={!role.active}>
                {role.name} {role.active ? "" : "(disabled)"}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-full bg-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-stone-900"
          >
            Assign role
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Roles & permissions</h2>
            <p className="text-xs text-stone-300">
              Create, edit, assign, and deactivate role templates for your staff.
            </p>
          </div>

          <form action={createRoleAction} className="flex flex-wrap gap-2 text-xs">
            <input
              name="name"
              required
              placeholder="Role title"
              className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
            />
            <input
              name="permissions"
              placeholder="Permissions (comma separated)"
              className="rounded-full border border-white/20 bg-stone-900 px-3 py-2 text-white"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-300 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
            >
              Create role
            </button>
          </form>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {roles.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-400">
              No roles found.
            </div>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-300"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {role.name} {role.active ? "" : "(disabled)"}
                  </p>
                  <form action={disableRoleAction}>
                    <input type="hidden" name="id" value={role.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-semibold"
                    >
                      Disable
                    </button>
                  </form>
                </div>

                <p className="text-[0.65rem] text-stone-400">{role.description}</p>

                <p className="mt-2 text-[0.65rem] text-stone-400">Permissions:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[0.6rem]"
                    >
                      {permission}
                    </span>
                  ))}
                </div>

                <form action={editRoleAction} className="mt-3 grid gap-2 text-[0.65rem]">
                  <input type="hidden" name="id" value={role.id} />
                  <input
                    name="name"
                    defaultValue={role.name}
                    className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
                  />
                  <input
                    name="description"
                    defaultValue={role.description}
                    className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
                  />
                  <input
                    name="permissions"
                    defaultValue={role.permissions.join(", ")}
                    className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-1 text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-semibold"
                  >
                    Update role
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}