import { PassengerLoginClient } from "./client";
import { sanitizePassengerRedirect } from "@/lib/passenger-management";

type PassengerLoginPageProps = {
  searchParams?: { redirect?: string };
};

export default function PassengerLoginPage({ searchParams }: PassengerLoginPageProps) {
  const redirectTo = sanitizePassengerRedirect(searchParams?.redirect);

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white p-8 text-stone-900 shadow-[0_50px_90px_rgba(15,23,42,0.35)]">
        <PassengerLoginClient redirectTo={redirectTo} />
      </div>
    </section>
  );
}
