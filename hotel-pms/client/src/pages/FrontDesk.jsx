import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function FrontDesk() {
  return (
    <PageWrapper
      title="Front Desk"
      description="Check-in, check-out, and in-house guests."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Arrivals, departures, and folio management will live here.
        </p>
      </Card>
    </PageWrapper>
  );
}
