import type { Metadata } from "next";
import { ChangePasswordCard } from "@/components/change-password-card";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Minha conta" };

export default function StudentAccount() {
  return (
    <>
      <PageHeader title="Minha conta" />
      <ChangePasswordCard />
    </>
  );
}
