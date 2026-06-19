"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: number;
  used: number;
}

export default function FreeTierExhaustedModal({
  open,
  onOpenChange,
  limit,
  used,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("freeTierModal");

  const goToBilling = () => {
    router.push(`/${locale}/settings/billing`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { used, limit })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("upgradeLater")}
          </Button>
          <Button onClick={goToBilling}>{t("upgradeToPro")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
