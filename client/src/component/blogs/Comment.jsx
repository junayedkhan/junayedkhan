import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import Icon from '../Icon'

const COMMENTS_PER_PAGE = 3;

const Comment = ({ blogId }) => {
    const [successMessage, setSuccessMessage] = useState("")
    const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE)
    const [comments, setComments] = useState([])
    const [isLoadingComments, setIsLoadingComments] = useState(true)
    const [activeReplyId, setActiveReplyId] = useState("")
    const [pendingLikes, setPendingLikes] = useState({})
    const [submittingReplyId, setSubmittingReplyId] = useState("")
    const [likedItems, setLikedItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("blog-comment-likes") || "{}")
        } catch {
            return {}
        }
    })
    const [replyForm, setReplyForm] = useState({ name: "", email: "", message: "" })
    const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm({ mode: "onChange", reValidateMode: "onChange" })
    const handleFormChange = (event) => {
        if (event.target?.name) clearErrors(event.target.name)
        if (successMessage) setSuccessMessage("")
    }

    useEffect(() => {
        if (!blogId) return undefined;

        let active = true;
        setIsLoadingComments(true);

        api.get(`/blogs/${blogId}/comments`)
            .then((res) => {
                if (active) setComments(res.data.comments || []);
            })
            .catch(() => {
                if (active) setComments([]);
            })
            .finally(() => {
                if (active) setIsLoadingComments(false);
            });

        return () => {
            active = false;
        };
    }, [blogId]);

    const visibleComments = comments.slice(0, visibleCount);
    const hasMoreComments = visibleCount < comments.length;

    const saveLikedItems = (nextLikes) => {
        setLikedItems(nextLikes)
        localStorage.setItem("blog-comment-likes", JSON.stringify(nextLikes))
    }

    const toggleCommentLike = async (commentId) => {
        const likeKey = `comment-${commentId}`
        if (pendingLikes[likeKey]) return;

        const wasLiked = Boolean(likedItems[likeKey])
        const nextLiked = !wasLiked
        const nextLikedItems = { ...likedItems, [likeKey]: nextLiked }
        setPendingLikes((current) => ({ ...current, [likeKey]: true }))
        saveLikedItems(nextLikedItems)
        setComments((current) => current.map((comment) => (
            comment.id === commentId
                ? { ...comment, likes: Math.max((comment.likes || 0) + (nextLiked ? 1 : -1), 0) }
                : comment
        )))

        try {
            const res = await api.post(`/blogs/comments/${commentId}/like`, { liked: nextLiked })
            const updatedLikes = res.data?.comment?.likes
            if (typeof updatedLikes === "number") {
                setComments((current) => current.map((comment) => (
                    comment.id === commentId ? { ...comment, likes: updatedLikes } : comment
                )))
            }
        } catch {
            saveLikedItems({ ...likedItems, [likeKey]: wasLiked })
            setComments((current) => current.map((comment) => (
                comment.id === commentId
                    ? { ...comment, likes: Math.max((comment.likes || 0) + (wasLiked ? 1 : -1), 0) }
                    : comment
            )))
            setSuccessMessage("Unable to update like right now.")
        } finally {
            setPendingLikes((current) => ({ ...current, [likeKey]: false }))
        }
    }

    const toggleReplyLike = async (commentId, replyId) => {
        const likeKey = `reply-${replyId}`
        if (pendingLikes[likeKey]) return;

        const wasLiked = Boolean(likedItems[likeKey])
        const nextLiked = !wasLiked
        const nextLikedItems = { ...likedItems, [likeKey]: nextLiked }
        setPendingLikes((current) => ({ ...current, [likeKey]: true }))
        saveLikedItems(nextLikedItems)
        setComments((current) => current.map((comment) => (
            comment.id === commentId
                ? {
                    ...comment,
                    replies: (comment.replies || []).map((reply) => (
                        reply.id === replyId
                            ? { ...reply, likes: Math.max((reply.likes || 0) + (nextLiked ? 1 : -1), 0) }
                            : reply
                    ))
                }
                : comment
        )))

        try {
            const res = await api.post(`/blogs/comments/${commentId}/replies/${replyId}/like`, { liked: nextLiked })
            const updatedReplies = res.data?.comment?.replies
            if (Array.isArray(updatedReplies)) {
                setComments((current) => current.map((comment) => (
                    comment.id === commentId ? { ...comment, replies: updatedReplies.filter((reply) => !reply.isHidden) } : comment
                )))
            }
        } catch {
            saveLikedItems({ ...likedItems, [likeKey]: wasLiked })
            setComments((current) => current.map((comment) => (
                comment.id === commentId
                    ? {
                        ...comment,
                        replies: (comment.replies || []).map((reply) => (
                            reply.id === replyId
                                ? { ...reply, likes: Math.max((reply.likes || 0) + (wasLiked ? 1 : -1), 0) }
                                : reply
                        ))
                    }
                    : comment
            )))
            setSuccessMessage("Unable to update like right now.")
        } finally {
            setPendingLikes((current) => ({ ...current, [likeKey]: false }))
        }
    }

    const submitReply = async (event, commentId) => {
        event.preventDefault()
        setSuccessMessage("")
        setSubmittingReplyId(commentId)

        try {
            const res = await api.post(`/blogs/comments/${commentId}/replies`, replyForm)
            if (!res.data?.reply) throw new Error("Reply response missing")
            setComments((current) => current.map((comment) => (
                comment.id === commentId
                    ? { ...comment, replies: [...(comment.replies || []), res.data.reply] }
                    : comment
            )))
            setReplyForm({ name: "", email: "", message: "" })
            setActiveReplyId("")
            setSuccessMessage("Reply submitted.")
        } catch (error) {
            setSuccessMessage(error.response?.data?.message || "Unable to submit reply right now.")
        } finally {
            setSubmittingReplyId("")
        }
    }

    const onSubmit = async (data) => {
        setSuccessMessage("");

        try {
            const res = await api.post(`/blogs/${blogId}/comments`, data);
            setComments((current) => [res.data.comment, ...current]);
            setVisibleCount(COMMENTS_PER_PAGE);
            reset();
            setSuccessMessage("Thanks! Your comment has been submitted.");
        } catch (error) {
            setSuccessMessage(error.response?.data?.message || "Unable to submit comment right now.");
        }
    }

    return (
        <div className="comment mt-10">
            <div className="inner">
                <div className="comment_layout grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="comment_panel comment_list_area rounded-3xl bg-vellum/80 p-6 shadow-soft ring-1 ring-white/80">
                        <div className="comment_panel_header mb-6">
                            <span className="comment_label text-xs font-extrabold uppercase tracking-[.18em] text-brass">Discussion</span>
                            <h3 className="title mt-2 text-2xl font-black text-ink">Comments</h3>
                            <p className="text-sm text-slate-500">{comments.length} thoughts from readers</p>
                        </div>
                        <div className="comment_list grid gap-4">
                            {isLoadingComments ? (
                                Array.from({ length: COMMENTS_PER_PAGE }).map((_, index) => (
                                    <article className="comment_item comment_item_skeleton" key={`comment-skeleton-${index}`} aria-hidden="true">
                                        <div className="comment_avatar"></div>
                                        <div className="comment_body">
                                            <div className="comment_bubble">
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : null}
                            {!isLoadingComments && visibleComments.map((comment, index) => (
                                <article className="comment_item flex gap-3" key={comment.id}>
                                    <div className="comment_avatar grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink font-black text-vellum">{comment.initials || comment.name.charAt(0)}</div>
                                    <div className="comment_body min-w-0 flex-1">
                                        <div className="comment_bubble rounded-3xl bg-white/75 p-5 ring-1 ring-ink/10">
                                            <span className="comment_number text-xs font-bold text-brass">#{index + 1}</span>
                                            <div className="comment_meta mt-2 flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-black text-ink">{comment.name}</h4>
                                                    <small className="text-xs text-slate-500">Reader comment</small>
                                                </div>
                                                <time className="text-xs font-bold text-slate-500" dateTime={comment.createdAt}>{comment.dateTime || comment.date}</time>
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-slate-700">{comment.message}</p>
                                            <div className="comment_actions mt-4 flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    className={`${likedItems[`comment-${comment.id}`] ? "active" : ""} rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-vellum`}
                                                    disabled={Boolean(pendingLikes[`comment-${comment.id}`])}
                                                    onClick={() => toggleCommentLike(comment.id)}
                                                >
                                                    <Icon icon="like" />
                                                    Like
                                                </button>
                                                <button className="rounded-full bg-personal/10 px-3 py-1.5 text-xs font-bold text-personal" type="button" onClick={() => setActiveReplyId((current) => current === comment.id ? "" : comment.id)}>
                                                    <Icon icon="reply" />
                                                    Reply
                                                </button>
                                                <span className="text-xs font-bold text-slate-500">{comment.likes || 0} likes</span>
                                                <span className="text-xs font-bold text-slate-500">{(comment.replies || []).length} replies</span>
                                            </div>
                                            {comment.replies?.length ? (
                                                <div className="comment_replies mt-4 grid gap-3">
                                                    {comment.replies.map((reply) => (
                                                        <article className="comment_reply flex gap-3" key={reply.id}>
                                                            <div className="comment_avatar small grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brass text-sm font-black text-vellum">{reply.initials || reply.name.charAt(0)}</div>
                                                            <div className="comment_reply_bubble flex-1 rounded-2xl bg-vellum p-4 ring-1 ring-ink/10">
                                                                <div className="comment_meta">
                                                                    <div>
                                                                        <h4>{reply.name}</h4>
                                                                        <small>Reply</small>
                                                                    </div>
                                                                    <time dateTime={reply.createdAt}>{reply.dateTime || reply.date}</time>
                                                                </div>
                                                                <p>{reply.message}</p>
                                                                <div className="comment_actions">
                                                                    <button
                                                                        type="button"
                                                                        className={likedItems[`reply-${reply.id}`] ? "active" : ""}
                                                                        disabled={Boolean(pendingLikes[`reply-${reply.id}`])}
                                                                        onClick={() => toggleReplyLike(comment.id, reply.id)}
                                                                    >
                                                                        <Icon icon="like" />
                                                                        Like
                                                                    </button>
                                                                    <span>{reply.likes || 0} likes</span>
                                                                </div>
                                                            </div>
                                                        </article>
                                                    ))}
                                                </div>
                                            ) : null}
                                            {activeReplyId === comment.id ? (
                                                <form className="comment_reply_form mt-4 grid gap-2 md:grid-cols-3" onSubmit={(event) => submitReply(event, comment.id)}>
                                                    <input className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2" value={replyForm.name} onChange={(event) => {
                                                        setSuccessMessage("")
                                                        setReplyForm((current) => ({ ...current, name: event.target.value }))
                                                    }} placeholder="Name" required />
                                                    <input className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2" value={replyForm.email} onChange={(event) => {
                                                        setSuccessMessage("")
                                                        setReplyForm((current) => ({ ...current, email: event.target.value }))
                                                    }} placeholder="Email" type="email" required />
                                                    <input className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2" value={replyForm.message} onChange={(event) => {
                                                        setSuccessMessage("")
                                                        setReplyForm((current) => ({ ...current, message: event.target.value }))
                                                    }} placeholder="Write a reply" required />
                                                    <button className="rounded-2xl bg-ink px-4 py-2 font-bold text-vellum" type="submit" disabled={submittingReplyId === comment.id}>
                                                        {submittingReplyId === comment.id ? "Sending..." : "Reply"}
                                                    </button>
                                                </form>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {!isLoadingComments && !comments.length ? (
                                <div className="comment_empty_state">
                                    <strong>No comments yet</strong>
                                    <span>Be the first reader to share a thought.</span>
                                </div>
                            ) : null}
                        </div>
                        {hasMoreComments ? (
                            <button type="button" className="comment_load_more mt-5 rounded-full bg-ink px-5 py-3 text-sm font-bold text-vellum" onClick={() => setVisibleCount((current) => current + COMMENTS_PER_PAGE)}>
                                Load More Comments
                            </button>
                        ) : null}
                    </div>
                    <div className="comment_panel comment_form_panel rounded-3xl bg-ink p-6 text-vellum shadow-classic">
                        <div className="comment_panel_header mb-5">
                            <span className="comment_label text-xs font-extrabold uppercase tracking-[.18em] text-brass">Join in</span>
                            <h3 className="title mt-2 text-2xl font-black">Leave a reply</h3>
                            <p className="text-sm text-vellum/70">Share a quick note, question, or feedback.</p>
                        </div>
                        <form onChange={handleFormChange} onSubmit={handleSubmit(onSubmit)}>
                            <div className="comment_form_grid grid gap-3">
                                <div>
                                    <div className="form_group">
                                        <input
                                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-vellum outline-none placeholder:text-vellum/50"
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder="Name"
                                            {...register("name", { required: "Name is required." })}
                                        />
                                        {errors.name?.message && <p className="errors">{errors.name.message}</p>}
                                    </div>
                                    <div className="form_group">
                                        <input
                                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-vellum outline-none placeholder:text-vellum/50"
                                            type="text"
                                            name="email"
                                            id="email"
                                            placeholder="Email"
                                            {...register("email", {
                                                required: "Email is required.",
                                                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                                            })}
                                        />
                                        {errors.email?.message && <p className="errors">{errors.email.message}</p>}
                                    </div>
                                    <div className="form_group">
                                        <input
                                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-vellum outline-none placeholder:text-vellum/50"
                                            type="text"
                                            name="phone"
                                            id="phone"
                                            placeholder="Phone(optional)"
                                            {...register("phone", {
                                                required: false,
                                                pattern: { value: /^[0-9\b]+$/, message: "Invalid phone number" }
                                            })}
                                        />
                                        {errors.phone?.message && <p className="errors">{errors.phone.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <div className="form_group">
                                        <textarea
                                            className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-vellum outline-none placeholder:text-vellum/50"
                                            placeholder="Comment"
                                            {...register("message", { required: "Message is required." })}
                                        ></textarea>
                                        {errors.message?.message && <p className="errors">{errors.message.message}</p>}
                                    </div>
                                </div>
                                <div className="comment_form_footer">
                                    <div className="form_group_btn">
                                        <button className="rounded-full bg-vellum px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-ink" type="submit">Submit now</button>
                                        {successMessage && <p className="success_message">{successMessage}</p>}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Comment;
