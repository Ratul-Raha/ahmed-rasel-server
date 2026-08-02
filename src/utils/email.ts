import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
}

interface SeminarForEmail {
  title: string;
  description: string;
  url: string;
  image?: string;
  dateTime: Date;
  tier: 'free' | 'paid';
}

interface ConfirmationArgs {
  name: string;
  email: string;
  seminar: SeminarForEmail;
}

const TIER_COLORS: Record<string, string> = {
  free: '#10b981',
  paid: '#8b5cf6'
};

const TIER_LABELS: Record<string, string> = {
  free: 'FREE SEMINAR',
  paid: 'PAID SEMINAR'
};

function buildSeminarConfirmationHtml({ name, seminar }: ConfirmationArgs): string {
  const safeName = escapeHtml(firstName(name));
  const safeTitle = escapeHtml(seminar.title);
  const safeDescription = escapeHtml(
    seminar.description.length > 180
      ? seminar.description.slice(0, 180) + '…'
      : seminar.description
  );
  const safeUrl = escapeHtml(seminar.url);
  const image = seminar.image ? escapeHtml(seminar.image) : '';
  const tierColor = TIER_COLORS[seminar.tier] || TIER_COLORS.free;
  const tierLabel = TIER_LABELS[seminar.tier] || TIER_LABELS.free;
  const dateText = formatDate(seminar.dateTime);
  const timeText = formatTime(seminar.dateTime);
  const year = new Date().getFullYear();

  const heroBlock = image
    ? `<img src="${image}" alt="${safeTitle}" style="display:block;width:100%;max-width:600px;height:auto;border-radius:16px 16px 0 0;object-fit:cover;max-height:320px;" />`
    : `
    <div style="padding:56px 40px;background:linear-gradient(135deg,#064e3b 0%,#0d9488 100%);text-align:center;">
      <div style="font-size:34px;line-height:1;margin-bottom:14px;">🎓</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${safeTitle}</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:0.22em;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-top:10px;">Free Seminars · Global Guidance</div>
    </div>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're Registered!</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ece9e4;">

          <!-- Header -->
          <tr>
            <td style="background:#064e3b;padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:2px;">FLYBRIDGE EDUCATION</div>
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.3em;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-top:4px;">Guidance by Ahmed Rasel</div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:0.2em;color:#5eead4;text-transform:uppercase;">Seminar</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero image / banner -->
          <tr>
            <td>${heroBlock}</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <div style="display:inline-block;background:rgba(16,185,129,0.12);color:#059669;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:16px;">✓ You're Registered</div>
              <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">See you at the seminar, ${safeName}!</h1>
              <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#6b7280;">Your spot for <strong style="color:#111827;">${safeTitle}</strong> is confirmed. Here's everything you need to know:</p>
            </td>
          </tr>

          <!-- Details card -->
          <tr>
            <td style="padding:20px 40px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;border:1px solid #ece9e4;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:0.16em;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Event</div>
                    <div style="font-size:15px;font-weight:700;color:#111827;">${safeTitle}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:10px;font-weight:800;letter-spacing:0.16em;color:#9ca3af;text-transform:uppercase;padding-bottom:4px;">Date</td>
                        <td style="font-size:10px;font-weight:800;letter-spacing:0.16em;color:#9ca3af;text-transform:uppercase;padding-bottom:4px;">Time</td>
                        <td style="font-size:10px;font-weight:800;letter-spacing:0.16em;color:#9ca3af;text-transform:uppercase;padding-bottom:4px;">Tier</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;font-weight:600;color:#111827;">${dateText}</td>
                        <td style="font-size:14px;font-weight:600;color:#111827;">${timeText}</td>
                        <td><span style="display:inline-block;font-size:10px;font-weight:800;letter-spacing:0.1em;color:#ffffff;background:${tierColor};padding:4px 10px;border-radius:100px;">${tierLabel}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:0.16em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">About this seminar</div>
                    <div style="font-size:13px;line-height:1.7;color:#4b5563;">${safeDescription}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px 12px;text-align:center;">
              <a href="${safeUrl}" style="display:inline-block;background:#064e3b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:0.05em;padding:15px 36px;border-radius:100px;">JOIN THE SEMINAR →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0a0b10;padding:24px 32px;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:1.5px;">FLYBRIDGE EDUCATION</div>
              <div style="font-size:11px;color:#9ca3af;line-height:1.7;margin-top:8px;">Free seminars, honest guidance, and skills to move forward.<br />Questions? Reply to this email — we're happy to help.</div>
              <div style="font-size:10px;color:#4b5563;letter-spacing:0.14em;text-transform:uppercase;margin-top:14px;">© ${year} FlyBridge Education · All rights reserved</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendSeminarConfirmation(args: ConfirmationArgs): Promise<void> {
  const client = getResend();
  if (!client) {
    console.log('[email] RESEND_API_KEY not set — skipping seminar confirmation email for', args.email);
    return;
  }

  const html = buildSeminarConfirmationHtml(args);
  const from = process.env.EMAIL_FROM || 'FlyBridge Education <onboarding@resend.dev>';
  const subject = `You're Registered — ${args.seminar.title}`;

  try {
    const { error } = await client.emails.send({
      from,
      to: args.email,
      subject,
      html,
      replyTo: from
    });

    if (error) {
      console.error('[email] Resend send failed:', error);
      return;
    }

    console.log('[email] Seminar confirmation sent to', args.email);
  } catch (err) {
    console.error('[email] Error sending seminar confirmation:', err);
  }
}
