export type PassengerAccountStatus = "active" | "suspended" | "pending_review";

export type PassengerSession = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
};

export type PassengerProfile = PassengerSession & {
  tripsCompleted: number;
  lastBooking: string;
  status: PassengerAccountStatus;
  createdAt: string;
  updatedAt: string;
};

export type PassengerBookingSummary = {
  bookingId: string;
  passengerRecordId: string;
  routeName: string;
  origin: string;
  destination: string;
  tripDate: string;
  departureTime: string;
  arrivalTime: string;
  bookingStatus: "scheduled" | "in_progress" | "completed" | "cancelled";
  passengerStatus: "booked" | "checked_in" | "boarded" | "cancelled" | "rescheduled";
  seat: string;
  farePaid: number;
  boardingPoint?: string;
  droppingPoint?: string;
  createdAt: string;
  updatedAt: string;
};
