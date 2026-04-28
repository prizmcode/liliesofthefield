import sgMail from "@sendgrid/mail";

interface ContactPayload {
 name?: string;
 email?: string;
 subject?: string;
 message?: string;
 // honeypot — bots fill it in, humans don't see it
 company?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s: string) =>
 s
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

export default defineEventHandler(async (event) => {
 const config = useRuntimeConfig();

 if (
  !config.sendgridApiKey ||
  !config.contactFromEmail ||
  !config.contactRecipientEmail ||
  !config.sendgridAutoreplyTemplateId
 ) {
  throw createError({
   statusCode: 500,
   statusMessage: "Contact form is not configured on the server.",
  });
 }

 const body = await readBody<ContactPayload>(event);

 // Honeypot — silently succeed so bots don't retry
 if (body?.company && body.company.trim() !== "") {
  return { success: true };
 }

 const name = body?.name?.trim() ?? "";
 const email = body?.email?.trim() ?? "";
 const subject = body?.subject?.trim() ?? "";
 const message = body?.message?.trim() ?? "";

 if (!name || name.length > 200) {
  throw createError({ statusCode: 400, statusMessage: "Name is required." });
 }
 if (!email || !EMAIL_RE.test(email) || email.length > 200) {
  throw createError({
   statusCode: 400,
   statusMessage: "A valid email is required.",
  });
 }
 if (!message || message.length > 5000) {
  throw createError({
   statusCode: 400,
   statusMessage: "Message is required (max 5000 chars).",
  });
 }
 if (subject.length > 200) {
  throw createError({ statusCode: 400, statusMessage: "Subject is too long." });
 }

 sgMail.setApiKey(config.sendgridApiKey);

 const subjectLine = subject || "New contact form submission";

 const notification = {
  to: config.contactRecipientEmail,
  from: config.contactFromEmail,
  replyTo: { email, name },
  subject: `[Contact] ${subjectLine}`,
  text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subjectLine}\n\nMessage:\n${message}\n`,
  html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subjectLine)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `,
 };

 const autoReply = {
  to: email,
  from: { email: config.contactFromEmail, name: "Lilies of the Field" },
  templateId: config.sendgridAutoreplyTemplateId,
  dynamicTemplateData: {
   name,
   email,
   subject: subjectLine,
   message,
  },
 };

 try {
  await Promise.all([sgMail.send(notification), sgMail.send(autoReply)]);
  return { success: true };
 } catch (err: any) {
  const detail =
   err?.response?.body?.errors?.[0]?.message ||
   err?.message ||
   "Email send failed";
  console.error("[contact] SendGrid error:", detail, err?.response?.body);
  throw createError({
   statusCode: 502,
   statusMessage: "Could not send your message. Please try again later.",
  });
 }
});
