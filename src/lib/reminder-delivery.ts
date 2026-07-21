export type DeliverReminderParams = {
  to: string;
  subject: string;
  text: string;
};

/**
 * Sends reminder email via Resend when `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
 * are set; otherwise logs in development only. Does not throw when unconfigured
 * so cron can still mark reminders processed if you choose to skip send.
 */
export async function deliverReminderEmail(
  params: DeliverReminderParams,
): Promise<{ mode: "resend" | "console" | "skipped" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (apiKey && from) {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { mode: "resend" };
  }

  if (process.env.NODE_ENV === "development") {
    console.info(
      "[reminder email — configure RESEND_API_KEY + RESEND_FROM_EMAIL to send]",
      { to: params.to, subject: params.subject },
    );
  }

  return { mode: process.env.NODE_ENV === "development" ? "console" : "skipped" };
}
