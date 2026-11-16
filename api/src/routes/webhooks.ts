import { Router } from "express";
import {
  syncAuthorizedPayment,
  syncPayment,
  syncSubscription,
} from "../lib/subscriptions.js";

export const webhooksRouter = Router();

/**
 * A notification only says "go and look". Nothing in it is trusted: each handler fetches
 * the record from Mercado Pago with our private token, so a forged request has no effect.
 */
webhooksRouter.post("/mercadopago", async (req, res) => {
  const type = String(req.body?.type ?? req.query.type ?? req.query.topic ?? "");
  const id = String(req.body?.data?.id ?? req.query["data.id"] ?? req.query.id ?? "");

  // Ids are interpolated into API paths, so anything unusual is dropped.
  if (/^[\w-]+$/.test(id)) {
    if (type === "payment") await syncPayment(id);
    else if (type === "subscription_preapproval") await syncSubscription(id);
    else if (type === "subscription_authorized_payment") await syncAuthorizedPayment(id);
  }

  res.status(200).end();
});
