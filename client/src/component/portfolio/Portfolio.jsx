import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { ImageWithLoader } from '../ImageWithLoader';
import img01 from "../../assets/image/portfolio-01.jpg";
import img02 from "../../assets/image/portfolio-02.jpg";
import img03 from "../../assets/image/portfolio-03.jpg";
import img04 from "../../assets/image/portfolio-04.jpg";
import img05 from "../../assets/image/portfolio-05.jpg";
import img06 from "../../assets/image/portfolio-06.jpg";
import img07 from "../../assets/image/blog-02.jpg";
import img08 from "../../assets/image/blog-03.jpg";

const galleryImages = [
    img01,
    img02,
    img03,
    img04,
    img05,
    img06,
    img07,
    img08
];

const galleryAlts = [
    "portfolio project preview one",
    "portfolio project preview two",
    "portfolio project preview three",
    "portfolio project preview four",
    "portfolio project preview five",
    "portfolio project preview six",
    "travel journal preview seven",
    "travel journal preview eight"
];

const defaultGalleryContent = Array.from({ length: 40 }, (_, index) => ({
    id: `${index + 1}`,
    img: galleryImages[index % galleryImages.length],
    alt: galleryAlts[index % galleryAlts.length],
    likes: 20 + ((index + 1) * 3),
    location: ["Coastal light", "Old street", "Quiet mountain", "City corner"][index % 4],
    mood: ["Soft morning", "Warm evening", "Slow walk", "Open sky"][index % 4]
}));

const ITEMS_PER_PAGE = 8;
const LIKE_STORAGE_KEY = "gallery-likes";

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

