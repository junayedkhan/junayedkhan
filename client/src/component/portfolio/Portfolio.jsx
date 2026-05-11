import React, { useState } from 'react';
import { ImageWithLoader } from '../ImageWithLoader';

const galleryImages = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80"
];

const galleryAlts = [
    "green mountain valley",
    "lake and mountain landscape",
    "forest path in nature",
    "calm lake at sunrise",
    "mountain ridge travel view",
    "field under dramatic sky",
    "waterfall and green hills",
    "wide mountain lake",
    "desert road landscape",
    "misty forest trees"
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
                    <button onClick={() => setopenModel(false)} className="react_model_close">
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="main_content">
                        <div className="gallery_zoom_controls">
                            <button type="button" onClick={() => setZoom((current) => Math.max(current - 0.25, 1))}>
                                <i className="fas fa-search-minus"></i>
                            </button>
                            <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom">
                                <i className="fas fa-compress-arrows-alt"></i>
                            </button>
                            <button type="button" onClick={() => setZoom((current) => Math.min(current + 1, 100))}>
                                <i className="fas fa-search-plus"></i>
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
