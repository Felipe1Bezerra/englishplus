import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { login } from "@/app/actions/auth";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { AuthCard } from "@/components/auth-card";
import { Field } from "@/components/ui";
import { getUser, homeFor, safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <AuthCard title="Entrar" description="Acesse suas aulas, calendário e acompanhamento.">
      <Suspense>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginForm({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const next = safeNext((await searchParams).next);
  const user = await getUser();
  if (user) redirect(next ?? homeFor(user.role));

  return (
    <>
      <ActionForm action={login} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <SubmitButton className="w-full" pendingLabel="Entrando…">
          Entrar
        </SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href={next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro"}
          className="font-bold text-navy underline decoration-gold underline-offset-4"
        >
          Criar conta
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Esqueceu a senha? Fale com o professor no WhatsApp.
      </p>
    </>
  );
}
