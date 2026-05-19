const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder?.("ipv4first");

const getEnv = (key) => process.env[key]?.trim();
const hasEnv = (key) => Boolean(getEnv(key));
const lookupIpv4 = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, family: 4 }, callback);
};
const resolveIpv4 = (hostname) =>
  new Promise((resolve) => {
    dns.resolve4(hostname, (error, addresses) => {
      resolve(error || !addresses.length ? null : addresses[0]);
    });
  });

const getSmtpConfig = () => {
  const user = getEnv("SMTP_USER") || getEnv("EMAIL_USER");
  const isGmailUser = user?.toLowerCase().endsWith("@gmail.com");
  const host = getEnv("SMTP_HOST") || (isGmailUser ? "smtp.gmail.com" : undefined);
  const emailFrom = getEnv("EMAIL_FROM") || user;
  let pass = getEnv("SMTP_PASS") || getEnv("EMAIL_PASS");

  if (host?.includes("gmail.com") && pass) {
    pass = pass.replace(/\s+/g, "");
  }

  const defaultPort = 587;
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

  const isGmailHost = host.toLowerCase() === "smtp.gmail.com";
  const resolvedHost = isGmailHost ? await resolveIpv4(host) : null;
  const smtpHost = resolvedHost || host;
  const attempts = [
    {
      host: smtpHost,
      port,
      secure: secure || port === 465,
      servername: resolvedHost ? host : undefined,
    },
  ];

  if (isGmailHost && port !== 587) {
    attempts.push({
      host: smtpHost,
      port: 587,
      secure: false,
      servername: resolvedHost ? host : undefined,
    });
  }

  const failures = [];

  for (const attempt of attempts) {
    const transporter = nodemailer.createTransport({
      host: attempt.host,
      port: attempt.port,
      secure: attempt.secure,
      family: 4,
      lookup: lookupIpv4,
      requireTLS: !attempt.secure,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
      auth: {
        user,
        pass,
      },
      tls: attempt.servername
        ? {
            servername: attempt.servername,
          }
        : undefined,
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

      return;
    } catch (error) {
      failures.push({
        host: attempt.servername || attempt.host,
        resolvedHost: attempt.host !== host ? attempt.host : undefined,
        port: attempt.port,
        secure: attempt.secure,
        message: error.message,
      });
    } finally {
      transporter.close();
    }
  }

  throw new Error(`SMTP send failed after ${failures.length} attempt(s): ${JSON.stringify(failures)}; config=${JSON.stringify(getSmtpStatus())}`);
};

module.exports = { sendMail, smtpEnabled };
