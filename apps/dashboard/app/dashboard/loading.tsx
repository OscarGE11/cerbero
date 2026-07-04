import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-5">
        <div className="space-y-4 md:col-span-2">
          <Card className="glass-card border-white/[0.08] shadow-none">
            <CardContent className="p-6">
              <Skeleton className="h-40 rounded-xl" />
            </CardContent>
          </Card>
          <Card className="glass-card border-white/[0.08] shadow-none">
            <CardContent className="p-6">
              <Skeleton className="h-32 rounded-xl" />
            </CardContent>
          </Card>
        </div>
        <Card className="glass-card border-white/[0.08] shadow-none md:col-span-3">
          <CardContent className="p-6">
            <Skeleton className="h-[480px] rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
