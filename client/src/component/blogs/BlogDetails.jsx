import React from 'react'
import Comment from './Comment'
import { ImageWithLoader } from '../ImageWithLoader'

const BlogDetails = ({ setopenModel, data }) => {
    const shareUrl = `${window.location.origin}/blogs`;
    const shareText = `${data.title} - ${shareUrl}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: data.title,
                text: data.excerpt,
                url: shareUrl
            });
            return;
        }

        await navigator.clipboard.writeText(shareText);
    };

    return (
        <>
        <article className="blog_details">
            <button onClick={() => setopenModel(false)} className="react_model_close"><i className="fas fa-times"></i></button>
            {/* == button area end */}
            <div className="main_content">
                <div className="thumbnail">
                    <div className="inner">
                        <ImageWithLoader src={data.img} alt={data.title || "blog"} />
                    </div>
                </div>
                {/* == image area end */}
                <div className="details">
                    <p className="meta">{data.meta}</p>
                    <h3 className="title">{data.title}</h3>
                </div>
                <div className="text_content">
                    <div className="description">
                        {/* == designation_01 == */}
                        <p className="bigger">{data.designation_01}</p>
                        {/* == description_01 == */}
                        <p>{data.description_01}</p>
                        {/* == description_02 == */}
                        <p>{data.description_02}</p>
                        <div className="quote_box">
                            <div className="icon">
                                <i className="fas fa-quote-left"></i>
                            </div>
                            {/* == designation_02 == */}
                            <p>{data.designation_02}</p>
                        </div>
                        {/* == designation_03 == */}
                        <p>{data.description_03}</p>
                        {/* == designation_04 == */}
                        <p>{data.description_04}</p>
                    </div>
                </div>
                {/* == text area end == */}
                <div className="blog_share">
                    <span>Share</span>
                    <button type="button" onClick={handleShare} aria-label="Share blog">
                        <i className="fas fa-share-alt"></i>
                    </button>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Share on Facebook"
                    >
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Share on Twitter"
                    >
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Share on LinkedIn"
                    >
                        <i className="fab fa-linkedin-in"></i>
                    </a>
                </div>
                <Comment blogId={data.id} />
                {/* == comment area end == */}
            </div>
        </article>
        {/* == blog details area end == */}
        </>
    )
}

export default BlogDetails
