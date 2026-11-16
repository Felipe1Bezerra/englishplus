import { and, asc, eq, gt } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { packages, subscriptions } from "../db/schema.js";
import { requireAuth } from "../lib/auth.js";
import { HttpError, validateUuidParams } from "../lib/http.js";
import { recordPayment, syncPayment, syncSubscription } from "../lib/subscriptions.js";
import { isSimulatedPayments, paymentProvider } from "../payments/index.js";

const checkoutBody = z.object({
  slug: z.string(),
  billing: z.enum(["monthly", "yearly"]),
});

export const packagesRouter = Router();

packagesRouter.get("/packages", async (_req, res) => {
  const rows = await db
    .select({
      slug: packages.slug,
      name: packages.name,
      kind: packages.kind,
      cadence: packages.cadence,
      description: packages.description,
      features: packages.features,
      monthlyCents: packages.monthlyCents,
      yearlyCents: packages.yearlyCents,
    })
    .from(packages)
    .where(eq(packages.active, true))
    .orderBy(asc(packages.sortOrder));

  res.json(rows);
});

export const checkoutRouter = Router();

validateUuidParams(checkoutRouter, "id");
checkoutRouter.use(requireAuth);

checkoutRouter.post("/checkout", async (req, res) => {
  const body = checkoutBody.parse(req.body);
  const user = req.user!;

  const [selected] = await db
    .select()
    .from(packages)
    .where(and(eq(packages.slug, body.slug), eq(packages.active, true)));
  if (!selected) throw new HttpError(404, "Pacote não encontrado.");

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.packageId, selected.id),
        eq(subscriptions.status, "active"),
        gt(subscriptions.currentPeriodEnd, new Date()),
      ),
    );
  if (existing) throw new HttpError(409, "Você já tem este pacote ativo.");

  // Always the price from the database, so the browser can't choose what it pays.
  const amountCents = body.billing === "yearly" ? selected.yearlyCents : selected.monthlyCents;

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId: user.id,
      packageId: selected.id,
      billing: body.billing,
      priceCents: amountCents,
      provider: paymentProvider.name,
    })
    .returning({ id: subscriptions.id });
  if (!subscription) throw new Error("Subscription was not created");

  const checkout = await paymentProvider.createCheckout({
    subscriptionId: subscription.id,
    title: `English+ ${selected.name} (${body.billing === "yearly" ? "anual" : "mensal"})`,
    billing: body.billing,
    amountCents,
    payerEmail: user.email,
  });

  if (checkout.providerRef) {
    await db
      .update(subscriptions)
      .set({ providerRef: checkout.providerRef })
      .where(eq(subscriptions.id, subscription.id));
  }

  res.status(201).json({ url: checkout.url });
});

/**
 * Read by the page a student returns to after paying. Notifications can lag or get lost,
 * so a pending purchase is checked with the provider here as well.
 */
checkoutRouter.get("/checkout/:id", async (req, res) => {
  const [pending] = await db
    .select({ providerRef: subscriptions.providerRef })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.id, req.params.id!),
        eq(subscriptions.userId, req.user!.id),
        eq(subscriptions.status, "pending"),
      ),
    );

  if (pending && !isSimulatedPayments) {
    const paymentId = String(req.query.paymentId ?? "");
    if (pending.providerRef) await syncSubscription(pending.providerRef);
    else if (/^\d+$/.test(paymentId)) await syncPayment(paymentId);
  }

  const [row] = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      billing: subscriptions.billing,
      priceCents: subscriptions.priceCents,
      packageName: packages.name,
    })
    .from(subscriptions)
    .innerJoin(packages, eq(packages.id, subscriptions.packageId))
    .where(and(eq(subscriptions.id, req.params.id!), eq(subscriptions.userId, req.user!.id)));
  if (!row) throw new HttpError(404, "Assinatura não encontrada.");

  res.json({ ...row, simulated: isSimulatedPayments });
});

/** Stands in for the provider's confirmation during local development. */
checkoutRouter.post("/checkout/:id/simulate", async (req, res) => {
  if (!isSimulatedPayments) throw new HttpError(404, "Não encontrado.");

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, req.params.id!), eq(subscriptions.userId, req.user!.id)));
  if (!subscription) throw new HttpError(404, "Assinatura não encontrada.");

  await recordPayment({
    subscriptionId: subscription.id,
    provider: "simulated",
    providerPaymentId: subscription.id,
    amountCents: subscription.priceCents,
  });

  res.status(204).end();
});
