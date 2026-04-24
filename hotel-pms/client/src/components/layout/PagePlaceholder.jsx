export default function PagePlaceholder({ title }) {
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-start justify-start">
      <h1 className="font-serif text-3xl font-bold text-navy-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        This module is coming soon.
      </p>
    </div>
  );
}
