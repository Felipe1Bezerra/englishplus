import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";

/** Google sends the teacher here after they allow (or refuse) access to their channel. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");

  if (params.get("error") || !code || !state) {
    redirect(failed("A conexão com o YouTube foi cancelada."));
  }

  let target: string;
  try {
    const { returnTo } = await api<{ returnTo: string }>("/admin/youtube/callback", {
      method: "POST",
      body: { code, state },
    });
    target = returnTo;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      target = "/entrar?next=/admin/conta";
    } else {
      if (!(error instanceof ApiError)) console.error(error);
      target = failed(
        error instanceof ApiError ? error.message : "Não foi possível conectar o YouTube.",
      );
    }
  }
  redirect(target);
}

const failed = (message: string) => `/admin/conta?youtube_erro=${encodeURIComponent(message)}`;
