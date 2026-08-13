import { cn } from "@/lib/utils";

export default function GlassCard({
  children,
  className,
  strong,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div className={cn(strong ? "glass-strong" : "glass", "p-5", className)}>
      {children}
    </div>
  );
}
