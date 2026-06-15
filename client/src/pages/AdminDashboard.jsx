import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { authHeaders, clearToken } from "../utils/api";
import Icon from '../component/Icon'

const adminSections = [
  { id: "overview", label: "Overview", icon: "chart" },
  { id: "hero", label: "Home", icon: "home" },
  { id: "resume", label: "Resume", icon: "file" },
  { id: "gallery", label: "Gallery", icon: "images" },
  { id: "blogs", label: "Travel Blogs", icon: "pen" },
  { id: "contact", label: "Contact", icon: "address" },
  { id: "account", label: "Account", icon: "user-shield" },
];

const contentStats = [
  { label: "Gallery Items", value: "Live", icon: "images", helper: "Loaded from MongoDB" },
  { label: "Travel Blogs", value: "Live", icon: "newspaper", helper: "Loaded from MongoDB" },
  { label: "Resume Tabs", value: "4", icon: "layers", helper: "Info, education, skills, experience" },
  { label: "Social Links", value: "3", icon: "share", helper: "Facebook, Twitter, LinkedIn" },
];

const contentSections = {
  hero: {
    eyebrow: "Landing content",
    title: "Home",
    description: "Main introduction, roles, description, and profile image are loaded from the backend.",
    items: ["Name from server", "Roles from server", "Image from MongoDB setting", "CTA area: social profile links"],
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
    description: "Gallery images, captions, and like counts are loaded from MongoDB.",
    items: ["Uploaded images only", "MongoDB gallery cards", "Image modal with zoom controls", "Like counts saved on server"],
  },
  blogs: {
    eyebrow: "Journal page",
    title: "Travel Blog Manager",
    description: "Create blogs with cover images, rich content blocks, links, comments, and publishing controls.",
    items: ["MongoDB blog posts", "Cover and inline images", "Paragraph, quote, image, and link blocks", "Comment moderation"],
  },
  contact: {
    eyebrow: "Contact page",
    title: "Contact Profile",
    description: "Public contact block, mailto form, availability text, phone visibility, email, and social links.",
    items: ["Name: Junayed Khan", "Title: Frontend Developer", "Email: junayedkhan@example.com", "Status: Available for freelance work"],
  },
};

const DEFAULT_HERO_CONTENT = {
  name: "",
  designation: "",
  description: "",
  image: "",
};
const MAX_HERO_UPLOAD_SIZE = 2.5 * 1024 * 1024;
const MAX_GALLERY_UPLOAD_SIZE = 3 * 1024 * 1024;
const MAX_BLOG_UPLOAD_SIZE = 3 * 1024 * 1024;
const MAX_BLOG_VIDEO_UPLOAD_SIZE = 5 * 1024 * 1024;
const ADMIN_ACTIVE_SECTION_KEY = "admin-active-section";

const emptyGalleryForm = {
  img: "",
  alt: "",
  location: "",
  mood: "",
  likes: 0,
};

const emptyBlogForm = {
  title: "",
  category: "",
  excerpt: "",
  coverImage: "",
  readTime: "5 min read",
  publishedAt: new Date().toISOString().slice(0, 10),
  isPublished: true,
  blocks: [
    { uid: "block-1", label: 1, type: "paragraph", text: "", url: "", caption: "" },
  ],
};

const createBlogBlockId = () => `block-${Date.now()}-${Math.round(Math.random() * 10000)}`;
const getNextBlogBlockLabel = (blocks) => Math.max(0, ...blocks.map((block) => Number(block.label) || 0)) + 1;

const normalizeBlogBlock = (block, index = 0) => ({
  uid: block.uid || `block-${index + 1}`,
  label: block.label || index + 1,
  type: block.type || "paragraph",
  text: block.text || "",
  url: block.url || "",
  caption: block.caption || "",
});

const getBlogCardSummary = (blog) => {
  const blocks = Array.isArray(blog.blocks) ? blog.blocks : [];
  const paragraph = blocks.find((block) => block.type === "paragraph" && block.text)?.text;
  const quote = blocks.find((block) => block.type === "quote" && block.text)?.text;
  const link = blocks.find((block) => block.type === "link" && block.text)?.text;
  const caption = blocks.find((block) => (block.type === "image" || block.type === "video") && block.caption)?.caption;

  return String(blog.excerpt || paragraph || quote || link || caption || "No summary added yet.").slice(0, 180);
};

const AdminSkeleton = ({ variant = "panel" }) => (
  <div className={`admin_skeleton admin_skeleton--${variant}`} aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
);

const getApiErrorMessage = (error, fallback, notFoundMessage = "API route not found. Restart or redeploy the backend server.") => {
  const responseMessage = error.response?.data?.message;

  if (responseMessage) return responseMessage;
  if (error.response?.status === 404) return notFoundMessage;
  if (error.response?.status === 413) return "Image is too large for the server. Try a smaller image.";
  if (error.response?.status === 401) return "Admin session expired. Please login again.";
  if (error.message === "Network Error") return "Could not reach the backend server.";

  return fallback;
};

