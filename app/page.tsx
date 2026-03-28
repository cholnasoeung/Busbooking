import Link from "next/link";
import { busTypeCatalog, listOperatorBuses } from "@/lib/operator-bus-management";
import { listOperatorRoutes } from "@/lib/operator-route-management";
import { formatDate } from "@/lib/display-utils";

// Helper for bus type labels
const typeLabelLookup = Object.fromEntries(
  busTypeCatalog.map((type) => [type.id, type.label])
) as Record<string, string>;

export default async function Home() {
  const operatorId = "OP-201";
  const [routes, buses] = await Promise.all([
    listOperatorRoutes(operatorId),
    listOperatorBuses(operatorId),
  ]);

  const heroBus = buses[0];
  const activeCount = buses.filter((b) => b.status === "active").length;
  const fromCities = Array.from(new Set(routes.map((r) => r.fromCity)));
  const toCities = Array.from(new Set(routes.map((r) => r.toCity)));
  const todayValue = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-[#fcfaf8] text-stone-900 selection:bg-red-100">
      {/* --- MODERN HERO SECTION --- */}
      <section className="relative overflow-hidden bg-[#121214] px-6 py-20 text-white lg:px-14">
        {/* Abstract Background Glows */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-[1400px]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-red-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Fleet Live Status
              </div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
                The pulse of <span className="text-red-500">Cambodia’s</span> roads.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-stone-400">
                Manage your fleet with precision. Track {activeCount} active vehicles and 
                instantly sync routes to the global redBus network.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/operator/routes" className="rounded-2xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-tighter text-black transition hover:scale-105 active:scale-95">
                  Manage Routes
                </Link>
                <Link href="/operator/buses" className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-tighter backdrop-blur-md transition hover:bg-white/10">
                  Fleet Overview
                </Link>
              </div>
            </div>

            {/* Featured Bus "Glass" Card */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-red-500 to-orange-500 opacity-20 blur transition duration-1000 group-hover:opacity-40" />
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Premium Fleet</p>
                    <h2 className="mt-1 text-3xl font-bold">{heroBus?.name || "Unassigned"}</h2>
                  </div>
                  <span className="rounded-lg bg-green-500/20 px-3 py-1 text-[10px] font-bold uppercase text-green-400 border border-green-500/30">
                    {heroBus?.status || "Offline"}
                  </span>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-stone-500 font-bold tracking-tighter">Registration</p>
                    <p className="text-sm font-medium">{heroBus?.registration?.registrationNumber || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-stone-500 font-bold tracking-tighter">Type</p>
                    <p className="text-sm font-medium">{heroBus ? typeLabelLookup[heroBus.type] : "Standard"}</p>
                  </div>
                </div>
                
                <div className="mt-8 rounded-2xl bg-white/5 p-4 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 flex items-center justify-center text-xs font-bold">
                      {heroBus?.driver?.name?.[0] || "D"}
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 font-bold uppercase tracking-tighter">Assigned Driver</p>
                      <p className="text-sm font-semibold">{heroBus?.driver?.name || "Awaiting Assignment"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEARCH OVERLAP SECTION --- */}
      <section className="relative z-10 -mt-12 px-6">
        <div className="mx-auto max-w-5xl rounded-[40px] border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-200/50">
          <form action="/search" method="get" className="grid items-end gap-4 p-4 lg:grid-cols-12">
            <div className="lg:col-span-3 space-y-2">
              <label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">Origin</label>
              <select name="from" className="w-full rounded-2xl border-stone-100 bg-stone-50 py-3 pl-4 text-sm font-semibold focus:ring-2 focus:ring-red-500 outline-none">
                {fromCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="lg:col-span-3 space-y-2">
              <label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">Destination</label>
              <select name="to" className="w-full rounded-2xl border-stone-100 bg-stone-50 py-3 pl-4 text-sm font-semibold focus:ring-2 focus:ring-red-500 outline-none">
                {toCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="lg:col-span-3 space-y-2">
              <label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">Date</label>
              <input type="date" name="date" defaultValue={todayValue} className="w-full rounded-2xl border-stone-100 bg-stone-50 py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="lg:col-span-3">
              <button type="submit" className="w-full rounded-2xl bg-[#d82c27] py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-black active:scale-[0.98]">
                Find Departures
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* --- OFFERS BENTO GRID --- */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-14">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">Operator Perks</p>
            <h2 className="text-4xl font-bold tracking-tight text-stone-900">Promotions & Loyalty</h2>
          </div>
          <Link href="/operator/pricing" className="hidden text-sm font-bold text-stone-400 hover:text-stone-900 sm:block">
            View all rewards →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-12 md:grid-rows-2 h-[500px]">
          <article className="md:col-span-8 md:row-span-2 rounded-[32px] bg-[#fff1f0] p-10 flex flex-col justify-end border border-red-100 group transition-all hover:bg-[#ffe7e5]">
             <span className="mb-4 inline-block w-fit rounded-full bg-red-100 px-4 py-1 text-[10px] font-black uppercase text-red-600">Flash Sale</span>
             <h3 className="text-3xl font-bold leading-tight text-stone-900 max-w-sm">Save $10 on combo Bus & Ferry bookings</h3>
             <p className="mt-4 text-stone-600">Integrated routes across Sihanoukville and the islands are now 15% cheaper for operators to list.</p>
          </article>
          
          <article className="md:col-span-4 md:row-span-1 rounded-[32px] bg-stone-900 p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <h3 className="text-xl font-bold">50% Off PP Routes</h3>
            <p className="text-sm text-stone-400">Limited time listing discount for new Mekong routes.</p>
          </article>

          <article className="md:col-span-4 md:row-span-1 rounded-[32px] border border-stone-200 bg-white p-8 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold">Loyalty Points</h3>
            <p className="text-sm text-stone-500 mt-2">Earn 2x points for every online booking processed via redBus Cambodia.</p>
          </article>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a0a0b] py-20 text-stone-500">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-14">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2 space-y-6">
              <p className="text-xl font-black text-white italic">redBus</p>
              <p className="max-w-xs text-sm leading-relaxed">
                Empowering Cambodian operators with world-class logistics tools and seamless passenger integration.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Platform</h4>
              <nav className="flex flex-col gap-2 text-sm font-medium">
                <Link href="/routes" className="hover:text-white">Route Engine</Link>
                <Link href="/buses" className="hover:text-white">Fleet Manager</Link>
                <Link href="/analytics" className="hover:text-white">Live Analytics</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Support</h4>
              <p className="text-sm font-medium text-white">support@redbus.com.kh</p>
              <p className="text-sm">+855 23 999 000</p>
            </div>
          </div>
          <div className="mt-20 border-t border-white/5 pt-8 text-center text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} redBus Cambodia · Powered by MongoDB
          </div>
        </div>
      </footer>
    </main>
  );
}
