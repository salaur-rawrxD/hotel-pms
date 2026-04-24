import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function Reports() {
  return (
    <PageWrapper
      title="Reports"
      description="Occupancy, revenue, and operational analytics."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Reports and charts will be built here.
        </p>
      </Card>
    </PageWrapper>
  );
}
