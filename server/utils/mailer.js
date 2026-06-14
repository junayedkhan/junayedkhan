const getEnv = (key) => process.env[key]?.trim();

const getEmailFromName = () => getEnv("EMAIL_FROM_NAME") || "Junayed Khan Admin";
const getEmailFrom = () => getEnv("EMAIL_FROM");

const parseEmailAddress = (email) => {
  const match = email?.match(/<([^>]+)>/);
  return match ? match[1] : email;
};

const emailEnabled = () => Boolean(getEnv("BREVO_API_KEY") && getEmailFrom());

const sendMail = async ({ to, subject, text, html }) => {
  const apiKey = getEnv("BREVO_API_KEY");
  const emailFrom = getEmailFrom();

  if (!apiKey || !emailFrom) {
    throw new Error("Brevo email service is not configured. Set BREVO_API_KEY and EMAIL_FROM.");
  }

  const senderEmail = parseEmailAddress(emailFrom);
  const senderName = getEmailFromName();

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "junayedkhan-server/1.0",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
      replyTo: {
        email: senderEmail,
        name: senderName,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo send failed: ${response.status} ${errorBody}`);
  }
};

module.exports = { sendMail, emailEnabled };
