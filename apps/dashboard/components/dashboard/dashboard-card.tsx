import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  className,
  title,
  description,
  action,
  fullHeight = false,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <section
      className={cn(
        "glass-card flex flex-col p-5 md:p-6",
        fullHeight && "h-full min-h-0",
        className,
      )}
    >
      {(title || description || action) && (
        <header className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={cn(fullHeight && "flex min-h-0 flex-1 flex-col")}>
        {children}
      </div>
    </section>
  );
}
