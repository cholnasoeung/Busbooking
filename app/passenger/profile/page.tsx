export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getPassengerDashboardData,
  getPassengerSessionFromCookies,
} from "@/lib/passenger-management";
import { PassengerProfileManagement } from "./profile-management";

export default async function PassengerProfilePage() {
  const cookieStore = await cookies();
  const session = await getPassengerSessionFromCookies(cookieStore);

  if (!session) {
    redirect("/passenger/login?redirect=/passenger/profile");
  }

  const dashboard = await getPassengerDashboardData(session.id);

  return <PassengerProfileManagement initialProfile={dashboard.profile} initialBookings={dashboard.bookings} />;
}
