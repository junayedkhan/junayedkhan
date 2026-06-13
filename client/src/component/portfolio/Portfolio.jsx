import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { ImageWithLoader } from '../ImageWithLoader';
import Icon from '../Icon'

const ITEMS_PER_PAGE = 8;
const LIKE_STORAGE_KEY = "gallery-likes";
const GALLERY_CACHE_KEY = "site-gallery-items";

const readGalleryCache = () => {
    try {
        const cached = JSON.parse(localStorage.getItem(GALLERY_CACHE_KEY));
        return Array.isArray(cached?.images) ? cached.images : [];
    } catch {
        return [];
    }
};

const writeGalleryCache = (images) => {
    try {
        localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify({ images, savedAt: Date.now() }));
    } catch {
        // Cache is optional. The live API still drives the final data.
    }
};

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
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
    const [pinchStart, setPinchStart] = useState(null);
    const [savedLikes, setSavedLikes] = useState(() => {
        try {
            const storedLikes = localStorage.getItem(LIKE_STORAGE_KEY);
            return storedLikes ? JSON.parse(storedLikes) : {};
        } catch {
            return {};
        }
    });
    const [adminGalleryItems, setAdminGalleryItems] = useState(() => readGalleryCache());
    const [isGalleryLoading, setIsGalleryLoading] = useState(() => !readGalleryCache().length);

    const galleryContent = adminGalleryItems;
    const visibleGallery = galleryContent.slice(0, visibleCount);
    const hasMoreItems = visibleCount < galleryContent.length;

    const handleLoadMore = () => {
        setVisibleCount((current) => Math.min(current + ITEMS_PER_PAGE, galleryContent.length));
    };

    const openGalleryImage = (item, index = 0) => {
        setData(item);
        setActiveImageIndex(index);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setopenModel(true);
    };

    const closeGalleryImage = () => {
        setopenModel(false);
        setIsDragging(false);
        setPinchStart(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const showGalleryImageAt = (nextIndex) => {
        if (!galleryContent.length) return;
        const normalizedIndex = (nextIndex + galleryContent.length) % galleryContent.length;
        setActiveImageIndex(normalizedIndex);
        setData(galleryContent[normalizedIndex]);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setIsDragging(false);
        setPinchStart(null);
    };

    const showPreviousImage = () => showGalleryImageAt(activeImageIndex - 1);
    const showNextImage = () => showGalleryImageAt(activeImageIndex + 1);

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
        if (!openModel) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") showPreviousImage();
            if (event.key === "ArrowRight") showNextImage();
            if (event.key === "Escape") closeGalleryImage();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [openModel, activeImageIndex, galleryContent]);

    useEffect(() => {
        let active = true;
        if (!adminGalleryItems.length) setIsGalleryLoading(true);

        requestWithFallback(
            () => api.get("/site/gallery"),
            () => api.get("/gallery")
        )
            .then((res) => {
                if (!active) return;
                const images = res.data.images || [];
                setAdminGalleryItems(images);
                writeGalleryCache(images);
            })
            .catch(() => {
                if (active && !adminGalleryItems.length) setAdminGalleryItems([]);
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

    const getTouchDistance = (touches) => {
        const [first, second] = touches;
        return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    };

    const getTouchCenter = (touches) => {
        const [first, second] = touches;
        return {
            x: (first.clientX + second.clientX) / 2,
            y: (first.clientY + second.clientY) / 2
        };
    };

    const handlePreviewTouchStart = (event) => {
        if (event.touches.length === 2) {
            event.preventDefault();
            setIsDragging(false);
            setPinchStart({
                distance: getTouchDistance(event.touches),
                zoom,
                center: getTouchCenter(event.touches),
                pan
            });
        }
    };

    const handlePreviewTouchMove = (event) => {
        if (event.touches.length !== 2 || !pinchStart) return;
        event.preventDefault();
        const nextDistance = getTouchDistance(event.touches);
        const nextCenter = getTouchCenter(event.touches);
        const nextZoom = Math.min(Math.max(pinchStart.zoom * (nextDistance / pinchStart.distance), 1), 100);
        setZoom(nextZoom);
        setPan({
            x: pinchStart.pan.x + nextCenter.x - pinchStart.center.x,
            y: pinchStart.pan.y + nextCenter.y - pinchStart.center.y
        });
    };

    const handlePreviewTouchEnd = () => {
        setPinchStart(null);
        setIsDragging(false);
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
        <section className="portfolio min-h-screen pb-20">
            <div className="title_section relative flex min-h-32 items-center justify-center">
                <span className="title_bg absolute text-6xl font-black uppercase text-ink/5 md:text-8xl">gallery</span>
                <h1 className="title relative text-3xl font-black uppercase text-ink md:text-5xl" >my <span className="text-personal">gallery</span></h1>
            </div>
            <div className="main_content">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="gallery_intro classic-frame mx-auto mb-8 max-w-5xl rounded-[1.75rem] border border-white/70 bg-vellum/70 p-8 text-center shadow-classic backdrop-blur">
                        <div>
                            <span className="gallery_eyebrow inline-flex rounded-full bg-brass/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-brass">visual diary</span>
                            <h2 className="mt-4 text-3xl font-black leading-tight text-ink md:text-4xl">Captured moments from roads, places, and quiet details.</h2>
                        </div>
                        <div className="gallery_meta mt-5 flex flex-wrap justify-center gap-2">
                            <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-ink/10">{galleryContent.length} photos</span>
                            <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-ink/10">Travel memories</span>
                            <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-ink/10">Personal frames</span>
                        </div>
                    </div>

                    <div className="gallery_grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {isGalleryLoading ? (
                            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                                <div key={`gallery-skeleton-${index}`}>
                                    <article className="gallery_skeleton_card" aria-hidden="true">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </article>
                                </div>
                            ))
                        ) : null}
                        {!isGalleryLoading && visibleGallery.map((item, index) => (
                            <div key={item.id}>
                                <article className={`card gallery_card gallery_card_${(index % 3) + 1} overflow-hidden rounded-[1.5rem] bg-vellum/80 p-2 shadow-soft ring-1 ring-white/80 transition duration-300 hover:-translate-y-1 hover:shadow-classic`}>
                                    <div className="inner relative">
                                        <button
                                            type="button"
                                            className="card_thumbnail gallery_thumbnail overflow-hidden rounded-[1.25rem]"
                                            onClick={() => openGalleryImage(item, index)}
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
                                            className={`${isLiked(item) ? "gallery_like active" : "gallery_like"} absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-vellum shadow-button`}
                                            onClick={(event) => handleLike(event, item)}
                                            aria-label={isLiked(item) ? "Unlike image" : "Like image"}
                                        >
                                            <Icon icon={isLiked(item) ? "heart" : "heart-outline"} />
                                            <span>{getLikeCount(item)}</span>
                                        </button>
                                    </div>
                                </article>
                            </div>
                        ))}
                        {!isGalleryLoading && !galleryContent.length ? (
                            <div className="col-span-full">
                                <div className="gallery_empty_state">
                                    <Icon icon="images" />
                                    <strong>No gallery images yet</strong>
                                    <span>Uploaded images from the admin panel will appear here.</span>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="gallery_actions">
                        {!isGalleryLoading && hasMoreItems ? (
                            <button type="button" className="gallery_load_more rounded-full bg-ink px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-vellum shadow-button transition hover:-translate-y-1" onClick={handleLoadMore}>
                                Load More Memories
                            </button>
                        ) : !isGalleryLoading && galleryContent.length ? (
                            <p className="gallery_end">
                                <Icon icon="check" />
                                <span>All memories loaded</span>
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
        {openModel ? createPortal((
        <section className="react_model fixed inset-0 z-[3000] grid place-items-center p-4">
            <div onClick={closeGalleryImage} className="react_model_overlay absolute inset-0 bg-ink/70 backdrop-blur-md"></div>
            <div className="react_model_inner gallery_preview_modal relative z-10 max-h-[90vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white p-4 shadow-soft">
                <article className="gallery_details">
                    <button type="button" onClick={closeGalleryImage} className="react_model_close absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-personal text-white shadow-button" aria-label="Close image preview">
                        <Icon icon="close" />
                    </button>
                    <div className="main_content">
                        <div className="thumbnail">
                            <div
                                className={`inner gallery_preview_stage flex min-h-[50vh] items-center justify-center overflow-auto rounded-2xl bg-ink ${zoom > 1 ? "zoomed" : ""} ${isDragging ? "dragging" : ""}`}
                                onPointerDown={handlePreviewPointerDown}
                                onPointerMove={handlePreviewPointerMove}
                                onPointerUp={stopPreviewDrag}
                                onPointerCancel={stopPreviewDrag}
                                onPointerLeave={stopPreviewDrag}
                                onWheel={handlePreviewWheel}
                                onTouchStart={handlePreviewTouchStart}
                                onTouchMove={handlePreviewTouchMove}
                                onTouchEnd={handlePreviewTouchEnd}
                                onTouchCancel={handlePreviewTouchEnd}
                            >
                                <ImageWithLoader
                                    src={data.img}
                                    alt={data.alt}
                                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                                />
                            </div>
                        </div>
                        <div className="gallery_preview_thumbs" aria-label="Gallery thumbnails">
                            {galleryContent.map((item, index) => (
                                <button
                                    type="button"
                                    className={index === activeImageIndex ? "active" : ""}
                                    onClick={() => showGalleryImageAt(index)}
                                    aria-label={`Open image ${index + 1}`}
                                    key={item.id || `${item.img}-${index}`}
                                >
                                    <img src={item.img} alt={item.alt || `Gallery thumbnail ${index + 1}`} loading="lazy" />
                                </button>
                            ))}
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
