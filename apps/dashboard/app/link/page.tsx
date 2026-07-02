import { LinkPage } from "@/features/link/components/LinkPage";

export default function Page({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <LinkPage token={searchParams.token} />;
}
