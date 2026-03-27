import { LoginForm } from "./login-form";
import { sanitizeAdminRedirect } from "@/lib/admin-auth";

type PageProps = {
  searchParams?: {
    redirect?: string;
  };
};

export default function AdminLoginPage({ searchParams }: PageProps) {
  const redirectTo = sanitizeAdminRedirect(searchParams?.redirect);

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-[32px] border border-stone-800 bg-gradient-to-br from-stone-900/90 to-stone-950/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
        <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Admin login</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Secure console</h1>
        <p className="mt-2 text-sm text-stone-400">
          Sign in to manage operators, fares, and escalations from one command center.
        </p>
        <div className="mt-6 rounded-[24px] border border-white/10 bg-stone-900/70 p-6">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
