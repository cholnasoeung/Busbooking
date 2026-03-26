import { SideNavigation } from "./components/side-navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-screen bg-[linear-gradient(180deg,#f6f0e8_0%,#f4efe8_40%,#f9f7f2_100%)] text-stone-950">
      <div className="flex min-h-screen w-full flex-col gap-6 px-2 py-4 lg:flex-row lg:px-4">
        <aside className="w-full rounded-[28px] border border-stone-200 bg-stone-950 p-6 text-stone-100 shadow-[0_30px_80px_rgba(28,25,23,0.16)] lg:w-72">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
              Platform Owner
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Admin Console</h1>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Control operators, passengers, and internal staff from one
              command center.
            </p>
          </div>

          <SideNavigation />
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
