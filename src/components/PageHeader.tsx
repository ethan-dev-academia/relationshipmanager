export default function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="safe-top mb-5 flex items-end justify-between px-5 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-rose-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-rose-500/80">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}
