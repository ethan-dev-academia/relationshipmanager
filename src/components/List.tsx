import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** A grouped section: optional header/footer labels around an inset list. */
export function Section({
  header,
  footer,
  children,
  className,
}: {
  header?: string;
  footer?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-4 ${className ?? ""}`}>
      {header && <p className="group-header uppercase">{header}</p>}
      <div className="list">{children}</div>
      {footer && <p className="group-footer">{footer}</p>}
    </section>
  );
}

/**
 * A single row. Provide `href` to make it a navigation row (adds a chevron),
 * `onClick` for an action row, or neither for a static row. `tile` is the
 * leading rounded-square icon; when present, the separator insets to align.
 */
export function Row({
  tile,
  title,
  subtitle,
  value,
  accessory,
  href,
  onClick,
  chevron,
}: {
  tile?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  accessory?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
}) {
  const showChevron = chevron ?? Boolean(href);
  const tappable = Boolean(href || onClick);

  const inner = (
    <div
      className={`row ${tappable ? "row-tap" : ""}`}
      style={tile ? ({ "--sep-inset": "58px" } as React.CSSProperties) : undefined}
    >
      {tile}
      <div className="min-w-0 flex-1">
        <div className="t-body c-label truncate">{title}</div>
        {subtitle && <div className="t-footnote c-label-2 truncate">{subtitle}</div>}
      </div>
      {value && <div className="t-body c-label-2 shrink-0">{value}</div>}
      {accessory}
      {showChevron && (
        <ChevronRight size={18} strokeWidth={2.5} className="c-label-3 shrink-0" />
      )}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick)
    return (
      <button onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  return inner;
}
