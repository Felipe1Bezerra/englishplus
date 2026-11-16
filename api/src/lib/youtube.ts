import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { youtubeAccounts } from "../db/schema.js";
import { env } from "../env.js";
import { HttpError } from "./http.js";

/*
 * Connects the teacher's YouTube channel with Google OAuth, read-only, so the lesson form can
 * list the channel's uploads. Nothing is ever posted to YouTube.
 */

const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
const STATE_TTL_MS = 10 * 60 * 1000;

/** Google sends the teacher back to this website page, which finishes the connection. */
export const redirectUri = () => `${env.webUrl}/admin/youtube/retorno`;

export const isConfigured = () => Boolean(env.googleClientId && env.googleClientSecret);

function requireConfigured() {
  if (!isConfigured()) {
    throw new HttpError(
      409,
      "A conexão com o YouTube não está configurada. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET na API.",
    );
  }
}

/*
 * Each connection attempt gets a one-time state, tied to the teacher who started it, so a
 * link from someone else can't attach their channel to this account. Kept in memory: an
 * attempt interrupted by an API restart just needs another click.
 */
const pendingStates = new Map<string, { userId: string; returnTo: string; expiresAt: number }>();

export function startConnection(userId: string, returnTo: string): string {
  requireConfigured();
  const now = Date.now();
  for (const [key, value] of pendingStates) if (value.expiresAt < now) pendingStates.delete(key);

  const state = randomBytes(24).toString("base64url");
  pendingStates.set(state, { userId, returnTo, expiresAt: now + STATE_TTL_MS });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: env.googleClientId!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    // Without it Google only sends a refresh token the very first time.
    prompt: "consent",
    state,
  }).toString();
  return url.toString();
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleClientId!,
      client_secret: env.googleClientSecret!,
      ...params,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as TokenResponse & { error?: string };
  if (!res.ok) {
    if (body.error === "invalid_grant") throw new InvalidGrant();
    throw new Error(`Google token request failed: ${res.status} ${body.error ?? ""}`);
  }
  return body;
}

class InvalidGrant extends Error {}

async function youtubeGet<T>(path: string, accessToken: string, query: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  url.search = new URLSearchParams(query).toString();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`YouTube ${path} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

interface ChannelsResponse {
  items?: {
    id: string;
    snippet: { title: string };
    contentDetails: { relatedPlaylists: { uploads: string } };
  }[];
}

/** Finishes a connection Google sent back. Returns where the teacher was before. */
export async function finishConnection(userId: string, code: string, state: string) {
  requireConfigured();
  const pending = pendingStates.get(state);
  pendingStates.delete(state);
  if (!pending || pending.userId !== userId || pending.expiresAt < Date.now()) {
    throw new HttpError(400, "A conexão expirou. Clique em conectar o YouTube de novo.");
  }

  let tokens: TokenResponse;
  try {
    tokens = await tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    });
  } catch (error) {
    if (error instanceof InvalidGrant) {
      throw new HttpError(400, "O Google recusou a conexão. Tente de novo.");
    }
    throw error;
  }
  if (!tokens.refresh_token) {
    throw new HttpError(400, "O Google não liberou o acesso contínuo. Tente conectar de novo.");
  }

  const channels = await youtubeGet<ChannelsResponse>("channels", tokens.access_token, {
    part: "snippet,contentDetails",
    mine: "true",
  });
  const channel = channels.items?.[0];
  if (!channel) {
    throw new HttpError(400, "Esta conta Google não tem um canal no YouTube.");
  }

  const account = {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
  };
  await db
    .insert(youtubeAccounts)
    .values({ userId, ...account })
    .onConflictDoUpdate({ target: youtubeAccounts.userId, set: account });

  return pending.returnTo;
}

export async function getAccount(userId: string) {
  const [account] = await db
    .select()
    .from(youtubeAccounts)
    .where(eq(youtubeAccounts.userId, userId));
  return account;
}

type Account = NonNullable<Awaited<ReturnType<typeof getAccount>>>;

/** A valid access token, refreshed when it is about to expire. */
async function accessTokenFor(account: Account): Promise<string> {
  const expiresAt = account.accessTokenExpiresAt?.getTime() ?? 0;
  if (account.accessToken && expiresAt - Date.now() > 60_000) return account.accessToken;

  try {
    const tokens = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
    });
    await db
      .update(youtubeAccounts)
      .set({
        accessToken: tokens.access_token,
        accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      })
      .where(eq(youtubeAccounts.userId, account.userId));
    return tokens.access_token;
  } catch (error) {
    if (error instanceof InvalidGrant) {
      // Access was removed on Google's side; forget it so the teacher can connect again.
      await db.delete(youtubeAccounts).where(eq(youtubeAccounts.userId, account.userId));
      throw new HttpError(409, "O acesso ao YouTube foi removido. Conecte o canal de novo.");
    }
    throw error;
  }
}

interface PlaylistItemsResponse {
  nextPageToken?: string;
  items?: {
    snippet: {
      title: string;
      publishedAt: string;
      resourceId: { videoId: string };
      thumbnails?: Record<string, { url: string } | undefined>;
    };
    status?: { privacyStatus?: string };
  }[];
}

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  /** "public", "unlisted" or "private". Students can't watch private videos. */
  privacy: string;
}

/** One page of the channel's uploads, newest first. */
export async function listVideos(account: Account, pageToken?: string) {
  requireConfigured();
  const accessToken = await accessTokenFor(account);
  const page = await youtubeGet<PlaylistItemsResponse>("playlistItems", accessToken, {
    part: "snippet,status",
    playlistId: account.uploadsPlaylistId,
    maxResults: "24",
    ...(pageToken ? { pageToken } : {}),
  });

  const videos: YoutubeVideo[] = (page.items ?? []).map(({ snippet, status }) => {
    const thumbs = snippet.thumbnails ?? {};
    return {
      id: snippet.resourceId.videoId,
      title: snippet.title,
      url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
      thumbnailUrl: (thumbs.medium ?? thumbs.high ?? thumbs.default)?.url ?? null,
      publishedAt: snippet.publishedAt,
      privacy: status?.privacyStatus ?? "public",
    };
  });

  return { videos, nextPageToken: page.nextPageToken ?? null };
}

/** Forgets the channel and asks Google to cancel the access too. */
export async function disconnect(account: Account) {
  await db.delete(youtubeAccounts).where(eq(youtubeAccounts.userId, account.userId));
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: account.refreshToken }),
  }).catch(() => {
    // Already forgotten here; Google also expires unused access on its own.
  });
}
