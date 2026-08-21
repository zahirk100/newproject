/**
 * Canonieme, vaste basis-URL van de site. Bewust NIET afgeleid van
 * `request.url` in API-routes: die kan wijzen naar een tijdelijke
 * Vercel-preview/deployment-URL (bijv. tijdens een cron-aanroep, of als
 * iemand per ongeluk op een deployment-alias werkt in plaats van het
 * eigen domein), wat resulteert in kapotte links in e-mails aan klanten
 * en leads.
 */
export const SITE_URL = "https://offerteflits.online";
