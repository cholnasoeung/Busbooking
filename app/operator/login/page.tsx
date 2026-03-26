import { operatorLoginAction } from "@/app/operator/actions";

export default function OperatorLoginPage() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md rounded-[28px] border border-stone-700 bg-white/5 p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Operator login</p>
        <h1 className="mt-4 text-3xl font-semibold">Access the backend</h1>
        <p className="mt-2 text-sm text-stone-200">
          Use the operator demo secret (<strong>operator-demo</strong>) to open the portal.
        </p>
        <form action={operatorLoginAction} className="mt-6 space-y-3 text-xs">
          <input
            name="identifier"
            required
            placeholder="Email / phone / operator name"
            className="w-full rounded-full border border-stone-600 bg-stone-900 px-4 py-3 text-white"
          />
          <input
            name="secret"
            required
            placeholder="Password"
            type="password"
            className="w-full rounded-full border border-stone-600 bg-stone-900 px-4 py-3 text-white"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-amber-400 px-4 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
