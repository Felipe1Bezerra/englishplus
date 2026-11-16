"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { connectYoutube, loadYoutubeVideos } from "@/app/actions/admin";
import type { YoutubeStatus, YoutubeVideo } from "@/lib/api";
import { youtubeId, youtubeThumbnail } from "@/lib/youtube";

const INPUT =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70";

const PRIVACY_LABEL: Record<string, string> = {
  public: "Público",
  unlisted: "Não listado",
  private: "Privado",
};

/** The lesson's video link: paste one, or pick from the teacher's YouTube channel. */
export function VideoField({
  defaultValue,
  youtube,
}: {
  defaultValue?: string | null;
  youtube: YoutubeStatus;
}) {
  const initial = defaultValue ?? "";
  const [value, setValue] = useState(initial);
  // The page can hold several lesson forms; only the ones opened ask YouTube for videos.
  const [pickerOpened, setPickerOpened] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = youtubeId(value);

  // After a successful "create", React resets the form; clear the link with it.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onReset = () => setValue(initial);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [initial]);

  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Link do vídeo</span>
        <input
          ref={input}
          className={INPUT}
          name="videoUrl"
          type="url"
          placeholder="https://"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>

      {id && (
        <div className="mt-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, small */}
          <img
            src={youtubeThumbnail(id)}
            alt=""
            className="aspect-video w-28 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => setValue("")}
            className="text-xs font-bold text-bad hover:underline"
          >
            Remover vídeo
          </button>
        </div>
      )}

      <div className="mt-2">
        {!youtube.configured ? (
          <p className="text-xs text-muted-foreground">
            Cole o link do vídeo. Para escolher direto do seu canal, configure a conexão com o
            YouTube (veja o README).
          </p>
        ) : youtube.connected ? (
          <button
            type="button"
            onClick={() => {
              setPickerOpened(true);
              dialog.current?.showModal();
            }}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-navy hover:border-navy"
          >
            Escolher do YouTube
          </button>
        ) : (
          <ConnectYoutubeButton label="Conectar YouTube para escolher vídeos" />
        )}
      </div>

      {youtube.connected && (
        <dialog
          ref={dialog}
          className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground backdrop:bg-navy/50"
          onClick={(event) => {
            if (event.target === dialog.current) dialog.current.close();
          }}
        >
          {pickerOpened && (
            <VideoPicker
              channelTitle={youtube.channelTitle}
              onPick={(video) => {
                setValue(video.url);
                dialog.current?.close();
              }}
              onClose={() => dialog.current?.close()}
            />
          )}
        </dialog>
      )}
    </div>
  );
}

function VideoPicker({
  channelTitle,
  onPick,
  onClose,
}: {
  channelTitle: string | null;
  onPick: (video: YoutubeVideo) => void;
  onClose: () => void;
}) {
  const [videos, setVideos] = useState<YoutubeVideo[] | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [isLoading, startLoading] = useTransition();
  const started = useRef(false);

  function load(pageToken?: string) {
    startLoading(async () => {
      const result = await loadYoutubeVideos(pageToken);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setVideos((current) => [...(pageToken ? (current ?? []) : []), ...result.page.videos]);
      setNextPage(result.page.nextPageToken);
    });
  }

  // Mounted on first open; load the first page once.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    load();
  }, []);

  const needle = filter.trim().toLowerCase();
  const shown = (videos ?? []).filter((video) => video.title.toLowerCase().includes(needle));

  return (
    <div className="flex max-h-[85vh] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <p className="font-bold text-navy">Escolher vídeo</p>
          {channelTitle && (
            <p className="truncate text-sm text-muted-foreground">Canal: {channelTitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-full border border-border px-3 py-1 text-sm font-bold text-navy hover:border-navy"
        >
          ✕
        </button>
      </div>

      <div className="border-b border-border p-4">
        <input
          className={INPUT}
          type="search"
          placeholder="Filtrar pelo título"
          aria-label="Filtrar vídeos pelo título"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          onKeyDown={(event) => {
            // Enter here would submit the lesson form behind the dialog.
            if (event.key === "Enter") event.preventDefault();
          }}
        />
      </div>

      <div className="overflow-y-auto p-4">
        {error && <p className="mb-3 text-sm font-medium text-bad">{error}</p>}
        {videos === null && isLoading && (
          <p className="text-sm text-muted-foreground">Carregando seus vídeos…</p>
        )}
        {videos !== null && videos.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum vídeo enviado neste canal ainda.</p>
        )}
        {videos !== null && videos.length > 0 && shown.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum vídeo carregado com esse título.
            {nextPage && " Carregue mais vídeos para procurar nos mais antigos."}
          </p>
        )}

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((video) => {
            const isPrivate = video.privacy === "private";
            return (
              <li key={video.id}>
                <button
                  type="button"
                  disabled={isPrivate}
                  onClick={() => onPick(video)}
                  className="group w-full overflow-hidden rounded-xl border border-border text-left hover:border-navy disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail */}
                  <img
                    src={video.thumbnailUrl ?? youtubeThumbnail(video.id)}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full bg-muted object-cover"
                  />
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-navy">{video.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {PRIVACY_LABEL[video.privacy] ?? video.privacy} ·{" "}
                      {new Date(video.publishedAt).toLocaleDateString("pt-BR")}
                    </p>
                    {isPrivate && (
                      <p className="mt-1 text-xs text-bad">
                        Alunos não conseguem ver vídeos privados. Mude para “Não listado” no
                        YouTube.
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {nextPage && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => load(nextPage)}
            className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-navy hover:border-navy disabled:opacity-60"
          >
            {isLoading ? "Carregando…" : "Carregar mais"}
          </button>
        )}
      </div>
    </div>
  );
}

/** Leaves for Google's consent screen, then comes back to this page. */
export function ConnectYoutubeButton({ label = "Conectar YouTube" }: { label?: string }) {
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await connectYoutube(pathname);
            if (result?.error) setError(result.error);
          })
        }
        className="rounded-full bg-[#ff0033] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Abrindo o Google…" : label}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-bad">{error}</p>}
    </div>
  );
}
