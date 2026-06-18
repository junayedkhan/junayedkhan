import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { authHeaders } from "../utils/api";
import Icon from '../component/Icon'

const MAX_POST_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_POST_VIDEO_SIZE = 5 * 1024 * 1024;
const MAX_POST_PAYLOAD_SIZE = 14 * 1024 * 1024;
const ADMIN_ACTIVE_SECTION_KEY = "admin-active-section";
const MESSAGE_TIMEOUT_MS = 5000;

const createSlug = (title) => (
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "new-post"
);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

const shortenMediaName = (value) => {
  const words = String(value || "media")
    .replace(/[\[\]{}()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const shortWords = words.slice(0, 4).join(" ");
  const label = shortWords.length > 34 ? `${shortWords.slice(0, 34).trim()}...` : shortWords;
  const needsDots = words.length > 4 || shortWords.length > 34;

  return `${label || "media"}${needsDots && !label.endsWith("...") ? "..." : ""}`;
};

const addMediaMarkerIds = (items, existingItems = []) => {
  const usedLabels = new Set(existingItems.map((item) => item.id));

  return items.map((item) => {
    const baseLabel = shortenMediaName(item.caption);
    let markerLabel = baseLabel;
    let suffix = 2;

    while (usedLabels.has(markerLabel)) {
      markerLabel = `${baseLabel} ${suffix}`;
      suffix += 1;
    }

    usedLabels.add(markerLabel);
    return { ...item, id: markerLabel };
  });
};

const parseTextBlocks = (value) => {
  const blocks = [];
  const chunks = String(value || "")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  chunks.forEach((chunk) => {
    if (chunk.startsWith(">")) {
      blocks.push({
        type: "quote",
        text: chunk.replace(/^>\s?/gm, "").trim(),
        url: "",
        caption: "",
      });
      return;
    }

    let lastIndex = 0;
    let match;
    linkPattern.lastIndex = 0;

    while ((match = linkPattern.exec(chunk)) !== null) {
      const before = chunk.slice(lastIndex, match.index).trim();
      if (before) blocks.push({ type: "paragraph", text: before, url: "", caption: "" });
      blocks.push({ type: "link", text: match[1].trim(), url: match[2].trim(), caption: "" });
      lastIndex = linkPattern.lastIndex;
    }

    const rest = chunk.slice(lastIndex).trim();
    if (rest) blocks.push({ type: "paragraph", text: rest, url: "", caption: "" });
  });

  return blocks;
};

const getPostSummary = (blocks) => {
  const paragraph = blocks.find((block) => block.type === "paragraph" && block.text)?.text;
  const quote = blocks.find((block) => block.type === "quote" && block.text)?.text;
  const link = blocks.find((block) => block.type === "link" && block.text)?.text;
  const caption = blocks.find((block) => (block.type === "image" || block.type === "video") && block.caption)?.caption;

  return String(paragraph || quote || link || caption || "").slice(0, 180);
};

export default function AdminAddPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingBlog = location.state?.blog;
  const editorRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    category: "Travel Guide",
    excerpt: "",
    coverImage: "",
    content: "",
    readTime: "5 min read",
    publishedAt: new Date().toISOString().slice(0, 10),
    status: "draft",
  });
  const [contentMedia, setContentMedia] = useState([]);
  const [draggedMediaId, setDraggedMediaId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSaving, setIsSaving] = useState(false);
  const [savingAction, setSavingAction] = useState("");

  const slug = useMemo(() => createSlug(form.title), [form.title]);
  const wordCount = useMemo(() => form.content.trim().split(/\s+/).filter(Boolean).length, [form.content]);
  const isEditing = Boolean(editingBlog?.id);
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const clearErrorMessage = () => {
    if (messageType === "error") setMessage("");
  };

  useEffect(() => {
    if (!message) return undefined;

    const messageTimer = setTimeout(() => {
      setMessage("");
    }, MESSAGE_TIMEOUT_MS);

    return () => clearTimeout(messageTimer);
  }, [message]);

  useEffect(() => {
    if (!editingBlog?.id) return;

    const mediaItems = [];
    const content = (editingBlog.blocks || []).map((block, index) => {
      if (block.type === "image" || block.type === "video") {
        const id = shortenMediaName(block.caption || `${block.type} ${index + 1}`);
        mediaItems.push({
          id,
          src: block.url || "",
          type: block.type,
          caption: block.caption || "",
        });
        return `[[media:${id}]]`;
      }

      if (block.type === "quote") return `> ${block.text || ""}`;
      if (block.type === "link") return `[${block.text || "Link"}](${block.url || "https://example.com"})`;
      return block.text || "";
    }).filter(Boolean).join("\n\n");

    setForm({
      title: editingBlog.title || "",
      category: editingBlog.category || "Travel Guide",
      excerpt: editingBlog.excerpt || "",
      coverImage: editingBlog.coverImage || editingBlog.img || "",
      content,
      readTime: editingBlog.readTime || "5 min read",
      publishedAt: editingBlog.publishedAt ? new Date(editingBlog.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: editingBlog.isPublished === false ? "draft" : "published",
    });
    setContentMedia(mediaItems.filter((media) => media.src));
    showMessage("Editing selected post.");
  }, [editingBlog]);

  const readImage = (file, onReady) => {
    setMessage("");

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("Upload a JPG, PNG, or WebP image.", "error");
      return;
    }

    if (file.size > MAX_POST_IMAGE_SIZE) {
      showMessage("Image must be under 3 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onReady(String(reader.result || ""));
    reader.onerror = () => showMessage("Unable to read image file.", "error");
    reader.readAsDataURL(file);
  };

  const readMedia = (file, onReady) => {
    setMessage("");

    if (!file) return;

    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm", "video/ogg"].includes(file.type);

    if (!isImage && !isVideo) {
      setMessage("Upload a JPG, PNG, WebP, MP4, WebM, or OGG file.");
      return;
    }

    if (isImage && file.size > MAX_POST_IMAGE_SIZE) {
      setMessage("Image must be under 3 MB.");
      return;
    }

    if (isVideo && file.size > MAX_POST_VIDEO_SIZE) {
      setMessage("Video must be under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onReady({ src: String(reader.result || ""), type: isVideo ? "video" : "image" });
    reader.onerror = () => setMessage("Unable to read media file.");
    reader.readAsDataURL(file);
  };

  const uploadFeaturedImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    readImage(file, (image) => {
      clearErrorMessage();
      setForm((current) => ({ ...current, coverImage: image }));
    });
  };

  const insertAtCursor = (value) => {
    clearErrorMessage();
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? form.content.length;
    const end = editor?.selectionEnd ?? form.content.length;
    const nextContent = `${form.content.slice(0, start)}${value}${form.content.slice(end)}`;

    setForm((current) => ({ ...current, content: nextContent }));

    requestAnimationFrame(() => {
      editor?.focus();
      editor?.setSelectionRange(start + value.length, start + value.length);
    });
  };

  const insertMediaMarkers = (mediaItems) => {
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? form.content.length;
    const end = editor?.selectionEnd ?? form.content.length;
    const before = form.content.slice(0, start).replace(/\s+$/g, "");
    const after = form.content.slice(end).replace(/^\s+/g, "");
    const markers = mediaItems.map((media) => `[[media:${media.id}]]`).join("\n");
    const nextContent = `${before}${before ? "\n" : ""}${markers}${after ? "\n" : ""}${after}`;
    const cursorPosition = `${before}${before ? "\n" : ""}${markers}`.length;

    setForm((current) => ({ ...current, content: nextContent }));

    requestAnimationFrame(() => {
      editor?.focus();
      editor?.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const readMediaFile = (file, index) => new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm", "video/ogg"].includes(file.type);

    if (!isImage && !isVideo) {
      reject(new Error("Upload a JPG, PNG, WebP, MP4, WebM, or OGG file."));
      return;
    }

    if (isImage && file.size > MAX_POST_IMAGE_SIZE) {
      reject(new Error("Image must be under 3 MB."));
      return;
    }

    if (isVideo && file.size > MAX_POST_VIDEO_SIZE) {
      reject(new Error("Video must be under 5 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({
      src: String(reader.result || ""),
      type: isVideo ? "video" : "image",
      caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
    });
    reader.onerror = () => reject(new Error("Unable to read media file."));
    reader.readAsDataURL(file);
  });

  const uploadInlineMedia = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    try {
      const results = await Promise.allSettled(files.map((file, index) => readMediaFile(file, index)));
      const mediaItems = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      if (!mediaItems.length) {
        showMessage(results.find((result) => result.status === "rejected")?.reason?.message || "Unable to upload selected media.", "error");
        return;
      }

      const mediaItemsWithLabels = addMediaMarkerIds(mediaItems, contentMedia);
      const failedCount = results.filter((result) => result.status === "rejected").length;

      setContentMedia((current) => [...current, ...mediaItemsWithLabels]);
      insertMediaMarkers(mediaItemsWithLabels);
      showMessage(
        failedCount
          ? `${mediaItemsWithLabels.length} media added. ${failedCount} file${failedCount > 1 ? "s" : ""} skipped.`
          : `${mediaItemsWithLabels.length} media item${mediaItemsWithLabels.length > 1 ? "s" : ""} added.`,
        failedCount ? "error" : "success"
      );
    } catch (error) {
      showMessage(error.message || "Unable to upload selected media.", "error");
    }
  };

  const removeInlineMedia = (mediaId) => {
    setContentMedia((current) => current.filter((media) => media.id !== mediaId));
    setForm((current) => ({
      ...current,
      content: current.content
        .replace(new RegExp(`\\n*\\[\\[media:${escapeRegExp(mediaId)}\\]\\]\\n*`, "g"), "\n")
        .replace(/\n{3,}/g, "\n\n"),
    }));
  };

  const updateInlineMediaCaption = (mediaId, caption) => {
    setContentMedia((current) => current.map((media) => (
      media.id === mediaId ? { ...media, caption } : media
    )));
  };

  const syncMediaMarkerOrder = (nextMedia) => {
    setForm((current) => {
      let markerIndex = 0;
      const content = current.content.replace(/\[\[media:([^\]]+)\]\]/g, () => {
        const media = nextMedia[markerIndex];
        markerIndex += 1;
        return media ? `[[media:${media.id}]]` : "";
      });
      return { ...current, content };
    });
  };

  const moveInlineMedia = (fromId, toId) => {
    if (!fromId || fromId === toId) return;

    setContentMedia((current) => {
      const fromIndex = current.findIndex((media) => media.id === fromId);
      const toIndex = current.findIndex((media) => media.id === toId);
      if (fromIndex < 0 || toIndex < 0) return current;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      syncMediaMarkerOrder(next);
      return next;
    });
  };

  const buildBlocks = () => {
    const blocks = [];
    const markerPattern = /\[\[(?:image|media):([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = markerPattern.exec(form.content)) !== null) {
      const text = form.content.slice(lastIndex, match.index).trim();
      if (text) blocks.push(...parseTextBlocks(text));

      const media = contentMedia.find((item) => item.id === match[1]);
      if (media) blocks.push({ type: media.type, text: "", url: media.src, caption: media.caption });

      lastIndex = markerPattern.lastIndex;
    }

    const rest = form.content.slice(lastIndex).trim();
    if (rest) blocks.push(...parseTextBlocks(rest));

    return blocks;
  };

  const getSaveErrorMessage = (error) => {
    if (error.response?.status === 413) {
      return "Upload is too large. Use smaller images/videos or fewer media files.";
    }

    if (error.response?.status === 401) {
      return "Admin session expired. Please login again.";
    }

    if (error.code === "ECONNABORTED") {
      return "Upload took too long. Try smaller media files.";
    }

    if (error.message === "Network Error") {
      return "Could not reach the backend server. Make sure the server is running.";
    }

    return error.response?.data?.message || "Unable to save post.";
  };

  const savePost = async (status) => {
    setMessage("");
    if (isSaving) return;
    const shouldPublish = status === "published";

    if (!form.title.trim()) {
      showMessage("Post title is required.", "error");
      return;
    }

    if (shouldPublish && !form.coverImage) {
      showMessage("Featured image is required.", "error");
      return;
    }

    const blocks = buildBlocks();
    if (shouldPublish && !blocks.length) {
      showMessage("Post content is required.", "error");
      return;
    }

      const payload = {
      title: form.title.trim(),
      category: form.category,
      excerpt: form.excerpt.trim() || getPostSummary(blocks),
      coverImage: form.coverImage,
      readTime: form.readTime.trim() || `${Math.max(Math.ceil(wordCount / 180), 1)} min read`,
      publishedAt: form.publishedAt || new Date().toISOString().slice(0, 10),
      isPublished: shouldPublish,
      blocks,
    };

    if (JSON.stringify(payload).length > MAX_POST_PAYLOAD_SIZE) {
      showMessage("Post media is too large. Remove a video/image or use smaller files.", "error");
      return;
    }

    setIsSaving(true);
    setSavingAction(status);

    try {
      const requestConfig = { headers: authHeaders(), timeout: 60000 };
      const res = isEditing
        ? await api.put(`/blogs/admin/${editingBlog.id}`, payload, requestConfig)
        : await api.post("/blogs/admin", payload, requestConfig);

      setForm((current) => ({ ...current, status }));
      showMessage(res.data.message || (status === "published" ? "Post published." : "Draft saved."));
      localStorage.setItem(ADMIN_ACTIVE_SECTION_KEY, "blogs");
      navigate("/admin");
    } catch (error) {
      showMessage(getSaveErrorMessage(error), "error");
    } finally {
      setIsSaving(false);
      setSavingAction("");
    }
  };

  return (
    <main className="add_post_page">
      <section className="add_post_shell">
        <header className="add_post_header">
          <p className="admin_auth_kicker">Posts</p>
          <h1>{isEditing ? "Edit Post" : "Add New Post"}</h1>
        </header>

        {message ? (
          <div className={`add_post_notice ${messageType}`} role="status">
            <Icon icon={messageType === "error" ? "alert" : "check-circle"} />
            <span>{message}</span>
          </div>
        ) : null}

        <div className="add_post_layout">
          <section className="add_post_editor">
            <input
              className="add_post_title"
              value={form.title}
              onChange={(event) => {
                clearErrorMessage();
                setForm((current) => ({ ...current, title: event.target.value }));
              }}
              placeholder="Enter title here"
            />

            <div className="add_post_permalink">
              <span>Permalink:</span>
              <strong>/blogs/{slug}</strong>
            </div>

            <label className="add_post_excerpt">
              <span>Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => {
                  clearErrorMessage();
                  setForm((current) => ({ ...current, excerpt: event.target.value }));
                }}
                placeholder="Short summary for blog cards"
                rows={3}
              />
            </label>

            <div className="add_post_toolbar">
              <label className="add_post_media_btn">
                <Icon icon="media" />
                Add Media
                <input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/ogg" multiple onChange={uploadInlineMedia} />
              </label>
              <select
                value={form.category}
                onChange={(event) => {
                  clearErrorMessage();
                  setForm((current) => ({ ...current, category: event.target.value }));
                }}
              >
                <option>Travel Guide</option>
                <option>Photography</option>
                <option>City Walk</option>
                <option>Nature</option>
                <option>Personal</option>
              </select>
              <button type="button" onClick={() => insertAtCursor("> Quote text")}>
                <Icon icon="quote" />
              </button>
              <button type="button" onClick={() => insertAtCursor("[link text](https://example.com)")}>
                <Icon icon="link" />
              </button>
            </div>

            <textarea
              ref={editorRef}
              className="add_post_content"
              value={form.content}
              onChange={(event) => {
                clearErrorMessage();
                setForm((current) => ({ ...current, content: event.target.value }));
              }}
              placeholder="Write your post content here..."
            />

            {contentMedia.length ? (
              <div className="add_post_inline_media">
                {contentMedia.map((media) => (
                  <figure
                    key={media.id}
                    className={draggedMediaId === media.id ? "is_dragging" : ""}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      moveInlineMedia(draggedMediaId, media.id);
                      setDraggedMediaId("");
                    }}
                    onDragEnd={() => setDraggedMediaId("")}
                  >
                    <button
                      type="button"
                      className="add_post_media_remove"
                      onClick={() => removeInlineMedia(media.id)}
                      aria-label="Remove media"
                    >
                      <Icon icon="close" />
                    </button>
                    <button
                      type="button"
                      className="add_post_media_drag"
                      draggable
                      onDragStart={() => setDraggedMediaId(media.id)}
                      aria-label="Move media"
                    >
                      <Icon icon="drag" />
                    </button>
                    {media.type === "video" ? (
                      <video src={media.src} controls muted playsInline />
                    ) : (
                      <img src={media.src} alt={media.caption || "inline media"} />
                    )}
                    <label className="add_post_media_caption">
                      <span>Caption</span>
                      <input
                        value={media.caption}
                        onChange={(event) => {
                          clearErrorMessage();
                          updateInlineMediaCaption(media.id, event.target.value);
                        }}
                        placeholder="Write image caption"
                      />
                    </label>
                  </figure>
                ))}
              </div>
            ) : null}

            <footer className="add_post_editor_footer">
              <span>Word count: {wordCount}</span>
              <span>{message || "Draft not saved yet."}</span>
            </footer>
          </section>

          <aside className="add_post_side">
            <section className="add_post_panel">
              <header>Publish</header>
              <div className="add_post_panel_body">
                <div className="add_post_status">
                  <span>Status</span>
                  <strong>{form.status === "published" ? "Published" : "Draft"}</strong>
                </div>
                <label>
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => {
                      clearErrorMessage();
                      setForm((current) => ({ ...current, status: event.target.value }));
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
              </div>
              <footer>
                <button
                  type="button"
                  className={savingAction === "draft" ? "is_saving" : ""}
                  onClick={() => savePost("draft")}
                  disabled={isSaving}
                >
                  {savingAction === "draft" ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  className={savingAction === "published" ? "is_saving" : ""}
                  onClick={() => savePost("published")}
                  disabled={isSaving}
                >
                  {savingAction === "published" ? (isEditing ? "Updating..." : "Publishing...") : isEditing ? "Update" : "Publish"}
                </button>
              </footer>
            </section>

            <section className="add_post_panel">
              <header>Post Settings</header>
              <div className="add_post_panel_body">
                <label>
                  <span>Category</span>
                  <input
                    value={form.category}
                    onChange={(event) => {
                      clearErrorMessage();
                      setForm((current) => ({ ...current, category: event.target.value }));
                    }}
                    placeholder="Travel Guide"
                  />
                </label>
                <label>
                  <span>Read time</span>
                  <input
                    value={form.readTime}
                    onChange={(event) => {
                      clearErrorMessage();
                      setForm((current) => ({ ...current, readTime: event.target.value }));
                    }}
                    placeholder="5 min read"
                  />
                </label>
                <label>
                  <span>Publish date</span>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(event) => {
                      clearErrorMessage();
                      setForm((current) => ({ ...current, publishedAt: event.target.value }));
                    }}
                  />
                </label>
              </div>
            </section>

            <section className="add_post_panel">
              <header>Featured Image</header>
              <div
                className={form.coverImage ? "add_post_featured has_image" : "add_post_featured"}
                style={form.coverImage ? { backgroundImage: `url(${form.coverImage})` } : undefined}
              >
                {!form.coverImage ? <span>No image selected</span> : null}
              </div>
              <label className="add_post_featured_btn">
                <Icon icon="upload" />
                {form.coverImage ? "Change image" : "Upload image"}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadFeaturedImage} />
              </label>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
