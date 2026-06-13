import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BlogDetails from "./BlogDetails";
import { ImageWithLoader } from "../ImageWithLoader";
import api from "../../utils/api";
import Icon from '../Icon'

const BLOGS_PER_PAGE = 6;
const BLOG_CACHE_KEY = "site-blog-list";

const readBlogCache = () => {
    try {
        const cached = JSON.parse(localStorage.getItem(BLOG_CACHE_KEY));
        return Array.isArray(cached?.blogs) ? cached.blogs : [];
    } catch {
        return [];
    }
};

const writeBlogCache = (blogs) => {
    try {
        localStorage.setItem(BLOG_CACHE_KEY, JSON.stringify({ blogs, savedAt: Date.now() }));
    } catch {
        // Cache is optional.
    }
};

const Blogs = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [visibleCount, setVisibleCount] = useState(BLOGS_PER_PAGE);
    const [blogs, setBlogs] = useState(() => readBlogCache());
    const [isLoadingBlogs, setIsLoadingBlogs] = useState(() => !readBlogCache().length);

    const visibleBlogs = blogs.slice(0, visibleCount);
    const hasMoreBlogs = visibleCount < blogs.length;
    const activeSlug = location.pathname.startsWith("/blogs/") ? location.pathname.replace("/blogs/", "").replace(/\/$/, "") : "";

    const activeBlog = activeSlug
        ? blogs.find((blog) => blog.slug === activeSlug)
        : null;

    useEffect(() => {
        let active = true;

        if (!blogs.length) setIsLoadingBlogs(true);

        api.get("/blogs")
            .then((res) => {
                if (!active) return;
                const nextBlogs = res.data.blogs || [];
                setBlogs(nextBlogs);
                writeBlogCache(nextBlogs);
            })
            .catch(() => {
                if (active && !blogs.length) setBlogs([]);
            })
            .finally(() => {
                if (active) setIsLoadingBlogs(false);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!activeSlug) {
            return;
        }
        if (!isLoadingBlogs && !activeBlog) {
            navigate("/blogs", { replace: true });
        }
    }, [activeSlug, activeBlog, isLoadingBlogs, navigate]);

    useEffect(() => {
        if (activeSlug && activeBlog) {
            window.scrollTo(0, 0);
        }
    }, [activeSlug, activeBlog]);

    const openArticle = (article) => {
        navigate(`/blogs/${article.slug}`);
    };

    const handleLoadMore = () => {
        setVisibleCount((current) => Math.min(current + BLOGS_PER_PAGE, blogs.length));
    };

    if (activeSlug && activeBlog) {
        return (
            <div className="blog_details_page">
                <BlogDetails data={activeBlog} />
            </div>
        );
    }

    return (
        <section className="blogs min-h-screen pb-20">
            <div className="title_section relative flex min-h-32 items-center justify-center">
                <span className="title_bg absolute text-6xl font-black uppercase text-ink/5 md:text-8xl">journal</span>
                <h1 className="title">
                    <span className="relative text-3xl font-black uppercase text-ink md:text-5xl">travel <span className="text-personal">blogs</span></span>
                </h1>
            </div>
            <div className="main_content">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {isLoadingBlogs ? (
                            Array.from({ length: BLOGS_PER_PAGE }).map((_, index) => (
                                <div key={`blog-skeleton-${index}`}>
                                    <article className="blog_skeleton_card" aria-hidden="true">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </article>
                                </div>
                            ))
                        ) : null}
                        {visibleBlogs.map((val) => (
                            <div key={val.id}>
                                <article className="card blog_card h-full overflow-hidden rounded-[1.5rem] bg-vellum/80 p-3 shadow-soft ring-1 ring-white/80 transition duration-300 hover:-translate-y-1 hover:shadow-classic">
                                    <div className="inner h-full">
                                        <button
                                            type="button"
                                            className="card_thumbnail blog_thumbnail overflow-hidden rounded-[1.25rem]"
                                            onClick={() => openArticle(val)}
                                            aria-label={`Read ${val.title}`}
                                        >
                                            <ImageWithLoader src={val.img} alt={val.title} />
                                        </button>
                                        <div className="card_content flex flex-1 flex-col p-4">
                                            <div className="category_info mb-3 flex items-center justify-between gap-3">
                                                <p className="category_list rounded-full bg-brass/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brass">{val.category}</p>
                                                <p className="meta text-xs font-bold text-slate-500">{val.readTime}</p>
                                            </div>
                                            <h4 className="title cursor-pointer text-xl font-black leading-snug text-ink hover:text-personal" onClick={() => openArticle(val)}>
                                                {val.title}
                                            </h4>
                                            <p className="blog_excerpt mt-3 text-sm leading-7 text-slate-600">{val.excerpt}</p>
                                            <div className="blog_footer mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                                                <span>{val.meta}</span>
                                                <button type="button" className="read_more_btn rounded-full bg-ink px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-vellum shadow-button" onClick={() => openArticle(val)}>
                                                    Read Article <Icon icon="arrow-right" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                        {!isLoadingBlogs && !blogs.length ? (
                            <div className="col-span-full">
                                <div className="blog_empty_state">
                                    <Icon icon="pen" />
                                    <strong>No blogs published yet</strong>
                                    <span>New posts from the admin panel will appear here.</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="blog_actions">
                        {!isLoadingBlogs && hasMoreBlogs ? (
                            <button type="button" className="blog_load_more rounded-full bg-ink px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-vellum shadow-button" onClick={handleLoadMore}>
                                Load More
                            </button>
                        ) : !isLoadingBlogs && blogs.length ? (
                            <p className="blog_end">End</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Blogs;
