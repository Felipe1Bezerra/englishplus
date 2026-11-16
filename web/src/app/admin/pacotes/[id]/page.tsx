import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageForm } from "@/components/package-form";
import { PageHeader } from "@/components/ui";
import { pageApi, type AdminCourse, type AdminPackage } from "@/lib/api";

export const metadata: Metadata = { title: "Editar pacote" };

export default async function EditPackagePage({ params }: PageProps<"/admin/pacotes/[id]">) {
  const { id } = await params;
  const [packages, courses] = await Promise.all([
    pageApi<AdminPackage[]>("/admin/packages"),
    pageApi<AdminCourse[]>("/admin/courses"),
  ]);

  const item = packages.find((candidate) => candidate.id === id);
  if (!item) notFound();

  return (
    <>
      <Link href="/admin/pacotes" className="text-sm text-muted-foreground hover:text-navy">
        ← Todos os pacotes
      </Link>
      <div className="mt-4">
        <PageHeader title={item.name} />
      </div>
      <PackageForm item={item} courses={courses} />
    </>
  );
}
