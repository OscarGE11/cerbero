export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-white/[0.06]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-5">
        <div className="space-y-4 md:col-span-2">
          <div className="h-40 rounded-xl bg-white/[0.04]" />
          <div className="h-32 rounded-xl bg-white/[0.04]" />
        </div>
        <div className="h-[480px] rounded-xl bg-white/[0.04] md:col-span-3" />
      </div>
    </div>
  );
}
