import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const COMMENTS_PER_PAGE = 3;
const COMMENT_STORAGE_KEY = "blog-comments";

const defaultComments = [
    { id: "1", name: "Sabbir Ahmed", message: "Helpful article. The planning tips feel very practical.", date: "11 May 2026", liked: false, likes: 12, replies: [] },
    { id: "2", name: "Nusrat Jahan", message: "I liked the simple checklist style. Easy to follow.", date: "11 May 2026", liked: false, likes: 8, replies: [] },
    { id: "3", name: "Tanvir Hasan", message: "The photo advice is useful for short trips.", date: "11 May 2026", liked: false, likes: 6, replies: [] },
    { id: "4", name: "Mim Akter", message: "Nice writing. Please add more budget travel guides.", date: "11 May 2026", liked: false, likes: 10, replies: [] },
    { id: "5", name: "Rahim Khan", message: "This made trip planning feel less stressful.", date: "11 May 2026", liked: false, likes: 4, replies: [] },
    { id: "6", name: "Farhana Islam", message: "Loved the calm and clear explanation.", date: "11 May 2026", liked: false, likes: 9, replies: [] },
    { id: "7", name: "Arif Hossain", message: "The packing part helped me rethink my own list.", date: "11 May 2026", liked: false, likes: 5, replies: [] }
];

