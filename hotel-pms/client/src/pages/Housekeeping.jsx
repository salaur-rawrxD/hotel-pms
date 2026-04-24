import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function Housekeeping() {
  return (
    <PageWrapper
      title="Housekeeping"
      description="Task assignments and room readiness."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Housekeeping queue and room inspection board will be built here.
        </p>
      </Card>
    </PageWrapper>
  );
}
