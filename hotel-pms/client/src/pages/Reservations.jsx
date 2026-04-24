import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function Reservations() {
  return (
    <PageWrapper
      title="Reservations"
      description="Search, filter, and manage all bookings."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Reservation list and booking workflows will be built here.
        </p>
      </Card>
    </PageWrapper>
  );
}
