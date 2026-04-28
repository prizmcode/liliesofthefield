/**
 * Diagnostic endpoint for the contact form.
 * Reports only presence (boolean) of each required runtime config key —
 * never the actual values. Safe to expose publicly.
 */
export default defineEventHandler(() => {
  const config = useRuntimeConfig();

  const keys = {
    sendgridApiKey: !!config.sendgridApiKey,
    contactFromEmail: !!config.contactFromEmail,
    contactRecipientEmail: !!config.contactRecipientEmail,
    sendgridAutoreplyTemplateId: !!config.sendgridAutoreplyTemplateId,
    sendgridNotificationTemplateId: !!config.sendgridNotificationTemplateId,
  };

  return {
    ok: Object.values(keys).every(Boolean),
    keys,
    nodeEnv: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
  };
});