const requestWithFallback = async (primaryRequest, fallbackRequest) => {
  try {
    return await primaryRequest();
  } catch (error) {
    if (error.response?.status === 404 && fallbackRequest) {
      return fallbackRequest();
    }

    throw error;
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [accountForm, setAccountForm] = useState({ username: "", email: "", age: "", address: "" });
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ username: "", email: "", password: "" });
  const [adminCreateMessage, setAdminCreateMessage] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [activeAccountOption, setActiveAccountOption] = useState("profile");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [emailVerifyModalOpen, setEmailVerifyModalOpen] = useState(false);
  const [emailEditCode, setEmailEditCode] = useState("");
  const [emailEditMessage, setEmailEditMessage] = useState("");
  const [isSendingEmailEditCode, setIsSendingEmailEditCode] = useState(false);
  const [isVerifyingEmailEditCode, setIsVerifyingEmailEditCode] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const storedSection = localStorage.getItem(ADMIN_ACTIVE_SECTION_KEY);
      return adminSections.some((section) => section.id === storedSection) ? storedSection : "overview";
    } catch {
      return "overview";
    }
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [verifiedStateTick, setVerifiedStateTick] = useState(Date.now());
  const [heroForm, setHeroForm] = useState(DEFAULT_HERO_CONTENT);
  const [heroImageMessage, setHeroImageMessage] = useState("");
  const [isSavingHeroImage, setIsSavingHeroImage] = useState(false);
  const [heroUploadState, setHeroUploadState] = useState("idle");
  const [heroConfirmAction, setHeroConfirmAction] = useState(null);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryForm, setGalleryForm] = useState(emptyGalleryForm);
  const [galleryMessage, setGalleryMessage] = useState("");
  const [galleryUploadState, setGalleryUploadState] = useState("idle");
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [galleryDeleteTarget, setGalleryDeleteTarget] = useState(null);
  const [blogItems, setBlogItems] = useState([]);
  const [blogComments, setBlogComments] = useState([]);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [editingBlogId, setEditingBlogId] = useState("");
  const [blogMessage, setBlogMessage] = useState("");
  const [blogUploadState, setBlogUploadState] = useState("idle");
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [pendingCommentVisibility, setPendingCommentVisibility] = useState({});
  const [activeBlogBlockIndex, setActiveBlogBlockIndex] = useState(0);
  const [activeBlogSelection, setActiveBlogSelection] = useState({ start: 0, end: 0 });
  const [draggedBlogBlockIndex, setDraggedBlogBlockIndex] = useState(null);
  const [blogBlockDropIndex, setBlogBlockDropIndex] = useState(null);

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
        }
      })
      .catch(() => {
        clearToken();
        navigate("/admin-login", { replace: true });
      })
      .finally(() => {
        if (active) setIsLoadingUser(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    let active = true;

    api
      .get("/site/admin/hero", { headers: authHeaders() })
      .then((res) => {
        if (!active) return;
        const content = Object.prototype.hasOwnProperty.call(res.data || {}, "content")
          ? res.data.content
          : res.data;
        setHeroForm({
          name: content?.name || DEFAULT_HERO_CONTENT.name,
          designation: Array.isArray(content?.designation)
            ? content.designation.join(", ")
            : DEFAULT_HERO_CONTENT.designation,
          description: content?.description || DEFAULT_HERO_CONTENT.description,
          image: content?.image || DEFAULT_HERO_CONTENT.image,
        });
      })
      .catch(() => {
        if (active) setHeroImageMessage("Unable to load hero image setting.");
      })
      .finally(() => {
        if (active) setIsLoadingHero(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoadingGallery(true);

    requestWithFallback(
      () => api.get("/site/admin/gallery", { headers: authHeaders() }),
      () => api.get("/gallery/admin", { headers: authHeaders() })
    )
      .then((res) => {
        if (active) setGalleryItems(res.data.images || []);
      })
      .catch(() => {
        if (active) setGalleryMessage("Unable to load gallery images.");
      })
      .finally(() => {
        if (active) setIsLoadingGallery(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoadingBlogs(true);

    Promise.all([
      api.get("/blogs/admin", { headers: authHeaders() }),
      api.get("/blogs/admin/comments", { headers: authHeaders() }),
    ])
      .then(([blogsRes, commentsRes]) => {
        if (!active) return;
        setBlogItems(blogsRes.data.blogs || []);
        setBlogComments(commentsRes.data.comments || []);
      })
      .catch(() => {
        if (active) setBlogMessage("Unable to load blog data.");
      })
      .finally(() => {
        if (active) setIsLoadingBlogs(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!galleryMessage) return undefined;

    const messageTimer = setTimeout(() => {
      setGalleryMessage("");
      setGalleryUploadState((current) => (
        current === "saved" || current === "error" ? "idle" : current
      ));
    }, 4000);

    return () => clearTimeout(messageTimer);
  }, [galleryMessage]);

  useEffect(() => {
    if (!blogMessage) return undefined;

    const messageTimer = setTimeout(() => {
      setBlogMessage("");
      setBlogUploadState((current) => (
        current === "saved" || current === "error" ? "idle" : current
      ));
    }, 4500);

    return () => clearTimeout(messageTimer);
  }, [blogMessage]);

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

  useEffect(() => {
    if (!user?.accountVerifiedUntil) return undefined;

    const verifiedUntilTime = new Date(user.accountVerifiedUntil).getTime();
    if (!Number.isFinite(verifiedUntilTime) || verifiedUntilTime <= verifiedStateTick) return undefined;

    const stateTimer = setTimeout(() => {
      setVerifiedStateTick(Date.now());
    }, verifiedUntilTime - verifiedStateTick + 250);

    return () => clearTimeout(stateTimer);
  }, [user?.accountVerifiedUntil, verifiedStateTick]);

  useEffect(() => {
    if (activeSection !== "account" || isLoadingUser) return undefined;

    let active = true;
    setIsLoadingAdmins(true);

    api
      .get("/auth/admins", { headers: authHeaders() })
      .then((res) => {
        if (active) setAdminUsers(res.data.admins || []);
      })
      .catch((err) => {
        if (active) setAdminCreateMessage(err.response?.data?.message || "Unable to load admin list");
      })
      .finally(() => {
        if (active) setIsLoadingAdmins(false);
      });

    return () => {
      active = false;
    };
  }, [activeSection, isLoadingUser]);

  const logout = () => {
    clearToken();
    navigate("/admin-login");
  };

  const accountVerifiedUntilTime = user?.accountVerifiedUntil
    ? new Date(user.accountVerifiedUntil).getTime()
    : 0;
  const isAccountVerified = Number.isFinite(accountVerifiedUntilTime) && accountVerifiedUntilTime > verifiedStateTick;
  const accountVerifiedUntilLabel = isAccountVerified
    ? new Date(accountVerifiedUntilTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";

  const saveEmail = async (e) => {
    e.preventDefault();
    setEmailMessage("");

    if (emailChanged && !isAccountVerified) {
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
      setEmailEditCode("");
      setEmailEditMessage("");
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
    localStorage.setItem(ADMIN_ACTIVE_SECTION_KEY, sectionId);
    setMobileNavOpen(false);
  };

  const updateAccountField = (field, value) => {
    setEmailMessage("");
    setAccountForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "email") {
      setEmailEditCode("");
      setEmailEditMessage("");
    }
  };

  const updateNewAdminField = (field, value) => {
    setAdminCreateMessage("");
    setNewAdminForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setAdminCreateMessage("");

    if (!isAccountVerified) {
      setAdminCreateMessage("Verify your email before adding another admin.");
      return;
    }

    setIsCreatingAdmin(true);

    try {
      const res = await api.post(
        "/auth/admins",
        {
          username: newAdminForm.username.trim(),
          email: newAdminForm.email.trim(),
          password: newAdminForm.password,
        },
        { headers: authHeaders() }
      );
      setAdminUsers(res.data.admins || []);
      setNewAdminForm({ username: "", email: "", password: "" });
      setAdminCreateMessage(res.data.message);
    } catch (err) {
      setAdminCreateMessage(err.response?.data?.message || "Unable to add admin");
    } finally {
      setIsCreatingAdmin(false);
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
      setUser(res.data.user);
      setVerifiedStateTick(Date.now());
      setEmailEditMessage(res.data.message);
      setEmailVerifyModalOpen(false);
    } catch (err) {
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
      setUser(res.data.user);
      setVerifiedStateTick(Date.now());
      setVerificationMessage(res.data.message);
    } catch (err) {
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
      setUser(res.data.user);
      setVerifiedStateTick(Date.now());
      setNewPassword("");
      setConfirmNewPassword("");
      setVerificationCode("");
    } catch (err) {
      setResetMessage(err.response?.data?.message || "Unable to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const saveHeroImage = async (e) => {
    e.preventDefault();
    setHeroConfirmAction("save");
  };

  const confirmSaveHeroImage = async () => {
    setHeroConfirmAction(null);
    setHeroImageMessage("");
    setIsSavingHeroImage(true);

    try {
      const res = await api.put(
        "/site/admin/hero",
        {
          name: heroForm.name.trim(),
          designation: heroForm.designation,
          description: heroForm.description.trim(),
          image: heroForm.image.trim(),
        },
        { headers: authHeaders() }
      );
      const content = Object.prototype.hasOwnProperty.call(res.data || {}, "content")
        ? res.data.content
        : res.data;
      const serverSupportsFullHeroCrud = Boolean(content?.name || content?.description || content?.designation);

      if (!serverSupportsFullHeroCrud) {
        setHeroForm((current) => ({
          ...current,
          image: content?.image || current.image,
        }));
        setHeroImageMessage("Server is still using the old image-only hero API. Redeploy the backend to update name, roles, and description.");
        setHeroUploadState("error");
        return;
      }

      setHeroForm({
        name: content?.name || DEFAULT_HERO_CONTENT.name,
        designation: Array.isArray(content?.designation)
          ? content.designation.join(", ")
          : DEFAULT_HERO_CONTENT.designation,
        description: content?.description || DEFAULT_HERO_CONTENT.description,
        image: content?.image || DEFAULT_HERO_CONTENT.image,
      });
      setHeroImageMessage(res.data.message);
      setHeroUploadState("saved");
    } catch (err) {
      setHeroImageMessage(err.response?.data?.message || "Unable to update hero image");
      setHeroUploadState("error");
    } finally {
      setIsSavingHeroImage(false);
    }
  };

  const resetHeroImage = async () => {
    setHeroConfirmAction("reset");
  };

  const confirmResetHeroImage = async () => {
    setHeroConfirmAction(null);
    setHeroImageMessage("");
    setIsSavingHeroImage(true);

    try {
      const res = await api.delete("/site/admin/hero", { headers: authHeaders() });
      const content = Object.prototype.hasOwnProperty.call(res.data || {}, "content")
        ? res.data.content
        : res.data;
      setHeroForm({
        name: content?.name || DEFAULT_HERO_CONTENT.name,
        designation: Array.isArray(content?.designation)
          ? content.designation.join(", ")
          : DEFAULT_HERO_CONTENT.designation,
        description: content?.description || DEFAULT_HERO_CONTENT.description,
        image: content?.image || DEFAULT_HERO_CONTENT.image,
      });
      setHeroImageMessage(res.data.message);
      setHeroUploadState("idle");
    } catch (err) {
      setHeroImageMessage(err.response?.data?.message || "Unable to reset hero image");
      setHeroUploadState("error");
    } finally {
      setIsSavingHeroImage(false);
    }
  };

  const uploadHeroImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setHeroImageMessage("");
    setHeroUploadState("idle");

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setHeroImageMessage("Upload a JPG, PNG, or WebP image.");
      setHeroUploadState("error");
      return;
    }

    if (file.size > MAX_HERO_UPLOAD_SIZE) {
      setHeroImageMessage("Image must be under 2.5 MB.");
      setHeroUploadState("error");
      return;
    }

    setHeroUploadState("ready");
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result || "");
      setHeroForm((current) => ({ ...current, image }));
      setHeroImageMessage("Preview ready. Save changes to publish it.");
      setHeroUploadState("ready");
    };
    reader.onerror = () => {
      setHeroImageMessage("Unable to read image file.");
      setHeroUploadState("error");
    };
    reader.readAsDataURL(file);
  };

  const updateHeroField = (field, value) => {
    setHeroImageMessage("");
    setHeroUploadState((current) => (current === "error" ? "idle" : current));
    setHeroForm((current) => ({ ...current, [field]: value }));
  };

  const updateGalleryField = (field, value) => {
    setGalleryMessage("");
    setGalleryUploadState((current) => (current === "error" ? "idle" : current));
    setGalleryForm((current) => ({ ...current, [field]: value }));
  };

  const uploadGalleryImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setGalleryMessage("");
    setGalleryUploadState("idle");

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setGalleryMessage("Upload a JPG, PNG, or WebP image.");
      setGalleryUploadState("error");
      return;
    }

    if (file.size > MAX_GALLERY_UPLOAD_SIZE) {
      setGalleryMessage("Gallery image must be under 3 MB.");
      setGalleryUploadState("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setGalleryForm((current) => ({
        ...current,
        img: String(reader.result || ""),
        alt: current.alt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
      }));
      setGalleryMessage("Preview ready. Add details and publish the image.");
      setGalleryUploadState("ready");
    };
    reader.onerror = () => {
      setGalleryMessage("Unable to read image file.");
      setGalleryUploadState("error");
    };
    reader.readAsDataURL(file);
  };

  const saveGalleryItem = async (event) => {
    event.preventDefault();
    setGalleryMessage("");

    if (!galleryForm.img) {
      setGalleryMessage("Choose an image before publishing.");
      setGalleryUploadState("error");
      return;
    }

    setIsSavingGallery(true);

    try {
      const payload = {
        image: galleryForm.img,
        alt: galleryForm.alt.trim() || "uploaded gallery image",
        location: galleryForm.location.trim() || "New upload",
        mood: galleryForm.mood.trim() || "Fresh frame",
        likes: Math.max(Number(galleryForm.likes) || 0, 0),
      };
      const res = await requestWithFallback(
        () => api.post("/site/admin/gallery", payload, { headers: authHeaders() }),
        () => api.post("/gallery/admin", payload, { headers: authHeaders() })
      );
      setGalleryItems((current) => [res.data.image, ...current]);
      setGalleryForm(emptyGalleryForm);
      setGalleryUploadState("saved");
      setGalleryMessage(res.data.message || "Gallery image published.");
    } catch (err) {
      setGalleryUploadState("error");
      setGalleryMessage(getApiErrorMessage(err, "Unable to publish gallery image.", "Gallery API not found. Restart or redeploy the backend server."));
    } finally {
      setIsSavingGallery(false);
    }
  };

  const removeGalleryItem = async (itemId) => {
    setGalleryMessage("");

    try {
      const res = await requestWithFallback(
        () => api.delete(`/site/admin/gallery/${itemId}`, { headers: authHeaders() }),
        () => api.delete(`/gallery/admin/${itemId}`, { headers: authHeaders() })
      );
      setGalleryItems((current) => current.filter((item) => item.id !== itemId));
      setGalleryMessage(res.data.message || "Gallery image removed.");
    } catch (err) {
      setGalleryMessage(getApiErrorMessage(err, "Unable to remove gallery image.", "Gallery API not found. Restart or redeploy the backend server."));
    } finally {
      setGalleryDeleteTarget(null);
    }
  };

  const updateGalleryItemLikes = (itemId, likes) => {
    const normalizedLikes = Math.max(Number(likes) || 0, 0);
    const nextItems = galleryItems.map((item) => (
      item.id === itemId ? { ...item, likes: normalizedLikes } : item
    ));
    setGalleryItems(nextItems);
  };

  const saveGalleryItemLikes = async (itemId, likes) => {
    setGalleryMessage("");

    try {
      const payload = { likes: Math.max(Number(likes) || 0, 0) };
      const res = await requestWithFallback(
        () => api.patch(`/site/admin/gallery/${itemId}`, payload, { headers: authHeaders() }),
        () => api.patch(`/gallery/admin/${itemId}`, payload, { headers: authHeaders() })
      );
      setGalleryItems((current) => current.map((item) => (
        item.id === itemId ? res.data.image : item
      )));
      setGalleryMessage("Like count saved to MongoDB.");
    } catch (err) {
      setGalleryMessage(getApiErrorMessage(err, "Unable to update likes.", "Gallery API not found. Restart or redeploy the backend server."));
    }
  };

  const readBlogImageFile = (file, onReady) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setBlogMessage("Upload a JPG, PNG, or WebP image.");
      setBlogUploadState("error");
      return;
    }

    if (file.size > MAX_BLOG_UPLOAD_SIZE) {
      setBlogMessage("Blog image must be under 3 MB.");
      setBlogUploadState("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onReady(String(reader.result || ""));
      setBlogMessage("Image preview ready.");
      setBlogUploadState("ready");
    };
    reader.onerror = () => {
      setBlogMessage("Unable to read image file.");
      setBlogUploadState("error");
    };
    reader.readAsDataURL(file);
  };

  const readBlogMediaFile = (file, index = 0) => new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected."));
      return;
    }

    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm", "video/ogg"].includes(file.type);

    if (!isImage && !isVideo) {
      reject(new Error("Upload JPG, PNG, WebP, MP4, WebM, or OGG files."));
      return;
    }

    if (isImage && file.size > MAX_BLOG_UPLOAD_SIZE) {
      reject(new Error("Blog image must be under 3 MB."));
      return;
    }

    if (isVideo && file.size > MAX_BLOG_VIDEO_UPLOAD_SIZE) {
      reject(new Error("Blog video must be under 5 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({
      uid: createBlogBlockId(),
      label: 0,
      type: isVideo ? "video" : "image",
      text: "",
      url: String(reader.result || ""),
      caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
      orderIndex: index,
    });
    reader.onerror = () => reject(new Error("Unable to read media file."));
    reader.readAsDataURL(file);
  });

  const uploadBlogCover = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setBlogMessage("");
    readBlogImageFile(file, (image) => {
      setBlogForm((current) => ({ ...current, coverImage: image }));
    });
  };

  const uploadBlogBlockImage = async (event, index) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setBlogMessage("");

    try {
      const media = await readBlogMediaFile(file);
      setBlogForm((current) => ({
        ...current,
        blocks: current.blocks.map((block, blockIndex) => (
          blockIndex === index
            ? { ...block, type: media.type, url: media.url, caption: block.caption || media.caption }
            : block
        )),
      }));
      setBlogMessage("Media preview ready.");
      setBlogUploadState("ready");
    } catch (error) {
      setBlogMessage(error.message || "Unable to read media file.");
      setBlogUploadState("error");
    }
  };

  const uploadInlineBlogImage = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setBlogMessage("");

    if (!files.length) return;

    try {
      const results = await Promise.allSettled(files.map((file, index) => readBlogMediaFile(file, index)));
      const mediaBlocks = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      if (!mediaBlocks.length) {
        setBlogMessage(results.find((result) => result.status === "rejected")?.reason?.message || "Unable to upload selected media.");
        setBlogUploadState("error");
        return;
      }

      setBlogForm((current) => {
        const targetIndex = Math.min(Math.max(activeBlogBlockIndex, 0), current.blocks.length - 1);
        const nextBlocks = [...current.blocks];
        const firstLabel = getNextBlogBlockLabel(current.blocks);
        nextBlocks.splice(
          targetIndex + 1,
          0,
          ...mediaBlocks.map((block, index) => ({ ...block, label: firstLabel + index }))
        );
        return { ...current, blocks: nextBlocks };
      });
      setBlogMessage(`${mediaBlocks.length} media item${mediaBlocks.length > 1 ? "s" : ""} added.`);
      setBlogUploadState("ready");
    } catch (error) {
      setBlogMessage(error.message || "Unable to upload selected media.");
      setBlogUploadState("error");
    }
  };

  const getInlineImagesFromText = (text) => {
    const images = [];
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imagePattern.exec(String(text || ""))) !== null) {
      images.push({ caption: match[1], url: match[2] });
    }

    return images;
  };

  const updateBlogBlock = (index, updates) => {
    setBlogForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, blockIndex) => (
        blockIndex === index ? { ...block, ...updates } : block
      )),
    }));
  };

  const addBlogBlock = (type) => {
    setBlogForm((current) => {
      const nextBlock = type === "link"
        ? { uid: createBlogBlockId(), label: getNextBlogBlockLabel(current.blocks), type, text: "", url: "", caption: "" }
        : type === "image"
          ? { uid: createBlogBlockId(), label: getNextBlogBlockLabel(current.blocks), type, text: "", url: "", caption: "" }
          : { uid: createBlogBlockId(), label: getNextBlogBlockLabel(current.blocks), type, text: "", url: "", caption: "" };

      return { ...current, blocks: [...current.blocks, nextBlock] };
    });
  };

  const moveBlogBlock = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex === null) return;

    setBlogForm((current) => {
      const nextBlocks = [...current.blocks];
      const [movedBlock] = nextBlocks.splice(fromIndex, 1);
      const targetIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      nextBlocks.splice(targetIndex, 0, movedBlock);
      return { ...current, blocks: nextBlocks };
    });
    setActiveBlogBlockIndex(fromIndex < toIndex ? toIndex - 1 : toIndex);
  };

  const handleBlogBlockDrag = (event) => {
    const edgeSize = 120;
    const scrollSpeed = 18;

    if (event.clientY < edgeSize) {
      window.scrollBy({ top: -scrollSpeed, behavior: "auto" });
    }

    if (window.innerHeight - event.clientY < edgeSize) {
      window.scrollBy({ top: scrollSpeed, behavior: "auto" });
    }
  };

  const removeBlogBlock = (index) => {
    setBlogForm((current) => ({
      ...current,
      blocks: current.blocks.length > 1 ? current.blocks.filter((_, blockIndex) => blockIndex !== index) : current.blocks,
    }));
  };

  const resetBlogForm = () => {
    setBlogForm(emptyBlogForm);
    setEditingBlogId("");
    setBlogUploadState("idle");
    setBlogMessage("");
  };

  const editBlogItem = (blog) => {
    navigate("/admin/posts/new", { state: { blog } });
  };

  const saveBlogItem = async (event) => {
    event.preventDefault();
    setBlogMessage("");

    if (!blogForm.title.trim()) {
      setBlogMessage("Add a blog title before publishing.");
      setBlogUploadState("error");
      return;
    }

    if (!blogForm.coverImage) {
      setBlogMessage("Add a cover image before publishing.");
      setBlogUploadState("error");
      return;
    }

    const hasContentBlock = blogForm.blocks.some((block) => {
      if (block.type === "image" || block.type === "video") return String(block.url || "").trim();
      if (block.type === "link") return String(block.text || "").trim() && String(block.url || "").trim();
      return String(block.text || "").trim();
    });

    if (!hasContentBlock) {
      setBlogMessage("Add at least one paragraph, quote, image, or link block before publishing.");
      setBlogUploadState("error");
      return;
    }

    setIsSavingBlog(true);

    try {
      const payload = {
        ...blogForm,
        title: blogForm.title.trim(),
        category: blogForm.category.trim(),
        excerpt: blogForm.excerpt.trim(),
        readTime: blogForm.readTime.trim(),
        blocks: blogForm.blocks.map((block) => ({
          type: block.type,
          text: String(block.text || "").trim(),
          url: String(block.url || "").trim(),
          caption: String(block.caption || "").trim(),
        })),
      };
      const res = editingBlogId
        ? await api.put(`/blogs/admin/${editingBlogId}`, payload, { headers: authHeaders() })
        : await api.post("/blogs/admin", payload, { headers: authHeaders() });

      setBlogItems((current) => (
        editingBlogId
          ? current.map((item) => (item.id === res.data.blog.id ? res.data.blog : item))
          : [res.data.blog, ...current]
      ));
      resetBlogForm();
      setBlogMessage(res.data.message || "Blog saved.");
      setBlogUploadState("saved");
    } catch (err) {
      const status = err.response?.status;
      const details = status ? ` Status: ${status}.` : "";
      setBlogMessage(`${getApiErrorMessage(err, "Unable to save blog.", "Blog API not found. Restart or redeploy the backend server.")}${details}`);
      setBlogUploadState("error");
    } finally {
      setIsSavingBlog(false);
    }
  };

  const deleteBlogItem = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}" and its comments?`)) return;

    try {
      const res = await api.delete(`/blogs/admin/${blog.id}`, { headers: authHeaders() });
      setBlogItems((current) => current.filter((item) => item.id !== blog.id));
      setBlogComments((current) => current.filter((comment) => comment.blogId !== blog.id));
      if (editingBlogId === blog.id) resetBlogForm();
      setBlogMessage(res.data.message || "Blog deleted.");
    } catch (err) {
      setBlogMessage(getApiErrorMessage(err, "Unable to delete blog.", "Blog API not found. Restart or redeploy the backend server."));
    }
  };

  const deleteBlogComment = async (comment) => {
    if (!window.confirm(`Delete comment from ${comment.name}?`)) return;

    try {
      const res = await api.delete(`/blogs/admin/comments/${comment.id}`, { headers: authHeaders() });
      setBlogComments((current) => current.filter((item) => item.id !== comment.id));
      setBlogItems((current) => current.map((blog) => (
        blog.id === comment.blogId ? { ...blog, commentCount: Math.max((blog.commentCount || 0) - 1, 0) } : blog
      )));
      setBlogMessage(res.data.message || "Comment deleted.");
    } catch (err) {
      setBlogMessage(getApiErrorMessage(err, "Unable to delete comment.", "Blog API not found. Restart or redeploy the backend server."));
    }
  };

  const updateStoredComment = (updatedComment) => {
    setBlogComments((current) => current.map((comment) => (
      comment.id === updatedComment.id
        ? {
          ...comment,
          ...updatedComment,
          blogTitle: comment.blogTitle,
          blogSlug: comment.blogSlug,
        }
        : comment
    )));
  };

  const toggleBlogCommentVisibility = async (comment) => {
    const nextHidden = !comment.isHidden;
    const pendingKey = `comment-${comment.id}`;
    if (pendingCommentVisibility[pendingKey]) return;

    setBlogMessage("");
    setPendingCommentVisibility((current) => ({ ...current, [pendingKey]: true }));

    try {
      const res = await api.patch(
        `/blogs/admin/comments/${comment.id}/visibility`,
        { isHidden: nextHidden },
        { headers: authHeaders() }
      );
      updateStoredComment(res.data.comment);
      setBlogMessage(res.data.message || "Comment updated.");
    } catch (err) {
      setBlogMessage(getApiErrorMessage(err, "Unable to update comment.", "Blog API not found. Restart or redeploy the backend server."));
    } finally {
      setPendingCommentVisibility((current) => ({ ...current, [pendingKey]: false }));
    }
  };

  const toggleBlogReplyVisibility = async (comment, reply) => {
    const nextHidden = !reply.isHidden;
    const pendingKey = `reply-${reply.id}`;
    if (pendingCommentVisibility[pendingKey]) return;

    setBlogMessage("");
    setPendingCommentVisibility((current) => ({ ...current, [pendingKey]: true }));

    try {
      const res = await api.patch(
        `/blogs/admin/comments/${comment.id}/replies/${reply.id}/visibility`,
        { isHidden: nextHidden },
        { headers: authHeaders() }
      );
      updateStoredComment(res.data.comment);
      setBlogMessage(res.data.message || "Reply updated.");
    } catch (err) {
      setBlogMessage(getApiErrorMessage(err, "Unable to update reply.", "Blog API not found. Restart or redeploy the backend server."));
    } finally {
      setPendingCommentVisibility((current) => ({ ...current, [pendingKey]: false }));
    }
  };

  const deleteBlogReply = async (comment, reply) => {
    if (!window.confirm("Delete this reply?")) return;

    try {
      const res = await api.delete(`/blogs/admin/comments/${comment.id}/replies/${reply.id}`, { headers: authHeaders() });
      updateStoredComment(res.data.comment);
      setBlogMessage(res.data.message || "Reply deleted.");
    } catch (err) {
      setBlogMessage(getApiErrorMessage(err, "Unable to delete reply.", "Blog API not found. Restart or redeploy the backend server."));
    }
  };

  const getGalleryLikeCount = (item) => item.likes;

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
                <h2>{isAccountVerified ? "Set New Password" : "Verify Email"}</h2>
                <p>
                  {isAccountVerified
                    ? `Verification is active${accountVerifiedUntilLabel ? ` until ${accountVerifiedUntilLabel}` : ""}. Set a new password for this admin account.`
                    : "Enter the verification code sent to your recovery email to edit your password."}
                </p>
              </div>
              <button type="button" onClick={closePasswordModal} aria-label="Close">
                <Icon icon="close" />
              </button>
            </header>

            {!isAccountVerified ? (
              <div className="admin_modal_body">
                <div className="admin_modal_email">
                  <Icon icon="mail-open-text" />
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
                  <Icon icon="send" />
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
                      onChange={(e) => {
                        setVerificationMessage("");
                        setResetMessage("");
                        setVerificationCode(e.target.value);
                      }}
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
                  <Icon icon="check-circle" />
                  <span>
                    Verification active{accountVerifiedUntilLabel ? ` until ${accountVerifiedUntilLabel}` : ""}. You can edit the password now.
                  </span>
                </div>

                <form className="admin_verify_form admin_verify_form--password" onSubmit={saveNewPassword}>
                  <label>
                    <span>New Password</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setResetMessage("");
                        setNewPassword(e.target.value);
                      }}
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
                      onChange={(e) => {
                        setResetMessage("");
                        setConfirmNewPassword(e.target.value);
                      }}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <button type="submit" disabled={isSavingPassword}>
                    Set New Password
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
                <Icon icon="close" />
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

                {emailChanged && !isAccountVerified ? (
                  <p>Email change requires verification. Click Save Changes to continue.</p>
                ) : null}

                {emailEditMessage ? <p>{emailEditMessage}</p> : null}
                {emailMessage ? <p>{emailMessage}</p> : null}
                <div className="admin_account_actions">
                  <button type="button" onClick={cancelAccountEdit}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSavingEmail}>
                    Save Changes
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
                <Icon icon="close" />
              </button>
            </header>

            <div className="admin_modal_body">
              <div className="admin_modal_email">
                <Icon icon="mail-open-text" />
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
                    onChange={(e) => {
                      setEmailEditMessage("");
                      setEmailEditCode(e.target.value);
                    }}
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

      {heroConfirmAction ? (
        <div className="admin_modal_layer admin_modal_layer--hero-confirm" role="presentation">
          <button
            type="button"
            className="admin_modal_backdrop"
            aria-label="Cancel hero confirmation"
            onClick={() => setHeroConfirmAction(null)}
          />
          <section className="admin_confirm_modal" role="dialog" aria-modal="true" aria-label="Confirm hero action">
            <div className={heroConfirmAction === "reset" ? "admin_confirm_icon danger" : "admin_confirm_icon"}>
              <Icon icon={heroConfirmAction === "reset" ? "reset" : "save"} />
            </div>
            <p className="admin_auth_kicker">Hero section</p>
            <h2>{heroConfirmAction === "reset" ? "Reset content?" : "Save changes?"}</h2>
            <p>
              {heroConfirmAction === "reset"
                ? "This will restore the default hero name, roles, description, and image."
                : "This will publish the current hero name, roles, description, and image to the home page."}
            </p>
            <div className="admin_confirm_actions">
              <button type="button" onClick={() => setHeroConfirmAction(null)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={heroConfirmAction === "reset" ? confirmResetHeroImage : confirmSaveHeroImage}
              >
                {heroConfirmAction === "reset" ? "Reset" : "Save"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {galleryDeleteTarget ? (
        <div className="admin_modal_layer admin_modal_layer--gallery-confirm" role="presentation">
          <button
            type="button"
            className="admin_modal_backdrop"
            aria-label="Cancel gallery delete"
            onClick={() => setGalleryDeleteTarget(null)}
          />
          <section className="admin_confirm_modal" role="dialog" aria-modal="true" aria-label="Confirm gallery delete">
            <div className="admin_confirm_icon danger">
              <Icon icon="trash" />
            </div>
            <p className="admin_auth_kicker">Gallery image</p>
            <h2>Delete image?</h2>
            <p>This will remove the uploaded image from MongoDB and the public gallery.</p>
            <div className="admin_confirm_actions">
              <button type="button" onClick={() => setGalleryDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" onClick={() => removeGalleryItem(galleryDeleteTarget.id)}>
                Delete
              </button>
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
              <Icon icon={section.icon} />
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
          {activeSection === "blogs" ? (
            <button type="button" className="admin_header_action" onClick={() => navigate("/admin/posts/new")}>
              <Icon icon="plus" />
              Add New Post
            </button>
          ) : null}
        </header>

        {activeSection === "overview" ? (
          <>
            {isLoadingUser ? (
              <AdminSkeleton variant="stats" />
            ) : (
              <div className="admin_stats">
                {contentStats.map((card) => (
                  <article className="admin_stat_card" key={card.label}>
                    <Icon icon={card.icon} />
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <p>{card.helper}</p>
                  </article>
                ))}
              </div>
            )}

            {isLoadingUser ? (
              <AdminSkeleton variant="cards" />
            ) : (
              <section className="admin_content_grid">
                {Object.entries(contentSections).map(([id, section]) => (
                  <button
                    type="button"
                    className="admin_content_card"
                    onClick={() => selectSection(id)}
                    key={id}
                  >
                    <span>{section.eyebrow}</span>
                    <strong>{section.title}</strong>
                    <p>{section.description}</p>
                  </button>
                ))}
              </section>
            )}
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
                <Icon icon="external" />
                <span>View public page</span>
              </a>
            </div>

            <div className="admin_editor_list">
              {contentSections[activeSection].items.map((item) => (
                <article key={item}>
                  <Icon icon="check" />
                  <span>{item}</span>
                </article>
              ))}
            </div>

            {activeSection === "hero" && isLoadingHero ? (
              <AdminSkeleton variant="editor" />
            ) : null}

            {activeSection === "hero" && !isLoadingHero ? (
              <section className="admin_hero_image_editor">
                <div
                  className={heroForm.image ? "admin_hero_image_preview has_image" : "admin_hero_image_preview"}
                  style={heroForm.image ? { backgroundImage: `url(${heroForm.image})` } : undefined}
                >
                  {heroForm.image ? (
                    <span>
                      <Icon icon="image" />
                      Live preview
                    </span>
                  ) : (
                    <div className="admin_gallery_preview_empty">
                      <Icon icon="cloud-upload" />
                      <strong>Hero image preview</strong>
                      <p>Upload an image to publish the hero section.</p>
                    </div>
                  )}
                </div>
                <form className="admin_hero_image_form" onSubmit={saveHeroImage}>
                  <div className="admin_hero_fields">
                    <label>
                      <span>Name field</span>
                      <input
                        type="text"
                        value={heroForm.name}
                        onChange={(e) => updateHeroField("name", e.target.value)}
                        placeholder="Hero display name"
                        required
                      />
                    </label>
                    <label>
                      <span>Roles</span>
                      <input
                        type="text"
                        value={heroForm.designation}
                        onChange={(e) => updateHeroField("designation", e.target.value)}
                        placeholder="Travel Writer, Photographer"
                        required
                      />
                    </label>
                  </div>
                  <label>
                    <span>Description</span>
                    <textarea
                      value={heroForm.description}
                      onChange={(e) => updateHeroField("description", e.target.value)}
                      placeholder="Short hero introduction"
                      rows={3}
                      required
                    />
                  </label>
                  <div className="admin_hero_image_actions">
                    <label className="admin_hero_upload_button">
                      <span>
                        <i
                          className={
                            heroUploadState === "ready"
                              ? "check-circle"
                              : heroUploadState === "saved"
                                ? "check-circle"
                                : heroUploadState === "error"
                                  ? "warning"
                                  : "cloud-upload"
                          }
                          aria-hidden="true"
                        ></i>
                        {heroUploadState === "ready" ? "Ready" : heroUploadState === "saved" ? "Saved" : heroUploadState === "error" ? "Retry" : "Upload"}
                      </span>
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadHeroImage} />
                    </label>
                    <button type="submit" disabled={isSavingHeroImage}>
                      <Icon icon="save" />
                      Save
                    </button>
                    <button type="button" onClick={resetHeroImage} disabled={isSavingHeroImage}>
                      <Icon icon="trash-restore" />
                      Reset
                    </button>
                  </div>
                  {heroImageMessage ? <p className="admin_profile_message">{heroImageMessage}</p> : null}
                </form>
              </section>
            ) : null}

            {activeSection === "gallery" && isLoadingGallery ? (
              <AdminSkeleton variant="gallery" />
            ) : null}

            {activeSection === "gallery" && !isLoadingGallery ? (
              <section className="admin_gallery_manager">
                <div className="admin_gallery_toolbar">
                  <article>
                    <Icon icon="images" />
                    <span>Total Images</span>
                    <strong>{galleryItems.length}</strong>
                  </article>
                  <article>
                    <Icon icon="cloud-upload" />
                    <span>Uploaded</span>
                    <strong>{galleryItems.length}</strong>
                  </article>
                  <article>
                    <Icon icon="heart" />
                    <span>Total Likes</span>
                    <strong>
                      {galleryItems.reduce((total, item) => total + getGalleryLikeCount(item), 0)}
                    </strong>
                  </article>
                </div>

                <div className="admin_gallery_upload_panel">
                  <div
                    className={galleryForm.img ? "admin_gallery_preview has_image" : "admin_gallery_preview"}
                    style={galleryForm.img ? { backgroundImage: `url(${galleryForm.img})` } : undefined}
                  >
                    {!galleryForm.img ? (
                      <div className="admin_gallery_preview_empty">
                        <Icon icon="cloud-upload" />
                        <strong>Image preview</strong>
                        <p>Upload a JPG, PNG, or WebP photo.</p>
                      </div>
                    ) : null}
                    {galleryForm.img ? (
                      <span>
                        <Icon icon="image" />
                        Preview ready
                      </span>
                    ) : null}
                  </div>
                  <form className="admin_gallery_form" onSubmit={saveGalleryItem}>
                    <div className="admin_gallery_form_head">
                      <div>
                        <p className="admin_auth_kicker">Upload photo</p>
                        <h3>Publish a gallery image</h3>
                      </div>
                      <label className={`admin_gallery_upload_button admin_gallery_upload_button--${galleryUploadState}`}>
                        <Icon
                          icon={
                            galleryUploadState === "ready"
                              ? "check-circle"
                              : galleryUploadState === "saved"
                                ? "check-circle"
                                : galleryUploadState === "error"
                                  ? "warning"
                                  : "cloud-upload"
                          }
                        />
                        <span>{galleryUploadState === "ready" ? "Ready" : galleryUploadState === "saved" ? "Saved" : galleryUploadState === "error" ? "Retry" : "Upload"}</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadGalleryImage} />
                      </label>
                    </div>
                    <div className="admin_gallery_fields">
                      <label>
                        <span>Image title</span>
                        <input
                          type="text"
                          value={galleryForm.alt}
                          onChange={(event) => updateGalleryField("alt", event.target.value)}
                          placeholder="Beach sunset frame"
                        />
                      </label>
                      <label>
                        <span>Location</span>
                        <input
                          type="text"
                          value={galleryForm.location}
                          onChange={(event) => updateGalleryField("location", event.target.value)}
                          placeholder="Coastal light"
                        />
                      </label>
                      <label>
                        <span>Mood</span>
                        <input
                          type="text"
                          value={galleryForm.mood}
                          onChange={(event) => updateGalleryField("mood", event.target.value)}
                          placeholder="Soft morning"
                        />
                      </label>
                      <label>
                        <span>Initial likes</span>
                        <input
                          type="number"
                          min="0"
                          value={galleryForm.likes}
                          onChange={(event) => updateGalleryField("likes", event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="admin_gallery_form_actions">
                      {galleryMessage ? <p className="admin_profile_message">{galleryMessage}</p> : <span></span>}
                      <button type="submit" className="admin_gallery_publish_button" disabled={isSavingGallery}>
                        <Icon icon="send" />
                        <span>{isSavingGallery ? "Publishing..." : "Publish Image"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="admin_gallery_library">
                  {galleryItems.map((item) => (
                    <article className="admin_gallery_card" key={item.id}>
                      <div className="admin_gallery_card_image" style={{ backgroundImage: `url(${item.img})` }}>
                        <span>{item.source}</span>
                      </div>
                      <div className="admin_gallery_card_body">
                        <div>
                          <strong>{item.location}</strong>
                          <p>{item.mood}</p>
                        </div>
                        <span className="admin_gallery_like_badge">
                          <Icon icon="heart" />
                          {getGalleryLikeCount(item)}
                        </span>
                      </div>
                      {item.source === "Uploaded" ? (
                        <div className="admin_gallery_card_actions">
                          <label>
                            <span>Likes</span>
                            <input
                              type="number"
                              min="0"
                              value={item.likes}
                              onChange={(event) => updateGalleryItemLikes(item.id, event.target.value)}
                              onBlur={(event) => saveGalleryItemLikes(item.id, event.target.value)}
                            />
                          </label>
                          <button type="button" onClick={() => setGalleryDeleteTarget(item)}>
                            <Icon icon="trash" />
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                  {!galleryItems.length ? (
                    <div className="admin_gallery_empty_state">
                      <Icon icon="images" />
                      <strong>No uploaded gallery images</strong>
                      <span>Publish an image above to add it to the website.</span>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeSection === "blogs" && isLoadingBlogs ? (
              <AdminSkeleton variant="editor" />
            ) : null}

            {activeSection === "blogs" && !isLoadingBlogs ? (
              <section className="admin_blog_manager">
                <div className="admin_gallery_toolbar">
                  <article>
                    <Icon icon="newspaper" />
                    <span>Total Blogs</span>
                    <strong>{blogItems.length}</strong>
                  </article>
                  <article>
                    <Icon icon="comment-dots" />
                    <span>Comments</span>
                    <strong>{blogComments.length}</strong>
                  </article>
                  <article>
                    <Icon icon="check-circle" />
                    <span>Published</span>
                    <strong>{blogItems.filter((blog) => blog.isPublished !== false).length}</strong>
                  </article>
                </div>

                <div className="admin_blog_new_post_bar">
                  <div>
                    <strong>Classic Add New Post</strong>
                    <span>Open the WordPress-style editor with title, permalink, featured image, media, draft, and publish panel.</span>
                  </div>
                  <button type="button" onClick={() => navigate("/admin/posts/new")}>
                    <Icon icon="plus" />
                    Add New Post
                  </button>
                </div>

                {blogMessage ? <p className="admin_profile_message admin_blog_top_message">{blogMessage}</p> : null}

                <div className="admin_blog_library">
                  {blogItems.map((blog, index) => (
                    <article className="admin_blog_card" key={blog.id}>
                      <span className="admin_blog_card_number">#{index + 1}</span>
                      <div className="admin_blog_card_image" style={{ backgroundImage: `url(${blog.coverImage || blog.img})` }}></div>
                      <div>
                        <span>{blog.category}</span>
                        <h3>{blog.title}</h3>
                        <p>{getBlogCardSummary(blog)}</p>
                        <div className="admin_blog_card_meta">
                          <strong>{blog.readTime}</strong>
                          <strong>{blog.commentCount || 0} comments</strong>
                          <strong>{blog.isPublished === false ? "Draft" : "Published"}</strong>
                        </div>
                        <div className="admin_gallery_card_actions">
                          <button type="button" onClick={() => editBlogItem(blog)}>
                            <Icon icon="edit" />
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteBlogItem(blog)}>
                            <Icon icon="trash" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {!blogItems.length ? (
                    <div className="admin_gallery_empty_state">
                      <Icon icon="newspaper" />
                      <strong>No blogs yet</strong>
                      <span>Create your first post above.</span>
                    </div>
                  ) : null}
                </div>

                <section className="admin_blog_comments">
                  <div className="admin_gallery_form_head">
                    <div>
                      <p className="admin_auth_kicker">Comment moderation</p>
                      <h3>Reader comments</h3>
                    </div>
                  </div>
                  {blogComments.map((comment, index) => (
                    <article className="admin_comment_card" key={comment.id}>
                      <span className="admin_comment_number">#{index + 1}</span>
                      <div>
                        <div className="admin_comment_card_head">
                          <strong>{comment.name}</strong>
                          <span>{comment.dateTime || `${comment.date || ""}${comment.time ? `, ${comment.time}` : ""}`}</span>
                        </div>
                        <div className="admin_comment_source">
                          <Icon icon="newspaper" />
                          <span>{comment.blogTitle || "Deleted blog"}</span>
                        </div>
                        <small>{comment.email}{comment.phone ? ` - ${comment.phone}` : ""}</small>
                        <p>{comment.message}</p>
                        <div className="admin_comment_meta_line">
                          <span>{comment.likes || 0} likes</span>
                          <span>{(comment.replies || []).length} replies</span>
                          <span>{comment.isHidden ? "Hidden" : "Visible"}</span>
                        </div>
                        {comment.replies?.length ? (
                          <div className="admin_comment_replies">
                            {comment.replies.map((reply) => {
                              const replyPendingKey = `reply-${reply.id}`;
                              const isReplyVisibilityPending = Boolean(pendingCommentVisibility[replyPendingKey]);

                              return (
                              <article className={reply.isHidden ? "admin_comment_reply is_hidden" : "admin_comment_reply"} key={reply.id}>
                                <div>
                                  <strong>{reply.name}</strong>
                                  <small>{reply.dateTime || reply.date} - {reply.email}</small>
                                  <p>{reply.message}</p>
                                  <div className="admin_comment_meta_line">
                                    <span>{reply.likes || 0} likes</span>
                                    <span>{reply.isHidden ? "Hidden" : "Visible"}</span>
                                  </div>
                                </div>
                                <div className="admin_comment_reply_actions">
                                  <button type="button" disabled={isReplyVisibilityPending} onClick={() => toggleBlogReplyVisibility(comment, reply)}>
                                    <Icon icon={reply.isHidden ? "eye" : "eye-slash"} />
                                    {isReplyVisibilityPending ? "Saving..." : reply.isHidden ? "Show" : "Hide"}
                                  </button>
                                  <button type="button" onClick={() => deleteBlogReply(comment, reply)}>
                                    <Icon icon="trash" />
                                    Delete
                                  </button>
                                </div>
                              </article>
                            )})}
                          </div>
                        ) : null}
                      </div>
                      <div className="admin_comment_actions">
                        <button type="button" disabled={Boolean(pendingCommentVisibility[`comment-${comment.id}`])} onClick={() => toggleBlogCommentVisibility(comment)}>
                          <Icon icon={comment.isHidden ? "eye" : "eye-slash"} />
                          {pendingCommentVisibility[`comment-${comment.id}`] ? "Saving..." : comment.isHidden ? "Show" : "Hide"}
                        </button>
                        <button type="button" onClick={() => deleteBlogComment(comment)}>
                          <Icon icon="trash" />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                  {!blogComments.length ? (
                    <div className="admin_gallery_empty_state">
                      <Icon icon="comment-dots" />
                      <strong>No comments yet</strong>
                      <span>Reader comments will appear here.</span>
                    </div>
                  ) : null}
                </section>
              </section>
            ) : null}

            <div className="admin_editor_note">
              <Icon icon="info" />
              <p>{activeSection === "hero" ? "Hero changes are saved to the server and shown on the public home page." : activeSection === "gallery" ? "Uploaded gallery images and like totals are saved in MongoDB and appear on the public gallery page." : activeSection === "blogs" ? "Blogs, content images, links, and comments are saved in MongoDB and shown on the public blog pages." : "This dashboard section matches the current website content. Editing controls can be connected next when content APIs are added."}</p>
            </div>
          </section>
        ) : null}

        {activeSection === "account" && isLoadingUser ? (
          <AdminSkeleton variant="account" />
        ) : null}

        {activeSection === "account" && !isLoadingUser ? (
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
                    <Icon icon="user-shield" />
                    Portfolio Admin
                  </span>
                  <span className={isAccountVerified ? "verified" : ""}>
                    <Icon icon={isAccountVerified ? "check-circle" : "clock"} />
                    {isAccountVerified
                      ? `Verified until ${accountVerifiedUntilLabel || "soon"}`
                      : "Verification required for secure changes"}
                  </span>
                </div>
              </div>
              <div className="admin_account_hero_actions">
                <button
                  type="button"
                  className="admin_section_edit"
                  onClick={openAccountModal}
                >
                  <Icon icon="edit" />
                  <span>Edit Profile</span>
                </button>
                <button type="button" className="admin_profile_logout" onClick={logout}>
                  <Icon icon="logout" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <div className="admin_account_workspace">
              <div className="admin_account_option_list" role="tablist" aria-label="Account options">
                {[
                  { id: "profile", label: "Profile", icon: "id-card", meta: user?.email || "Account details" },
                  {
                    id: "password",
                    label: "Password",
                    icon: "lock",
                    meta: isAccountVerified ? `Unlocked until ${accountVerifiedUntilLabel || "soon"}` : "Needs verification",
                  },
                  { id: "admins", label: "Admins", icon: "user-shield", meta: isLoadingAdmins ? "Loading" : `${adminUsers.length} admins` },
                ].map((option) => (
                  <button
                    type="button"
                    className={activeAccountOption === option.id ? "active" : ""}
                    onClick={() => setActiveAccountOption(option.id)}
                    role="tab"
                    aria-selected={activeAccountOption === option.id}
                    key={option.id}
                  >
                    <Icon icon={option.icon} />
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.meta}</small>
                    </span>
                    <Icon icon="arrow-right" />
                  </button>
                ))}
              </div>

              <section className="admin_account_option_panel" role="tabpanel">
                {activeAccountOption === "profile" ? (
                  <>
                    <div className="admin_profile_section_head">
                      <Icon icon="id-card" />
                      <div>
                        <span>Account Details</span>
                        <strong>Profile Information</strong>
                      </div>
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
                  </>
                ) : null}

                {activeAccountOption === "password" ? (
                  <>
                    <div className="admin_profile_section_head">
                      <Icon icon="lock" />
                      <div>
                        <span>Password</span>
                        <strong>New Password</strong>
                      </div>
                    </div>
                    <div className={isAccountVerified ? "admin_verify_status active" : "admin_verify_status"}>
                      <Icon icon={isAccountVerified ? "check-circle" : "clock"} />
                      <span>
                        {isAccountVerified
                          ? `Unlocked until ${accountVerifiedUntilLabel || "soon"}`
                          : "Click change to verify your email first"}
                      </span>
                    </div>
                    <form className="admin_password_inline_form" onSubmit={saveNewPassword}>
                      <label>
                        <span>New Password</span>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => {
                            setResetMessage("");
                            setNewPassword(e.target.value);
                          }}
                          autoComplete="new-password"
                          minLength={8}
                          required={isAccountVerified}
                        />
                      </label>
                      <label>
                        <span>Confirm Password</span>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => {
                            setResetMessage("");
                            setConfirmNewPassword(e.target.value);
                          }}
                          autoComplete="new-password"
                          minLength={8}
                          required={isAccountVerified}
                        />
                      </label>
                      <button
                        type={isAccountVerified ? "submit" : "button"}
                        className="admin_profile_reset"
                        onClick={isAccountVerified ? undefined : openPasswordModal}
                        disabled={!user?.email || isSavingPassword}
                      >
                        <Icon icon="key" />
                        <span>{isSavingPassword ? "Changing..." : "Change Password"}</span>
                      </button>
                    </form>
                    {resetMessage ? <p className="admin_profile_message">{resetMessage}</p> : null}
                  </>
                ) : null}

                {activeAccountOption === "admins" ? (
                  <>
                    <div className="admin_profile_section_head">
                      <Icon icon="user-shield" />
                      <div>
                        <span>Admins</span>
                        <strong>Add Another Admin</strong>
                      </div>
                    </div>

                    <form className="admin_new_admin_form" onSubmit={createAdmin}>
                      <label>
                        <span>Username</span>
                        <input
                          type="text"
                          value={newAdminForm.username}
                          onChange={(e) => updateNewAdminField("username", e.target.value)}
                          placeholder="new-admin"
                          required
                        />
                      </label>
                      <label>
                        <span>Email</span>
                        <input
                          type="email"
                          value={newAdminForm.email}
                          onChange={(e) => updateNewAdminField("email", e.target.value)}
                          placeholder="admin@example.com"
                          required
                        />
                      </label>
                      <label>
                        <span>Password</span>
                        <input
                          type="password"
                          value={newAdminForm.password}
                          onChange={(e) => updateNewAdminField("password", e.target.value)}
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />
                      </label>
                      <button type="submit" disabled={isCreatingAdmin || !isAccountVerified}>
                        <Icon icon="plus" />
                        <span>{isCreatingAdmin ? "Adding..." : "Add Admin"}</span>
                      </button>
                    </form>

                    {adminCreateMessage ? <p className="admin_profile_message">{adminCreateMessage}</p> : null}

                    <div className="admin_admin_list">
                      <div className="admin_admin_list_head">
                        <span>Current admins</span>
                        <strong>{isLoadingAdmins ? "Loading..." : adminUsers.length}</strong>
                      </div>
                      {adminUsers.map((admin) => (
                        <article className="admin_admin_item" key={admin.id}>
                          <div className="admin_admin_avatar">
                            {admin.username?.charAt(0)?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <strong>{admin.username}</strong>
                            <span>{admin.email}</span>
                          </div>
                          {admin.id === user?.id ? <small>You</small> : null}
                        </article>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
