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
        <span className={`image_loader relative block h-full w-full overflow-hidden ${loaded ? "loaded" : "is-loading"} ${wrapperClassName}`}>
            {!loaded ? <span className="image_loader_skeleton absolute inset-0"></span> : null}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`block h-full w-full object-cover transition duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
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
            className={`background_image_loader relative block h-full w-full overflow-hidden bg-cover bg-center ${loaded ? "loaded" : "is-loading"} ${className}`}
            style={loaded ? { backgroundImage: `url(${src})` } : undefined}
        >
            {!loaded ? <span className="image_loader_skeleton absolute inset-0"></span> : null}
            {children}
        </div>
    );
};
