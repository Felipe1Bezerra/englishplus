import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { register } from "@/app/actions/auth";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { AuthCard } from "@/components/auth-card";
import { Field } from "@/components/ui";
import { getUser, homeFor, safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage({ searchParams }: PageProps<"/cadastro">) {
  return (
    <AuthCard title="Criar conta" description="Leva menos de um minuto.">
      <Suspense>
        <RegisterForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function RegisterForm({ searchParams }: Pick<PageProps<"/cadastro">, "searchParams">) {
  const next = safeNext((await searchParams).next);
  const user = await getUser();
  if (user) redirect(next ?? homeFor(user.role));

  return (
    <>
      <ActionForm action={register} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <Field label="Nome completo" name="name" autoComplete="name" required />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          hint="Pelo menos 8 caracteres."
          required
        />
        <SubmitButton className="w-full" pendingLabel="Criando…">
          Criar conta
        </SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href={next ? `/entrar?next=${encodeURIComponent(next)}` : "/entrar"}
          className="font-bold text-navy underline decoration-gold underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
