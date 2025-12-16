export async function sendEmail({ to, subject, html, text }) {
  let nodemailer;
  try {
    ({ default: nodemailer } = await import("nodemailer"));
  } catch (err) {
    throw new Error("nodemailer is not installed. Run npm install nodemailer in back-end.");
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are missing");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
