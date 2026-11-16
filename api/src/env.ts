import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set in production`);
  return value;
}

export const env = {
  isProduction,
  // Not PORT: `npm run dev` shares its environment with Next.js, which reads PORT.
  port: Number(process.env.API_PORT ?? 4000),
  /** Empty means the local embedded Postgres in api/.data. Never allowed in production. */
  databaseUrl: isProduction ? required("DATABASE_URL") : process.env.DATABASE_URL,
  /** Public address of the website, used for payment return links. */
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  /** Public address of this API, which Mercado Pago sends notifications to. */
  apiUrl: process.env.API_URL ?? "http://localhost:4000",
  mercadoPagoToken: isProduction ? required("MP_ACCESS_TOKEN") : process.env.MP_ACCESS_TOKEN,
  /** Google OAuth client for connecting the teacher's YouTube. Optional: without it, paste links. */
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
};
