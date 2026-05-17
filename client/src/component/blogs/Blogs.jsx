import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BlogDetails from "./BlogDetails";
import { ImageWithLoader } from "../ImageWithLoader";
import { blogContent, createBlogSlug } from "./blogData";

const BLOGS_PER_PAGE = 6;

const Blogs = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [visibleCount, setVisibleCount] = useState(BLOGS_PER_PAGE);

    const visibleBlogs = blogContent.slice(0, visibleCount);
    const hasMoreBlogs = visibleCount < blogContent.length;
    const activeSlug = location.pathname.startsWith("/blogs/") ? location.pathname.replace("/blogs/", "").replace(/\/$/, "") : "";

    const activeBlog = activeSlug
        ? blogContent.find((blog) => createBlogSlug(blog.title) === activeSlug)
        : null;

    useEffect(() => {
        if (!activeSlug) {
            return;
        }
        if (!activeBlog) {
            navigate("/blogs", { replace: true });
        }
    }, [activeSlug, activeBlog, navigate]);

    useEffect(() => {
        if (activeSlug && activeBlog) {
            window.scrollTo(0, 0);
        }
    }, [activeSlug, activeBlog]);

    const openArticle = (article) => {
        navigate(`/blogs/${createBlogSlug(article.title)}`);
    };

    const handleLoadMore = () => {
        setVisibleCount((current) => Math.min(current + BLOGS_PER_PAGE, blogContent.length));
    };

    if (activeSlug && activeBlog) {
        return (
            <div className="blog_details_page">
                <BlogDetails data={activeBlog} />
            </div>
        );
    }

    return (
        <section className="blogs">
            <div className="title_section">
                <span className="title_bg">journal</span>
                <h1 className="title">
                    travel <span>blogs</span>
                </h1>
            </div>
            <div className="main_content">
                <div className="container">
                    <div className="row">
                        {visibleBlogs.map((val) => (
                            <div className="col-lg-6 col-xl-4 col-md-6 col-12 _mb_20_" key={val.id}>
                                <article className="card blog_card">
                                    <div className="inner">
                                        <button
                                            type="button"
                                            className="card_thumbnail blog_thumbnail"
                                            onClick={() => openArticle(val)}
                                            aria-label={`Read ${val.title}`}
                                        >
                                            <ImageWithLoader src={val.img} alt={val.title} />
                                        </button>
                                        <div className="card_content">
                                            <div className="category_info">
                                                <p className="category_list">{val.category}</p>
                                                <p className="meta">{val.readTime}</p>
                                            </div>
                                            <h4 className="title" onClick={() => openArticle(val)}>
                                                {val.title}
                                            </h4>
                                            <p className="blog_excerpt">{val.excerpt}</p>
                                            <div className="blog_footer">
                                                <span>{val.meta}</span>
                                                <button type="button" className="read_more_btn" onClick={() => openArticle(val)}>
                                                    Read Article <i className="fas fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                    <div className="blog_actions">
                        {hasMoreBlogs ? (
                            <button type="button" className="blog_load_more" onClick={handleLoadMore}>
                                Load More
                            </button>
                        ) : (
                            <p className="blog_end">End</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Blogs;
