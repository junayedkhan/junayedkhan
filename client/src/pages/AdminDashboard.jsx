import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { authHeaders, clearToken } from "../utils/api";

const adminSections = [
  { id: "overview", label: "Overview", icon: "fas fa-chart-line" },
  { id: "hero", label: "Hero Profile", icon: "fas fa-id-badge" },
  { id: "resume", label: "Resume", icon: "fas fa-file-alt" },
  { id: "gallery", label: "Gallery", icon: "fas fa-images" },
  { id: "blogs", label: "Travel Blogs", icon: "fas fa-pen-nib" },
  { id: "contact", label: "Contact", icon: "fas fa-address-card" },
  { id: "account", label: "Account", icon: "fas fa-user-shield" },
];

const contentStats = [
  { label: "Gallery Items", value: "40", icon: "fas fa-images", helper: "Shown in batches of 10" },
  { label: "Travel Blogs", value: "9", icon: "fas fa-newspaper", helper: "Published article cards" },
  { label: "Resume Tabs", value: "4", icon: "fas fa-layer-group", helper: "Info, education, skills, experience" },
  { label: "Social Links", value: "3", icon: "fas fa-share-alt", helper: "Facebook, Twitter, LinkedIn" },
];

const contentSections = {
  hero: {
    eyebrow: "Landing content",
    title: "Hero Profile",
    description: "Main introduction: Junayed, Web Developer/Designer, profile photo, and social links.",
    items: ["Name: Junayed", "Roles: Developer, Designer", "Image: assets/image/home.png", "CTA area: social profile links"],
  },
  resume: {
    eyebrow: "About page",
    title: "Resume Content",
    description: "Personal information, achievements, education, design skills, development skills, and job experience.",
    items: ["10 personal info fields", "4 achievement counters", "3 education entries", "3 experience entries", "10 skill bars"],
  },
  gallery: {
    eyebrow: "Portfolio page",
    title: "Gallery Library",
    description: "Gallery uses six source images repeated into 40 public items with local like counts.",
    items: ["6 source images", "40 gallery cards", "Image modal with zoom controls", "Like counts stored in browser"],
  },
  blogs: {
    eyebrow: "Journal page",
    title: "Travel Blog Manager",
    description: "Travel articles with categories, dates, read time, excerpts, and detail pages.",
    items: ["9 blog posts", "Categories include Travel Guide, Photography, City Walk", "6 posts shown first", "Slug-based article detail pages"],
  },
  contact: {
    eyebrow: "Contact page",
    title: "Contact Profile",
    description: "Public contact block, mailto form, availability text, phone visibility, email, and social links.",
    items: ["Name: Junayed Khan", "Title: Frontend Developer", "Email: junayedkhan@example.com", "Status: Available for freelance work"],
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [accountForm, setAccountForm] = useState({ username: "", email: "", age: "", address: "" });
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [emailVerifyModalOpen, setEmailVerifyModalOpen] = useState(false);
  const [emailEditCode, setEmailEditCode] = useState("");
  const [emailEditMessage, setEmailEditMessage] = useState("");
  const [isSendingEmailEditCode, setIsSendingEmailEditCode] = useState(false);
  const [isVerifyingEmailEditCode, setIsVerifyingEmailEditCode] = useState(false);
  const [isEmailEditVerified, setIsEmailEditVerified] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me", { headers: authHeaders() })
      .then((res) => {
        if (active) {
          setUser(res.data.user);
          setEmail(res.data.user.email || "");
          setAccountForm({
            username: res.data.user.username || "",
            email: res.data.user.email || "",
            age: res.data.user.age ?? "",
            address: res.data.user.address || "",
          });
          setIsEmailVerified(false);
        }
      })
      .catch(() => {
        clearToken();
        navigate("/admin-login", { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (mobileNavOpen || passwordModalOpen || accountModalOpen || emailVerifyModalOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen, passwordModalOpen, accountModalOpen, emailVerifyModalOpen]);

  const logout = () => {
    clearToken();
    navigate("/admin-login");
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    setEmailMessage("");

    if (emailChanged && !isEmailEditVerified) {
      setEmailVerifyModalOpen(true);
      return;
    }

    setIsSavingEmail(true);

    try {
      const res = await api.patch(
        "/auth/me",
        {
          username: accountForm.username.trim(),
          email: accountForm.email.trim(),
          age: accountForm.age,
          address: accountForm.address.trim(),
        },
        { headers: authHeaders() }
      );
      setUser(res.data.user);
      setEmail(res.data.user.email || "");
      setAccountForm({
        username: res.data.user.username || "",
        email: res.data.user.email || "",
        age: res.data.user.age ?? "",
        address: res.data.user.address || "",
      });
      setEmailMessage(res.data.message);
      setAccountModalOpen(false);
      setIsEmailEditVerified(false);
      setEmailEditCode("");
      setEmailEditMessage("");
      setIsEmailVerified(false);
      setVerificationCode("");
      setVerificationMessage("");
      setResetMessage("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setEmailMessage(err.response?.data?.message || "Unable to update email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileNavOpen(false);
  };

  const updateAccountField = (field, value) => {
    setAccountForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "email") {
      setIsEmailEditVerified(false);
      setEmailEditCode("");
      setEmailEditMessage("");
    }
  };

  const cancelAccountEdit = () => {
    setAccountForm({
      username: user?.username || "",
      email: user?.email || "",
      age: user?.age ?? "",
      address: user?.address || "",
    });
    setAccountModalOpen(false);
    setIsEmailEditVerified(false);
    setEmailEditCode("");
    setEmailEditMessage("");
    setEmailMessage("");
    setEmailVerifyModalOpen(false);
  };

  const emailChanged = accountForm.email.trim().toLowerCase() !== (user?.email || "").trim().toLowerCase();

  const openAccountModal = () => {
    setAccountForm({
      username: user?.username || "",
      email: user?.email || "",
      age: user?.age ?? "",
      address: user?.address || "",
    });
    setEmailMessage("");
    setEmailEditMessage("");
    setEmailEditCode("");
    setIsEmailEditVerified(false);
    setAccountModalOpen(true);
  };

  const sendEmailEditVerificationCode = async () => {
    setEmailEditMessage("");
    setIsSendingEmailEditCode(true);

    try {
      const res = await api.post(
        "/auth/me/send-verification-code",
        {},
        { headers: authHeaders() }
      );
      setEmailEditMessage(res.data.message);
    } catch (err) {
      setEmailEditMessage(err.response?.data?.message || "Unable to send verification code");
    } finally {
      setIsSendingEmailEditCode(false);
    }
  };

  const verifyEmailEditCode = async (e) => {
    e?.preventDefault();
    setEmailEditMessage("");
    setIsVerifyingEmailEditCode(true);

    try {
      const res = await api.post(
        "/auth/me/verify-code",
        { code: emailEditCode.trim() },
        { headers: authHeaders() }
      );
      setIsEmailEditVerified(true);
      setEmailEditMessage(res.data.message);
      setEmailVerifyModalOpen(false);
    } catch (err) {
      setIsEmailEditVerified(false);
      setEmailEditMessage(err.response?.data?.message || "Unable to verify code");
    } finally {
      setIsVerifyingEmailEditCode(false);
    }
  };

  const closeEmailVerifyModal = () => {
    setEmailVerifyModalOpen(false);
    setEmailEditCode("");
    setEmailEditMessage("");
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setVerificationMessage("");
    setResetMessage("");
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setVerificationCode("");
    setVerificationMessage("");
    setResetMessage("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsEmailVerified(false);
  };

  const sendVerificationCode = async () => {
    setVerificationMessage("");
    setResetMessage("");
    setIsSendingCode(true);

    try {
      const res = await api.post(
        "/auth/me/send-verification-code",
        {},
        { headers: authHeaders() }
      );
      setVerificationMessage(res.data.message);
    } catch (err) {
      setVerificationMessage(err.response?.data?.message || "Unable to send verification code");
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyEmailCode = async (e) => {
    e.preventDefault();
    setVerificationMessage("");
    setResetMessage("");
    setIsVerifyingCode(true);

    try {
      const res = await api.post(
        "/auth/me/verify-code",
        { code: verificationCode.trim() },
        { headers: authHeaders() }
      );
      setIsEmailVerified(true);
      setVerificationMessage(res.data.message);
    } catch (err) {
      setIsEmailVerified(false);
      setVerificationMessage(err.response?.data?.message || "Unable to verify code");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const saveNewPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");

    if (newPassword !== confirmNewPassword) {
      setResetMessage("Passwords do not match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await api.patch(
        "/auth/me/password",
        { password: newPassword },
        { headers: authHeaders() }
      );
      setResetMessage(res.data.message);
      setNewPassword("");
      setConfirmNewPassword("");
      setVerificationCode("");
    } catch (err) {
      setResetMessage(err.response?.data?.message || "Unable to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <main className="admin_dashboard">
      {mobileNavOpen ? (
        <button
          type="button"
          className="admin_nav_backdrop"
          aria-label="Close admin navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <button
        type="button"
        className={mobileNavOpen ? "admin_hamburger active" : "admin_hamburger"}
        onClick={() => setMobileNavOpen((open) => !open)}
        aria-label={mobileNavOpen ? "Close admin navigation" : "Open admin navigation"}
        aria-expanded={mobileNavOpen}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {passwordModalOpen ? (
        <div className="admin_modal_layer" role="presentation">
          <button
            type="button"
            className="admin_modal_backdrop"
            aria-label="Close password reset"
            onClick={closePasswordModal}
          />
          <section className="admin_password_modal" role="dialog" aria-modal="true" aria-label="Password reset">
            <header>
              <div>
                <p className="admin_auth_kicker">Password security</p>
                <h2>{isEmailVerified ? "Set New Password" : "Verify Email"}</h2>
                <p>
                  {isEmailVerified
                    ? "Email verified. Set a new password for this admin account."
                    : "Enter the verification code sent to your recovery email to edit your password."}
                </p>
              </div>
              <button type="button" onClick={closePasswordModal} aria-label="Close">
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </header>

            {!isEmailVerified ? (
              <div className="admin_modal_body">
                <div className="admin_modal_email">
                  <i className="fas fa-envelope-open-text" aria-hidden="true"></i>
                  <div>
                    <span>Verification email</span>
                    <strong>{user?.email || "No recovery email saved"}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="admin_profile_reset"
                  onClick={sendVerificationCode}
                  disabled={isSendingCode || !user?.email}
                >
                  <i className="fas fa-paper-plane" aria-hidden="true"></i>
                  <span>{isSendingCode ? "Sending..." : "Send verification code"}</span>
                </button>

                <form className="admin_verify_form" onSubmit={verifyEmailCode}>
                  <label>
                    <span>Verification Code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      required
                    />
                  </label>
                  <button type="submit" disabled={isVerifyingCode}>
                    {isVerifyingCode ? "Verifying..." : "Verify Email"}
                  </button>
                </form>

                {verificationMessage ? <p className="admin_profile_message">{verificationMessage}</p> : null}
              </div>
            ) : (
              <div className="admin_modal_body">
                <div className="admin_profile_verified_state">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <span>Email verified. You can edit the password now.</span>
                </div>

                <form className="admin_verify_form admin_verify_form--password" onSubmit={saveNewPassword}>
                  <label>
                    <span>New Password</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    <span>Confirm Password</span>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <button type="submit" disabled={isSavingPassword}>
                    {isSavingPassword ? "Saving..." : "Set New Password"}
                  </button>
                </form>

                {resetMessage ? <p className="admin_profile_message">{resetMessage}</p> : null}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {accountModalOpen ? (
        <div className="admin_modal_layer" role="presentation">
          <button
            type="button"
            className="admin_modal_backdrop"
            aria-label="Close account edit"
            onClick={cancelAccountEdit}
          />
          <section className="admin_password_modal" role="dialog" aria-modal="true" aria-label="Edit account details">
            <header>
              <div>
                <p className="admin_auth_kicker">Account details</p>
                <h2>Edit Profile</h2>
                <p>Update name, email, age, and address. Email changes require verification first.</p>
              </div>
              <button type="button" onClick={cancelAccountEdit} aria-label="Close">
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </header>

            <div className="admin_modal_body">
              <form className="admin_account_form" onSubmit={saveEmail}>
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={accountForm.username}
                    onChange={(e) => updateAccountField("username", e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => updateAccountField("email", e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Age</span>
                  <input
                    type="number"
                    min="0"
                    value={accountForm.age}
                    onChange={(e) => updateAccountField("age", e.target.value)}
                  />
                </label>
                <label>
                  <span>Address</span>
                  <input
                    type="text"
                    value={accountForm.address}
                    onChange={(e) => updateAccountField("address", e.target.value)}
                    placeholder="City, country"
                  />
                </label>

                {emailChanged && !isEmailEditVerified ? (
                  <p>Email change requires verification. Click Save Changes to continue.</p>
                ) : null}

                {emailEditMessage ? <p>{emailEditMessage}</p> : null}
                {emailMessage ? <p>{emailMessage}</p> : null}
                <div className="admin_account_actions">
                  <button type="button" onClick={cancelAccountEdit}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSavingEmail}>
                    {isSavingEmail ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      {emailVerifyModalOpen ? (
        <div className="admin_modal_layer admin_modal_layer--verify" role="presentation">
          <button
            type="button"
            className="admin_modal_backdrop"
            aria-label="Close email verification"
            onClick={closeEmailVerifyModal}
          />
          <section className="admin_password_modal" role="dialog" aria-modal="true" aria-label="Verify email change">
            <header>
              <div>
                <p className="admin_auth_kicker">Email verification</p>
                <h2>Verify Email</h2>
                <p>Send a code to your current recovery email before saving the new email address.</p>
              </div>
              <button type="button" onClick={closeEmailVerifyModal} aria-label="Close">
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </header>

            <div className="admin_modal_body">
              <div className="admin_modal_email">
                <i className="fas fa-envelope-open-text" aria-hidden="true"></i>
                <div>
                  <span>Verification email</span>
                  <strong>{user?.email || "No recovery email saved"}</strong>
                </div>
              </div>

              <div className="admin_email_edit_verify">
                <p>New email: <strong>{accountForm.email || "Not set"}</strong></p>
                <button
                  type="button"
                  onClick={sendEmailEditVerificationCode}
                  disabled={isSendingEmailEditCode || !user?.email}
                >
                  {isSendingEmailEditCode ? "Sending..." : "Send Code"}
                </button>
                <form className="admin_email_edit_code" onSubmit={verifyEmailEditCode}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={emailEditCode}
                    onChange={(e) => setEmailEditCode(e.target.value)}
                    placeholder="123456"
                    required
                  />
                  <button type="submit" disabled={isVerifyingEmailEditCode}>
                    {isVerifyingEmailEditCode ? "Verifying..." : "Verify"}
                  </button>
                </form>
              </div>

              {emailEditMessage ? <p className="admin_profile_message">{emailEditMessage}</p> : null}
            </div>
          </section>
        </div>
      ) : null}

      <aside className={mobileNavOpen ? "admin_sidebar active" : "admin_sidebar"} onClick={() => setMobileNavOpen(false)}>
        <span className="admin_auth_logo">J</span>
        <nav aria-label="Admin navigation" onClick={(e) => e.stopPropagation()}>
          {adminSections.map((section) => (
            <button
              type="button"
              className={activeSection === section.id ? "active" : ""}
              onClick={() => selectSection(section.id)}
              key={section.id}
            >
              <i className={section.icon} aria-hidden="true"></i>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin_main">
        <header className="admin_header">
          <div>
            <p className="admin_auth_kicker">Content admin</p>
            <h1>{adminSections.find((section) => section.id === activeSection)?.label || "Overview"}</h1>
          </div>
        </header>

        {activeSection === "overview" ? (
          <>
            <div className="admin_stats">
              {contentStats.map((card) => (
                <article className="admin_stat_card" key={card.label}>
                  <i className={card.icon} aria-hidden="true"></i>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.helper}</p>
                </article>
              ))}
            </div>

            <section className="admin_content_grid">
              {Object.entries(contentSections).map(([id, section]) => (
                <button
                  type="button"
                  className="admin_content_card"
                  onClick={() => setActiveSection(id)}
                  key={id}
                >
                  <span>{section.eyebrow}</span>
                  <strong>{section.title}</strong>
                  <p>{section.description}</p>
                </button>
              ))}
            </section>
          </>
        ) : null}

        {contentSections[activeSection] ? (
          <section className="admin_editor_panel">
            <div className="admin_editor_intro">
              <div>
                <p className="admin_auth_kicker">{contentSections[activeSection].eyebrow}</p>
                <h2>{contentSections[activeSection].title}</h2>
                <p>{contentSections[activeSection].description}</p>
              </div>
              <a href={activeSection === "hero" ? "/" : `/${activeSection === "resume" ? "about" : activeSection}`} target="_blank" rel="noreferrer">
                <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                <span>View public page</span>
              </a>
            </div>

            <div className="admin_editor_list">
              {contentSections[activeSection].items.map((item) => (
                <article key={item}>
                  <i className="fas fa-check" aria-hidden="true"></i>
                  <span>{item}</span>
                </article>
              ))}
            </div>

            <div className="admin_editor_note">
              <i className="fas fa-info-circle" aria-hidden="true"></i>
              <p>This dashboard section matches the current website content. Editing controls can be connected next when content APIs are added.</p>
            </div>
          </section>
        ) : null}

        {activeSection === "account" ? (
          <section className="admin_account_panel">
            <div className="admin_profile_hero">
              <div className="admin_profile_avatar">
                {user?.username?.charAt(0)?.toUpperCase() || "J"}
              </div>
              <div className="admin_profile_identity">
                <p className="admin_auth_kicker">Admin profile</p>
                <h2>{user?.username || "Admin"}</h2>
                <p>{user?.email || "No recovery email saved"}</p>
                <div className="admin_profile_chips">
                  <span>
                    <i className="fas fa-user-shield" aria-hidden="true"></i>
                    Portfolio Admin
                  </span>
                  <span className={isEmailVerified ? "verified" : ""}>
                    <i className={isEmailVerified ? "fas fa-check-circle" : "fas fa-clock"} aria-hidden="true"></i>
                    {isEmailVerified ? "Email verified" : "Verification required"}
                  </span>
                </div>
              </div>
              <button type="button" className="admin_profile_logout" onClick={logout}>
                <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
                <span>Logout</span>
              </button>
            </div>

            <div className="admin_profile_sections">
              <article className="admin_profile_section">
                <div className="admin_profile_section_head">
                  <i className="fas fa-id-card" aria-hidden="true"></i>
                  <div>
                    <span>Account Details</span>
                    <strong>Profile information</strong>
                  </div>
                  <button
                    type="button"
                    className="admin_section_edit"
                    onClick={openAccountModal}
                  >
                    <i className="fas fa-edit" aria-hidden="true"></i>
                    <span>Edit</span>
                  </button>
                </div>

                <div className="admin_account_info_list">
                  <div>
                    <span>Name</span>
                    <strong>{user?.username || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{user?.email || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Age</span>
                    <strong>{user?.age ?? "Not set"}</strong>
                  </div>
                  <div>
                    <span>Address</span>
                    <strong>{user?.address || "Not set"}</strong>
                  </div>
                </div>
              </article>

              <article className="admin_profile_section">
                <div className="admin_profile_section_head">
                  <i className="fas fa-lock" aria-hidden="true"></i>
                  <div>
                    <span>Password</span>
                    <strong>Password Security</strong>
                  </div>
                </div>
                <p className="admin_profile_section_copy">
                  Set a new password after email verification. Your current password is never shown for security.
                </p>
                <div className="admin_modal_email">
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                  <div>
                    <span>Recovery email</span>
                    <strong>{user?.email || "No recovery email saved"}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="admin_profile_reset"
                  onClick={openPasswordModal}
                  disabled={!user?.email}
                >
                  <i className="fas fa-key" aria-hidden="true"></i>
                  <span>Reset Password</span>
                </button>
              </article>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
