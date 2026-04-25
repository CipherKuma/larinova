import BillingClient from "./BillingClient";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return <BillingClient />;
}
