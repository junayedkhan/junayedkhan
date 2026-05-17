import React, { useState } from 'react';
import { ImageWithLoader } from '../ImageWithLoader';
import img01 from "../../assets/image/portfolio-01.jpg";
import img02 from "../../assets/image/portfolio-02.jpg";
import img03 from "../../assets/image/portfolio-03.jpg";
import img04 from "../../assets/image/portfolio-04.jpg";
import img05 from "../../assets/image/portfolio-05.jpg";
import img06 from "../../assets/image/portfolio-06.jpg";

const galleryImages = [
    img01,
    img02,
    img03,
    img04,
    img05,
    img06
];

const galleryAlts = [
    "portfolio project preview one",
    "portfolio project preview two",
    "portfolio project preview three",
    "portfolio project preview four",
    "portfolio project preview five",
    "portfolio project preview six"
];

const galleryContent = Array.from({ length: 40 }, (_, index) => ({
    id: `${index + 1}`,
    img: galleryImages[index % galleryImages.length],
    alt: galleryAlts[index % galleryAlts.length],
    likes: 20 + ((index + 1) * 3)
}));

const ITEMS_PER_PAGE = 10;
const LIKE_STORAGE_KEY = "gallery-likes";

const Portfolio = () => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [openModel, setopenModel] = useState(false);
    const [data, setData] = useState({});
    const [zoom, setZoom] = useState(1);
    const [savedLikes, setSavedLikes] = useState(() => {
        try {
            const storedLikes = localStorage.getItem(LIKE_STORAGE_KEY);
            return storedLikes ? JSON.parse(storedLikes) : {};
        } catch {
            return {};
        }
    });

    const visibleGallery = galleryContent.slice(0, visibleCount);
    const hasMoreItems = visibleCount < galleryContent.length;

    const handleLoadMore = () => {
        setVisibleCount((current) => Math.min(current + ITEMS_PER_PAGE, galleryContent.length));
    };

    const openGalleryImage = (item) => {
        setData(item);
        setZoom(1);
        setopenModel(true);
    };

    const handleLike = (event, item) => {
        event.stopPropagation();

        setSavedLikes((current) => {
            const isLiked = current[item.id]?.liked;
            const next = {
                ...current,
                [item.id]: {
                    liked: !isLiked,
                    count: (current[item.id]?.count ?? item.likes) + (isLiked ? -1 : 1)
                }
            };

            localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const getLikeCount = (item) => savedLikes[item.id]?.count ?? item.likes;
    const isLiked = (item) => Boolean(savedLikes[item.id]?.liked);

	return (
        <>
        <section className="portfolio">
            <div className="title_section">
                <span className="title_bg">gallery</span>
                <h1 className="title" >my <span>gallery</span></h1>
            </div>
            <div className="main_content">
                <div className="container">
                    <div className="row">
                        {visibleGallery.map((item) => (
                            <div className="col-lg-6 col-xl-4 col-md-6 col-12 _mb_20_" key={item.id}>
                                <article className="card gallery_card">
                                    <div className="inner">
                                        <button
                                            type="button"
                                            className="card_thumbnail gallery_thumbnail"
                                            onClick={() => openGalleryImage(item)}
                                            aria-label={`Open ${item.alt}`}
                                        >
                                            <ImageWithLoader src={item.img} alt={item.alt} />
                                        </button>
                                        <button
                                            type="button"
                                            className={isLiked(item) ? "gallery_like active" : "gallery_like"}
                                            onClick={(event) => handleLike(event, item)}
                                            aria-label={isLiked(item) ? "Unlike image" : "Like image"}
                                        >
                                            <i className={isLiked(item) ? "fas fa-heart" : "far fa-heart"}></i>
                                            <span>{getLikeCount(item)}</span>
                                        </button>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>

                    <div className="gallery_actions">
                        {hasMoreItems ? (
                            <button type="button" className="gallery_load_more" onClick={handleLoadMore}>
                                Load More
                            </button>
                        ) : (
                            <p className="gallery_end">End</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
        <section className={openModel ? "react_model" : "d-none"}>
            {openModel ? <div onClick={() => setopenModel(false)} className="react_model overlay"></div> : null}
            <div className="react_model_inner">
                <article className="gallery_details">
                    <button type="button" onClick={() => setopenModel(false)} className="react_model_close" aria-label="Close image preview">
                        <i className="fas fa-times" aria-hidden="true"></i>
                    </button>
                    <div className="main_content">
                        <div className="gallery_zoom_controls">
                            <button type="button" onClick={() => setZoom((current) => Math.max(current - 0.25, 1))} aria-label="Zoom out">
                                <i className="fas fa-search-minus" aria-hidden="true"></i>
                            </button>
                            <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom">
                                <i className="fas fa-compress-arrows-alt" aria-hidden="true"></i>
                            </button>
                            <button type="button" onClick={() => setZoom((current) => Math.min(current + 1, 100))} aria-label="Zoom in">
                                <i className="fas fa-search-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div className="thumbnail">
                            <div className="inner">
                                <ImageWithLoader src={data.img} alt={data.alt} style={{ transform: `scale(${zoom})` }} />
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
        </>
	);
}

export default Portfolio;
