import { and, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import { packageCourses, payments, subscriptions } from "../db/schema.js";
import {
  getAuthorizedPayment,
  getPayment,
  getSubscription,
} from "../payments/mercadopago.js";

type Billing = "monthly" | "yearly";

function addPeriod(from: Date, billing: Billing): Date {
  const end = new Date(from);
  if (billing === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

/** Records a paid period. Safe to call again for the same payment. */
export async function recordPayment(input: {
  subscriptionId: string;
  provider: string;
  providerPaymentId: string;
  amountCents: number;
}): Promise<void> {
  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(payments)
      .values(input)
      .onConflictDoNothing()
      .returning({ id: payments.id });
    if (inserted.length === 0) return;

    const [subscription] = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, input.subscriptionId));
    if (!subscription) return;

    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd;
    const start = periodEnd && periodEnd > now ? periodEnd : now;

    await tx
      .update(subscriptions)
      .set({ status: "active", currentPeriodEnd: addPeriod(start, subscription.billing) })
      .where(eq(subscriptions.id, subscription.id));
  });
}

/** A student keeps access until the paid period ends, even after cancelling. */
export async function activeCourseIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ packageId: subscriptions.packageId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        ne(subscriptions.status, "pending"),
        gt(subscriptions.currentPeriodEnd, new Date()),
      ),
    );
  if (rows.length === 0) return [];

  const courses = await db
    .select({ courseId: packageCourses.courseId })
    .from(packageCourses)
    .where(
      inArray(
        packageCourses.packageId,
        rows.map((row) => row.packageId),
      ),
    );
  return [...new Set(courses.map((row) => row.courseId))];
}

/**
 * Re-reads a one-time payment from Mercado Pago. Everything that decides access comes
 * from this authenticated call, never from the notification that triggered it.
 */
export async function syncPayment(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  if (payment.status !== "approved" || !payment.external_reference) return;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, payment.external_reference));
  if (!subscription) return;

  const amountCents = Math.round(payment.transaction_amount * 100);
  if (amountCents < subscription.priceCents) {
    console.error(`Payment ${paymentId} is below the price of ${subscription.id}; ignored`);
    return;
  }

  await recordPayment({
    subscriptionId: subscription.id,
    provider: "mercadopago",
    providerPaymentId: String(payment.id),
    amountCents,
  });
}

/** Re-reads a monthly subscription from Mercado Pago and applies its state. */
export async function syncSubscription(providerRef: string): Promise<void> {
  const remote = await getSubscription(providerRef);
  if (!remote.external_reference) return;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, remote.external_reference));
  if (!subscription) return;

  if (remote.status === "canceled" || remote.status === "cancelled") {
    await db
      .update(subscriptions)
      .set({ status: "cancelled" })
      .where(eq(subscriptions.id, subscription.id));
    return;
  }

  if (remote.status !== "authorized") return;

  const nextCharge = remote.next_payment_date ? new Date(remote.next_payment_date) : undefined;
  await db
    .update(subscriptions)
    .set({
      status: "active",
      providerRef,
      currentPeriodEnd: nextCharge ?? addPeriod(new Date(), subscription.billing),
    })
    .where(eq(subscriptions.id, subscription.id));
}

export async function syncAuthorizedPayment(id: string): Promise<void> {
  const payment = await getAuthorizedPayment(id);
  if (payment.preapproval_id) await syncSubscription(payment.preapproval_id);
}
