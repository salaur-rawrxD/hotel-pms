import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function RatesYield() {
  return (
    <PageWrapper
      title="Rates & Yield"
      description="Daily rates, restrictions, and yield rules."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Rate calendar and yield controls will be built here.
        </p>
      </Card>
    </PageWrapper>
  );
}
