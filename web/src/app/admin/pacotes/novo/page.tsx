import type { Metadata } from "next";
import Link from "next/link";
import { PackageForm } from "@/components/package-form";
import { PageHeader } from "@/components/ui";
import { pageApi, type AdminCourse } from "@/lib/api";

export const metadata: Metadata = { title: "Novo pacote" };

export default async function NewPackagePage() {
  const courses = await pageApi<AdminCourse[]>("/admin/courses");

  return (
    <>
      <Link href="/admin/pacotes" className="text-sm text-muted-foreground hover:text-navy">
        ← Todos os pacotes
      </Link>
      <div className="mt-4">
        <PageHeader title="Novo pacote" />
      </div>
      <PackageForm courses={courses} />
    </>
  );
}
