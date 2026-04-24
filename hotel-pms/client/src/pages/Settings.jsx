import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";

export default function Settings() {
  return (
    <PageWrapper
      title="Settings"
      description="Property, user, and system settings."
    >
      <Card>
        <p className="text-sm text-slate-400">
          Settings screens will be built here.
        </p>
      </Card>
    </PageWrapper>
  );
}
