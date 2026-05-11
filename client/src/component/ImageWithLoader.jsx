import React, { useEffect, useState } from "react";

export const ImageWithLoader = ({ src, alt, className = "", wrapperClassName = "", style, ...props }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
    }, [src]);

    return (
        <span className={`image_loader ${loaded ? "loaded" : ""} ${wrapperClassName}`}>
            <span className="image_loader_skeleton"></span>
            <img
                src={src}
                alt={alt}
                className={className}
                style={style}
                loading="lazy"
                onLoad={() => setLoaded(true)}
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
        image.src = src;
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
