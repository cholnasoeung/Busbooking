import { listBookings } from "@/lib/operator-bookings";
import { listSeatInventories } from "@/lib/operator-inventory";

type DailySalesEntry = {
  date: string;
  totalSales: number;
  trips: number;
};

type OccupancyEntry = {
  tripId: string;
  routeName: string;
  busId: string;
  occupiedSeats: number;
  totalSeats: number;
  occupancyRate: number;
};

type RevenueByRouteEntry = {
  routeName: string;
  revenue: number;
};

type CancellationReportEntry = {
  tripId: string;
  routeName: string;
  passengerName: string;
  reason?: string;
  tripDate: string;
};

type RefundReportEntry = {
  tripId: string;
  routeName: string;
  amount: number;
  tripDate: string;
};

type PopularRoute = {
  routeName: string;
  passengerCount: number;
};

type AgentSalesEntry = {
  agentName: string;
  revenue: number;
};

export type BookingReports = {
  dailySales: DailySalesEntry[];
  occupancy: OccupancyEntry[];
  revenueByRoute: RevenueByRouteEntry[];
  cancellationReport: CancellationReportEntry[];
  refundReport: RefundReportEntry[];
  popularRoutes: PopularRoute[];
  agentSales: AgentSalesEntry[];
};

function currency(value?: number) {
  return Number(value ?? 0);
}

function formatTripDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function buildBookingReports(operatorId: string): Promise<BookingReports> {
  const [bookings, inventories] = await Promise.all([
    listBookings(operatorId),
    listSeatInventories(operatorId),
  ]);

  const inventoryByBus = new Map(inventories.map((inventory) => [inventory.busId, inventory]));

  const dailySalesMap = new Map<string, DailySalesEntry>();
  const revenueByRoute = new Map<string, number>();
  const cancellationEntries: CancellationReportEntry[] = [];
  const refundEntries: RefundReportEntry[] = [];
  const popularRoutes = new Map<string, number>();
  const agentSales = new Map<string, number>();
  const occupancy: OccupancyEntry[] = [];

  bookings.forEach((booking) => {
    const tripDateKey = formatTripDate(booking.tripDate);
    const activePassengers = booking.passengers.filter((passenger) => passenger.status !== "cancelled");
    const occupancyEntry: OccupancyEntry = {
      tripId: booking.id,
      routeName: booking.routeName,
      busId: booking.busId,
      occupiedSeats: activePassengers.length,
      totalSeats: inventoryByBus.get(booking.busId)?.totalSeats ?? 0,
      occupancyRate:
        inventoryByBus.get(booking.busId)?.totalSeats
          ? (activePassengers.length / inventoryByBus.get(booking.busId)!.totalSeats) * 100
          : 0,
    };
    occupancy.push(occupancyEntry);

    const dailyEntry = dailySalesMap.get(tripDateKey) ?? { date: tripDateKey, totalSales: 0, trips: 0 };
    dailyEntry.trips += 1;
    dailySalesMap.set(tripDateKey, dailyEntry);

    booking.passengers.forEach((passenger) => {
      const fare = currency(passenger.farePaid);

      if (passenger.status !== "cancelled") {
        dailyEntry.totalSales += fare;
        popularRoutes.set(
          booking.routeName,
          (popularRoutes.get(booking.routeName) ?? 0) + 1
        );
        if (passenger.agent) {
          agentSales.set(passenger.agent, (agentSales.get(passenger.agent) ?? 0) + fare);
        }
      }

      if (passenger.status === "cancelled") {
        cancellationEntries.push({
          tripId: booking.id,
          routeName: booking.routeName,
          passengerName: passenger.fullName,
          reason: passenger.cancellationReason,
          tripDate: tripDateKey,
        });
        refundEntries.push({
          tripId: booking.id,
          routeName: booking.routeName,
          amount: fare,
          tripDate: tripDateKey,
        });
      } else {
        revenueByRoute.set(booking.routeName, (revenueByRoute.get(booking.routeName) ?? 0) + fare);
      }
    });
    dailySalesMap.set(
      tripDateKey,
      {
        date: tripDateKey,
        totalSales: (dailySalesMap.get(tripDateKey)?.totalSales ?? 0) + 0,
        trips: (dailySalesMap.get(tripDateKey)?.trips ?? 0) + 1,
      }
    );
  });

  const dailySales = Array.from(dailySalesMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  const revenueEntries = Array.from(revenueByRoute.entries()).map(([routeName, revenue]) => ({
    routeName,
    revenue,
  }));
  const popularRouteList = Array.from(popularRoutes.entries())
    .map(([routeName, passengerCount]) => ({ routeName, passengerCount }))
    .sort((a, b) => b.passengerCount - a.passengerCount);
  const agentSalesEntries = Array.from(agentSales.entries())
    .map(([agentName, revenue]) => ({ agentName, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    dailySales,
    occupancy,
    revenueByRoute: revenueEntries,
    cancellationReport: cancellationEntries,
    refundReport: refundEntries,
    popularRoutes: popularRouteList,
    agentSales: agentSalesEntries,
  };
}
