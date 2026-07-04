import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card
      className={cn(
        "glass-card border-white/[0.08] shadow-none",
        fullHeight && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      {(title || description || action) && (
        <CardHeader className="flex-row items-start justify-between space-y-0 p-5 pb-0 md:p-6 md:pb-0">
          <div className="space-y-1">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent
        className={cn(
          "p-5 pt-4 md:p-6 md:pt-4",
          fullHeight && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