const Portfolio = () => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [openModel, setopenModel] = useState(false);
    const [data, setData] = useState({});
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
    const [savedLikes, setSavedLikes] = useState(() => {
        try {
            const storedLikes = localStorage.getItem(LIKE_STORAGE_KEY);
            return storedLikes ? JSON.parse(storedLikes) : {};
        } catch {
            return {};
        }
    });
    const [adminGalleryItems, setAdminGalleryItems] = useState(() => {
        return [];
    });
    const [isGalleryLoading, setIsGalleryLoading] = useState(true);

    const galleryContent = [...adminGalleryItems, ...defaultGalleryContent];
    const visibleGallery = galleryContent.slice(0, visibleCount);
    const hasMoreItems = visibleCount < galleryContent.length;

    const handleLoadMore = () => {
        setVisibleCount((current) => Math.min(current + ITEMS_PER_PAGE, galleryContent.length));
    };

    const openGalleryImage = (item) => {
        setData(item);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setopenModel(true);
    };

    const closeGalleryImage = () => {
        setopenModel(false);
        setIsDragging(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    useEffect(() => {
        if (!openModel) return undefined;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [openModel]);

    useEffect(() => {
        let active = true;
        setIsGalleryLoading(true);

        requestWithFallback(
            () => api.get("/site/gallery"),
            () => api.get("/gallery")
        )
            .then((res) => {
                if (active) setAdminGalleryItems(res.data.images || []);
            })
            .catch(() => {
                if (active) setAdminGalleryItems([]);
            })
            .finally(() => {
                if (active) setIsGalleryLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const updateZoom = (nextZoom) => {
        const clampedZoom = Math.min(Math.max(Number(nextZoom), 1), 100);
        setZoom(clampedZoom);
        if (clampedZoom === 1) {
            setPan({ x: 0, y: 0 });
        }
    };

    const handlePreviewPointerDown = (event) => {
        if (zoom <= 1) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setIsDragging(true);
        setDragStart({
            x: event.clientX,
            y: event.clientY,
            panX: pan.x,
            panY: pan.y
        });
    };

    const handlePreviewPointerMove = (event) => {
        if (!isDragging) return;
        setPan({
            x: dragStart.panX + event.clientX - dragStart.x,
            y: dragStart.panY + event.clientY - dragStart.y
        });
    };

    const stopPreviewDrag = () => {
        setIsDragging(false);
    };

    const handlePreviewWheel = (event) => {
        event.preventDefault();
        updateZoom(zoom + (event.deltaY < 0 ? 0.5 : -0.5));
    };

    const handleLike = async (event, item) => {
        event.stopPropagation();

        const wasLiked = Boolean(savedLikes[item.id]?.liked);
        const nextLiked = !wasLiked;
        const originalCount = savedLikes[item.id]?.count ?? item.likes;

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

        if (item.source !== "Uploaded") {
            return;
        }

        try {
            const res = await requestWithFallback(
                () => api.patch(`/site/gallery/${item.id}/like`, { liked: nextLiked }),
                () => api.patch(`/gallery/${item.id}/like`, { liked: nextLiked })
            );
            const updatedImage = res.data.image;
            setAdminGalleryItems((current) => current.map((galleryItem) => (
                galleryItem.id === updatedImage.id ? updatedImage : galleryItem
            )));
            setSavedLikes((current) => {
                const next = {
                    ...current,
                    [item.id]: {
                        liked: nextLiked,
                        count: updatedImage.likes
                    }
                };
                localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(next));
                return next;
            });
        } catch {
            setSavedLikes((current) => {
                const next = {
                    ...current,
                    [item.id]: {
                        liked: wasLiked,
                        count: originalCount
                    }
                };
                localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(next));
                return next;
            });
        }
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
                    <div className="gallery_intro">
                        <div>
                            <span className="gallery_eyebrow">visual diary</span>
                            <h2>Captured moments from roads, places, and quiet details.</h2>
                        </div>
                        <div className="gallery_meta">
                            <span>{galleryContent.length} photos</span>
                            <span>Travel memories</span>
                            <span>Personal frames</span>
                        </div>
                    </div>

                    <div className="row gallery_grid">
                        {isGalleryLoading ? (
                            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                                <div className="col-lg-6 col-xl-4 col-md-6 col-12 _mb_20_" key={`gallery-skeleton-${index}`}>
                                    <article className="gallery_skeleton_card" aria-hidden="true">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </article>
                                </div>
                            ))
                        ) : null}
                        {!isGalleryLoading && visibleGallery.map((item, index) => (
                            <div className="col-lg-6 col-xl-4 col-md-6 col-12 _mb_20_" key={item.id}>
                                <article className={`card gallery_card gallery_card_${(index % 3) + 1}`}>
                                    <div className="inner">
                                        <button
                                            type="button"
                                            className="card_thumbnail gallery_thumbnail"
                                            onClick={() => openGalleryImage(item)}
                                            aria-label={`Open ${item.alt}`}
                                        >
                                            <ImageWithLoader src={item.img} alt={item.alt} />
                                            <span className="gallery_card_caption">
                                                <span>{item.location}</span>
                                                <strong>{item.mood}</strong>
                                            </span>
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
                        {!isGalleryLoading && hasMoreItems ? (
                            <button type="button" className="gallery_load_more" onClick={handleLoadMore}>
                                Load More Memories
                            </button>
                        ) : !isGalleryLoading ? (
                            <p className="gallery_end">All memories loaded</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
        {openModel ? createPortal((
        <section className="react_model">
            <div onClick={closeGalleryImage} className="react_model_overlay"></div>
            <div className="react_model_inner">
                <article className="gallery_details">
                    <button type="button" onClick={closeGalleryImage} className="react_model_close" aria-label="Close image preview">
                        <i className="fas fa-times" aria-hidden="true"></i>
                    </button>
                    <div className="main_content">
                        <div className="gallery_zoom_controls">
                            <button type="button" onClick={() => updateZoom(zoom - 0.25)} aria-label="Zoom out">
                                <i className="fas fa-search-minus" aria-hidden="true"></i>
                            </button>
                            <button type="button" onClick={() => updateZoom(1)} aria-label="Reset zoom">
                                <i className="fas fa-compress-arrows-alt" aria-hidden="true"></i>
                            </button>
                            <span className="gallery_zoom_value">{zoom.toFixed(2)}x / 100x</span>
                            <label className="gallery_zoom_slider">
                                <span>Zoom</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    step="0.25"
                                    value={zoom}
                                    onChange={(event) => updateZoom(event.target.value)}
                                />
                            </label>
                            <button type="button" onClick={() => updateZoom(zoom + 1)} aria-label="Zoom in">
                                <i className="fas fa-search-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div className="thumbnail">
                            <div
                                className={`inner ${zoom > 1 ? "zoomed" : ""} ${isDragging ? "dragging" : ""}`}
                                onPointerDown={handlePreviewPointerDown}
                                onPointerMove={handlePreviewPointerMove}
                                onPointerUp={stopPreviewDrag}
                                onPointerCancel={stopPreviewDrag}
                                onPointerLeave={stopPreviewDrag}
                                onWheel={handlePreviewWheel}
                            >
                                <ImageWithLoader
                                    src={data.img}
                                    alt={data.alt}
                                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                                />
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
        ), document.body) : null}
        </>
	);
}

export default Portfolio;
