import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "./AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireAdmin();
  if (!user) redirect(`/${locale}/sign-in`);

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar locale={locale} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
