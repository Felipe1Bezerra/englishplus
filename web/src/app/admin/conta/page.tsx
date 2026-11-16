import type { Metadata } from "next";
import { disconnectYoutube } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { ChangePasswordCard } from "@/components/change-password-card";
import { Card, PageHeader } from "@/components/ui";
import { ConnectYoutubeButton } from "@/components/video-field";
import { pageApi, type YoutubeStatus } from "@/lib/api";

export const metadata: Metadata = { title: "Minha conta" };

export default async function TeacherAccount({ searchParams }: PageProps<"/admin/conta">) {
  const [{ youtube_erro: youtubeError }, youtube] = await Promise.all([
    searchParams,
    pageApi<YoutubeStatus>("/admin/youtube"),
  ]);

  return (
    <>
      <PageHeader title="Minha conta" />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ChangePasswordCard />

        <Card title="YouTube">
          {typeof youtubeError === "string" && (
            <p className="mb-3 text-sm font-medium text-bad">{youtubeError}</p>
          )}
          {!youtube.configured ? (
            <p className="text-sm text-muted-foreground">
              A conexão com o YouTube ainda não está configurada. Defina GOOGLE_CLIENT_ID e
              GOOGLE_CLIENT_SECRET na API (veja o README).
            </p>
          ) : youtube.connected ? (
            <>
              <p className="text-sm">
                Conectado ao canal <strong className="text-navy">{youtube.channelTitle}</strong>.
                Nas aulas, use “Escolher do YouTube” no campo do vídeo.
              </p>
              <ActionForm
                action={disconnectYoutube}
                confirmMessage="Desconectar o YouTube? Os vídeos já escolhidos continuam nas aulas."
                className="mt-4"
              >
                <SubmitButton variant="danger" pendingLabel="Desconectando…">
                  Desconectar
                </SubmitButton>
              </ActionForm>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Conecte o seu canal para escolher os vídeos das aulas direto da sua lista. O acesso
                é só de leitura: nada é publicado no YouTube.
              </p>
              <ConnectYoutubeButton />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
