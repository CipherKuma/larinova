import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export type SurveyRow = {
  id: string;
  created_at: string;
  locale: "en" | "id";
  name: string;
  specialization: string;
  clinic: string;
  city: string;
  whatsapp: string;
  email: string | null;
  patients_per_day: string | null;
  data_storage: string[];
  data_storage_other: string | null;
  paperwork_time: string | null;
  shift_notes: string | null;
  referral_time: string | null;
  problems: string[];
  priorities: string[];
  tell_us_more: string | null;
};

export default async function AdminPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("larinova_discovery_surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch error:", error);
  }

  return <AdminDashboard responses={(data as SurveyRow[]) ?? []} />;
}
