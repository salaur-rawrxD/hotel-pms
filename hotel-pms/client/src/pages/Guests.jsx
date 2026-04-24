import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function Guests() {
  return (
    <PageWrapper
      title="Guests"
      description="Guest profiles, preferences, and loyalty."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Guest search and profile views will be built here.
        </p>
      </Card>
    </PageWrapper>
  );
}
