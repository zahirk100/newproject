import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifieert een Resend-webhook volgens de Standard Webhooks-specificatie
 * (hetzelfde schema als Svix): HMAC-SHA256 over `${id}.${timestamp}.${body}`
 * met het base64-gedecodeerde geheim (na het "whsec_"-voorvoegsel).
 * Geen aparte svix/standardwebhooks-dependency nodig voor dit ene stukje.
 */
export function verifieerWebhookSignature(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string
): boolean {
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${headers.id}.${headers.timestamp}.${payload}`;
  const verwacht = createHmac("sha256", secretBytes).update(signedContent).digest();

  return headers.signature
    .split(" ")
    .some((deel) => {
      const [, waarde] = deel.split(",");
      if (!waarde) return false;
      const ontvangen = Buffer.from(waarde, "base64");
      return ontvangen.length === verwacht.length && timingSafeEqual(ontvangen, verwacht);
    });
}