const Comment = ({ blogId }) => {

    const [successMessage, setSuccessMessage] = useState("")
    const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE)
    const [replyingTo, setReplyingTo] = useState("")
    const [replyText, setReplyText] = useState("")
    const [commentsByBlog, setCommentsByBlog] = useState(() => {
        try {
            const storedComments = localStorage.getItem(COMMENT_STORAGE_KEY);
            return storedComments ? JSON.parse(storedComments) : {};
        } catch {
            return {};
        }
    })
    const { register, handleSubmit, formState: { errors }, reset } = useForm()

    const blogComments = (commentsByBlog[blogId] ?? defaultComments).map((comment) => ({
        liked: false,
        likes: 0,
        replies: [],
        ...comment
    }));
    const visibleComments = blogComments.slice(0, visibleCount);
    const hasMoreComments = visibleCount < blogComments.length;

    const saveComments = (comments) => {
        const nextCommentsByBlog = {
            ...commentsByBlog,
            [blogId]: comments
        };

        setCommentsByBlog(nextCommentsByBlog);
        localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(nextCommentsByBlog));
    };

    const onSubmit = (data) => {
        const newComment = {
            id: `${Date.now()}`,
            name: data.name,
            message: data.message,
            liked: false,
            likes: 0,
            replies: [],
            date: new Date().toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
        };
        saveComments([newComment, ...blogComments]);
        setVisibleCount(COMMENTS_PER_PAGE);
        reset()
        setSuccessMessage("Thanks! Your comment has been submitted.")
    }

    const handleCommentLike = (commentId) => {
        saveComments(blogComments.map((comment) => {
            if (comment.id !== commentId) {
                return comment;
            }

            return {
                ...comment,
                liked: !comment.liked,
                likes: comment.likes + (comment.liked ? -1 : 1)
            };
        }));
    };

    const handleReplySubmit = (event, commentId) => {
        event.preventDefault();

        if (!replyText.trim()) {
            return;
        }

        const newReply = {
            id: `${Date.now()}`,
            name: "You",
            message: replyText.trim(),
            date: "Just now",
            liked: false,
            likes: 0
        };

        saveComments(blogComments.map((comment) => {
            if (comment.id !== commentId) {
                return comment;
            }

            return {
                ...comment,
                replies: [...comment.replies, newReply]
            };
        }));
        setReplyText("");
        setReplyingTo("");
    };

    const handleReplyLike = (commentId, replyId) => {
        saveComments(blogComments.map((comment) => {
            if (comment.id !== commentId) {
                return comment;
            }

            return {
                ...comment,
                replies: comment.replies.map((reply) => {
                    if (reply.id !== replyId) {
                        return reply;
                    }

                    return {
                        ...reply,
                        liked: !reply.liked,
                        likes: reply.likes + (reply.liked ? -1 : 1)
                    };
                })
            };
        }));
    };

    return (
        <>
        <div className="comment">
            <div className="inner">
                <div className="comment_list_area">
                    <h3 className="title">comments</h3>
                    <div className="comment_list">
                        {visibleComments.map((comment) => (
                            <article className="comment_item" key={comment.id}>
                                <div className="comment_avatar">{comment.name.charAt(0)}</div>
                                <div className="comment_body">
                                    <div className="comment_bubble">
                                        <div className="comment_meta">
                                            <h4>{comment.name}</h4>
                                            <span>{comment.date}</span>
                                        </div>
                                        <p>{comment.message}</p>
                                    </div>
                                    <div className="comment_actions">
                                        <button
                                            type="button"
                                            className={comment.liked ? "active" : ""}
                                            onClick={() => handleCommentLike(comment.id)}
                                        >
                                            Like
                                        </button>
                                        <button type="button" onClick={() => setReplyingTo(comment.id)}>
                                            Reply
                                        </button>
                                        <span>{comment.likes} likes</span>
                                        <span>{comment.replies.length} replies</span>
                                    </div>
                                    {comment.replies.length > 0 ? (
                                        <div className="comment_replies">
                                            {comment.replies.map((reply) => (
                                                <article className="comment_reply" key={reply.id}>
                                                    <div className="comment_avatar small">{reply.name.charAt(0)}</div>
                                                    <div className="comment_body">
                                                        <div className="comment_bubble">
                                                            <div className="comment_meta">
                                                                <h4>{reply.name}</h4>
                                                                <span>{reply.date}</span>
                                                            </div>
                                                            <p>{reply.message}</p>
                                                        </div>
                                                        <div className="comment_actions">
                                                            <button
                                                                type="button"
                                                                className={reply.liked ? "active" : ""}
                                                                onClick={() => handleReplyLike(comment.id, reply.id)}
                                                            >
                                                                Like
                                                            </button>
                                                            <span>{reply.likes} likes</span>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    ) : null}
                                    {replyingTo === comment.id ? (
                                        <form className="comment_reply_form" onSubmit={(event) => handleReplySubmit(event, comment.id)}>
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={(event) => setReplyText(event.target.value)}
                                                placeholder={`Reply to ${comment.name}`}
                                            />
                                            <button type="submit">Reply</button>
                                        </form>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                    {hasMoreComments ? (
                        <button type="button" className="comment_load_more" onClick={() => setVisibleCount((current) => current + COMMENTS_PER_PAGE)}>
                            Load More Comments
                        </button>
                    ) : null}
                </div>
                <h3 className="title">leave a reply</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            {/* == name == */}
                            <div className="form_group">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="Name"
                                    {...register("name", { required: "Name is required." })}
                                />
                                {errors.name?.message && <p className="errors">{errors.name.message}</p>}
                            </div>
                            {/* == email == */}
                            <div className="form_group">
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    {...register("email",
                                    { required: "Email is required.",
                                    pattern: {value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"} })}
                                />
                                {errors.email?.message && <p className="errors">{errors.email.message}</p>}
                            </div>
                            {/* == phone number == */}
                            <div className="form_group">
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    placeholder="Phone(optional)"
                                    {...register("phone",
                                    { required: false,
                                    pattern: {value: /^[0-9\b]+$/,
                                    message: "Invalid phone number"} })}
                                />
                                {errors.phone?.message && <p className="errors">{errors.phone.message}</p>}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">        
                            {/* == comment == */}
                            <div className="form_group">
                                <textarea
                                    placeholder="Comment"
                                    {...register("message", { required: "Message is required." })}
                                ></textarea>
                                {errors.message?.message && <p className="errors">{errors.message.message}</p>}
                            </div>
                        </div>
                        {/* == button */}
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="form_group_btn">
                                <button type="submit">submit now</button>
                                {successMessage && <p className="success_message">{successMessage}</p>}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {/* == from area end == */}
        </div>            
        </>
    )
}

export default Comment;
