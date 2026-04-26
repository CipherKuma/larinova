"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/codes", label: "Invite codes" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/surveys", label: "Survey responses" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/issues", label: "Issues" },
];

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-border h-dvh sticky top-0 p-4 bg-background">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4 px-2">
        Larinova · Admin
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const localized = `/${locale}${item.href}`;
          const isActive =
            pathname === localized ||
            (item.href !== "/admin" && pathname.startsWith(localized));
          return (
            <Link
              key={item.href}
              href={localized}
              className={
                "px-3 py-2 rounded-md text-sm transition " +
                (isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
