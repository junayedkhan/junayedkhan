const nodemailer = require("nodemailer");

const getEnv = (key) => process.env[key]?.trim();

const getSmtpConfig = () => {
  const host = getEnv("SMTP_HOST");
  const user = getEnv("SMTP_USER");
  const emailFrom = getEnv("EMAIL_FROM") || user;
  let pass = getEnv("SMTP_PASS");

  if (host?.includes("gmail.com") && pass) {
    pass = pass.replace(/\s+/g, "");
  }

  return {
    host,
    port: Number(getEnv("SMTP_PORT") || 587),
    secure: getEnv("SMTP_SECURE") === "true",
    user,
    pass,
    emailFrom,
  };
};

const smtpEnabled = () => {
  const { host, user, pass, emailFrom } = getSmtpConfig();

  return Boolean(host && user && pass && emailFrom);
};

const sendMail = async ({ to, subject, text, html }) => {
  const { host, port, secure, user, pass, emailFrom } = getSmtpConfig();

  if (!host || !user || !pass || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secure || port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Junayed Khan Admin" <${emailFrom}>`,
    to,
    subject,
    text,
    html,
    replyTo: emailFrom,
    headers: {
      "X-Entity-Ref-ID": `junayed-admin-${Date.now()}`,
      "X-Auto-Response-Suppress": "OOF, AutoReply",
    },
  });
};

module.exports = { sendMail, smtpEnabled };
