const nodemailer = require("nodemailer");

const getEnv = (key) => process.env[key]?.trim();
const hasEnv = (key) => Boolean(getEnv(key));

const getSmtpConfig = () => {
  const user = getEnv("SMTP_USER") || getEnv("EMAIL_USER");
  const isGmailUser = user?.toLowerCase().endsWith("@gmail.com");
  const host = getEnv("SMTP_HOST") || (isGmailUser ? "smtp.gmail.com" : undefined);
  const emailFrom = getEnv("EMAIL_FROM") || user;
  let pass = getEnv("SMTP_PASS") || getEnv("EMAIL_PASS");

  if (host?.includes("gmail.com") && pass) {
    pass = pass.replace(/\s+/g, "");
  }

  const defaultPort = host?.includes("gmail.com") ? 465 : 587;
  const port = Number(getEnv("SMTP_PORT") || defaultPort);

  return {
    host,
    port,
    secure: getEnv("SMTP_SECURE") === "true" || port === 465,
    user,
    pass,
    emailFrom,
  };
};

const getSmtpStatus = () => {
  const { host, port, secure, user, pass, emailFrom } = getSmtpConfig();

  return {
    host: host || "missing",
    port,
    secure,
    hasUser: Boolean(user),
    hasPass: Boolean(pass),
    hasEmailFrom: Boolean(emailFrom),
    usingSmtpUser: hasEnv("SMTP_USER"),
    usingEmailUser: hasEnv("EMAIL_USER"),
    usingSmtpPass: hasEnv("SMTP_PASS"),
    usingEmailPass: hasEnv("EMAIL_PASS"),
  };
};

const smtpEnabled = () => {
  const { host, user, pass, emailFrom } = getSmtpConfig();

  return Boolean(host && user && pass && emailFrom);
};

const sendMail = async ({ to, subject, text, html }) => {
  const { host, port, secure, user, pass, emailFrom } = getSmtpConfig();

  if (!host || !user || !pass || !emailFrom) {
    throw new Error(`Email service is not configured: ${JSON.stringify(getSmtpStatus())}`);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secure || port === 465,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.verify();

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
  } catch (error) {
    throw new Error(`SMTP send failed: ${error.message}; config=${JSON.stringify(getSmtpStatus())}`);
  }
};

module.exports = { sendMail, smtpEnabled };
