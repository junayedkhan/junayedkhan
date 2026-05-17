import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const isImageDecoded = (el) => el?.complete && el.naturalHeight > 0;

export const ImageWithLoader = ({ src, alt, className = "", wrapperClassName = "", style, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    const syncLoadedState = useCallback(() => {
        const el = imgRef.current;
        if (isImageDecoded(el)) {
            setLoaded(true);
            return;
        }
        if (el?.decode) {
            el.decode()
                .then(() => setLoaded(true))
                .catch(() => {});
        }
    }, []);

    useLayoutEffect(() => {
        setLoaded(false);
    }, [src]);

    useLayoutEffect(() => {
        syncLoadedState();
        const frame = requestAnimationFrame(() => syncLoadedState());
        return () => cancelAnimationFrame(frame);
    }, [src, syncLoadedState]);

    return (
        <span className={`image_loader ${loaded ? "loaded" : ""} ${wrapperClassName}`}>
            <span className="image_loader_skeleton"></span>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={className}
                style={style}
                loading="lazy"
                onLoad={syncLoadedState}
                onError={() => setLoaded(true)}
                {...props}
            />
        </span>
    );
};

export const BackgroundImageWithLoader = ({ src, className = "", children }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        const image = new Image();
        image.onload = () => setLoaded(true);
        image.onerror = () => setLoaded(true);
        image.src = src;
        if (image.complete && image.naturalHeight > 0) {
            setLoaded(true);
        }
    }, [src]);

    return (
        <div
            className={`background_image_loader ${loaded ? "loaded" : ""} ${className}`}
            style={loaded ? { backgroundImage: `url(${src})` } : undefined}
        >
            <span className="image_loader_skeleton"></span>
            {children}
        </div>
    );
};
