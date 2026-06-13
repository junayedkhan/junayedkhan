import React from "react";
import Comment from "./Comment";
import { ImageWithLoader } from "../ImageWithLoader";
import Icon from '../Icon'

const BlogDetails = ({ data }) => {
    const slug = data?.slug || "";
    const shareUrl = slug ? `${window.location.origin}/blogs/${slug}` : `${window.location.origin}/blogs`;
    const shareText = `${data.title} - ${shareUrl}`;
    const articleMeta = [data.category, data.meta, data.readTime].filter(Boolean);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: data.title,
                    text: data.excerpt,
                    url: shareUrl
                });
                return;
            }

            await navigator.clipboard.writeText(shareText);
        } catch {
            await navigator.clipboard?.writeText(shareText);
        }
    };

    const renderInlineDetails = (text, keyPrefix) => {
        const parts = [];
        const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let lastIndex = 0;
        let match;

        while ((match = imagePattern.exec(text)) !== null) {
            const beforeText = text.slice(lastIndex, match.index);

            if (beforeText.trim()) {
                parts.push(
                    <p className="blog_detail_text" key={`${keyPrefix}-text-${parts.length}`}>
                        {beforeText}
                    </p>
                );
            }

            parts.push(
                <figure className="blog_content_image blog_content_image--inline" key={`${keyPrefix}-image-${parts.length}`}>
                    <ImageWithLoader src={match[2]} alt={match[1] || data.title || "blog content"} />
                    {match[1] ? <figcaption>{match[1]}</figcaption> : null}
                </figure>
            );

            lastIndex = imagePattern.lastIndex;
        }

        const afterText = text.slice(lastIndex);
        if (afterText.trim()) {
            parts.push(
                <p className="blog_detail_text" key={`${keyPrefix}-text-${parts.length}`}>
                    {afterText}
                </p>
            );
        }

        return parts.length ? parts : null;
    };

    const renderBlock = (block, index) => {
        if (block.type === "quote") {
            return (
                <div className="quote_box" key={`${block.type}-${index}`}>
                    <div className="icon">
                        <Icon icon="quote" />
                    </div>
                    <p>{block.text}</p>
                </div>
            );
        }

        if (block.type === "image") {
            return (
                <figure className="blog_content_image" key={`${block.type}-${index}`}>
                    <ImageWithLoader src={block.url} alt={block.caption || data.title || "blog content"} />
                    {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                </figure>
            );
        }

        if (block.type === "video") {
            return (
                <figure className="blog_content_video" key={`${block.type}-${index}`}>
                    <video src={block.url} controls playsInline />
                    {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                </figure>
            );
        }

        if (block.type === "link") {
            return (
                <a className="blog_content_link" href={block.url} target="_blank" rel="noreferrer" key={`${block.type}-${index}`}>
                    <Icon icon="link" />
                    <span>{block.text}</span>
                </a>
            );
        }

        return (
            <div className={index === 0 ? "blog_detail_text_group bigger" : "blog_detail_text_group"} key={`${block.type}-${index}`}>
                {renderInlineDetails(block.text, `${block.type}-${index}`)}
            </div>
        );
    };

    return (
        <article className="blog_details blog_details--fullpage pb-20 pt-24">
            <div className="main_content">
                <div className="mx-auto max-w-6xl px-4">
                    <header className="blog_details_hero mb-10">
                        <div className="details mx-auto mb-8 max-w-3xl text-center">
                            <div className="blog_details_meta mb-4 flex flex-wrap justify-center gap-2">
                                {articleMeta.map((item) => (
                                    <span className="rounded-full bg-brass/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brass" key={item}>{item}</span>
                                ))}
                            </div>
                            <h1 className="title text-4xl font-black leading-tight text-ink md:text-6xl">{data.title}</h1>
                            {data.excerpt ? <p className="blog_details_excerpt mt-5 text-lg leading-8 text-slate-600">{data.excerpt}</p> : null}
                        </div>
                        <div className="thumbnail overflow-hidden rounded-[2rem] bg-vellum p-3 shadow-classic ring-1 ring-white/80">
                            <div className="inner overflow-hidden rounded-[1.5rem]">
                                <ImageWithLoader src={data.img} alt={data.title || "blog"} />
                            </div>
                        </div>
                    </header>
                    <section className="blog_article_body grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <aside className="blog_article_sidebar sticky top-24 h-fit rounded-3xl bg-vellum/80 p-5 shadow-soft ring-1 ring-white/80" aria-label="Article information">
                            <div className="border-b border-ink/10 pb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Category</span>
                                <strong className="mt-1 block text-sm text-ink">{data.category}</strong>
                            </div>
                            <div className="border-b border-ink/10 py-3">
                                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Published</span>
                                <strong className="mt-1 block text-sm text-ink">{data.meta}</strong>
                            </div>
                            <div className="border-b border-ink/10 py-3">
                                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Read time</span>
                                <strong className="mt-1 block text-sm text-ink">{data.readTime}</strong>
                            </div>
                            <div className="blog_article_sidebar_share mt-4 grid grid-cols-[1fr_repeat(3,38px)] items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Share</span>
                                <button className="grid h-10 w-10 place-items-center rounded-full bg-ink text-vellum" type="button" onClick={handleShare} aria-label="Share blog">
                                    <Icon icon="share" />
                                </button>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="grid h-10 w-10 place-items-center rounded-full bg-ink text-vellum"
                                    aria-label="Share on Facebook"
                                >
                                    <Icon icon="facebook" />
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="grid h-10 w-10 place-items-center rounded-full bg-ink text-vellum"
                                    aria-label="Share on Twitter"
                                >
                                    <Icon icon="twitter" />
                                </a>
                            </div>
                        </aside>
                        <div className="blog_article_main min-w-0">
                            <div className="blog_article_body_header mb-5 border-b border-ink/10 pb-4">
                                <span className="rounded-full bg-personal/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-personal">Details</span>
                            </div>
                            <div className="text_content rounded-3xl bg-vellum/80 p-6 shadow-soft ring-1 ring-white/80">
                                <div className="description space-y-5 text-base leading-8 text-slate-700">
                                    {(data.blocks || []).map(renderBlock)}
                                </div>
                            </div>
                        </div>
                    </section>
                    <Comment blogId={data.id} />
                </div>
            </div>
        </article>
    );
};

export default BlogDetails;
