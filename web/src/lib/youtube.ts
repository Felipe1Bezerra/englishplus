/** The video id in a YouTube link (watch, youtu.be, shorts, embed or live), or null. */
export function youtubeId(link: string | null | undefined): string | null {
  if (!link) return null;
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id =
      url.searchParams.get("v") ??
      url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ??
      null;
  }
  return id && /^[\w-]{6,20}$/.test(id) ? id : null;
}

export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

/** The privacy-enhanced player, which sets no cookies until the student presses play. */
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
