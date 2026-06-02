import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Typewriter } from 'react-simple-typewriter'
import Social from '../Social'
import { BackgroundImageWithLoader } from '../ImageWithLoader'
import api from '../../utils/api'

const normalizeHeroContent = (content) => ({
    name: content?.name || "",
    designation: Array.isArray(content?.designation) && content.designation.length
        ? content.designation
        : [],
    description: content?.description || "",
    image: content?.image || ""
})

const Hero = () => {
    const [content, setContent] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const heroRoles = content?.designation || []
    const heroDescription = content?.description || ""

    useEffect(() => {
        let active = true
        setIsLoading(true)

        api
            .get('/site/hero')
            .then((res) => {
                const nextContent = Object.prototype.hasOwnProperty.call(res.data || {}, "content")
                    ? res.data.content
                    : res.data
                if (active && nextContent) {
                    setContent(normalizeHeroContent(nextContent))
                }
            })
            .catch(() => {
                if (active) setContent(null)
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    return (
        <section className="hero">
            <div className="hero_art hero_art_left" aria-hidden="true"></div>
            <div className="hero_art hero_art_right" aria-hidden="true"></div>
            <div className="main_content">
                <div className="container">
                    <div className="row about_content">
                        <div className="col-lg-7 col-md-12 col-12 order-2 order-lg-1">
                            <div className="text_content">
                                {isLoading || !content ? (
                                    <div className="hero_content_skeleton" aria-hidden="true">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="subtitle">Travel stories and personal moments</span>
                                        <h1 className="title">
                                            A soulful travel journal by <span className="text">{content?.name || "..."}</span>
                                        </h1>
                                        {heroRoles.length ? (
                                            <p className="designation">
                                                Personal
                                                <Typewriter
                                                    words={heroRoles.map((role) => ` ${role}`)}
                                                    loop={true} cursor cursorStyle='_'
                                                    typeSpeed={100}
                                                    deleteSpeed={50}
                                                    delaySpeed={2000}
                                                />
                                            </p>
                                        ) : null}
                                        {/* == type write end == */}
                                        {/* == title area end == */}
                                        {heroDescription ? <p className="description">{heroDescription}</p> : null}
                                    </>
                                )}
                                {/* == description area end == */}
                                <div className="hero_actions" aria-label="Primary actions">
                                    <Link className="hero_btn hero_btn_primary" to="/gallery">
                                        <span>View Gallery</span>
                                        <i className="fas fa-arrow-right" aria-hidden="true"></i>
                                    </Link>
                                    <Link className="hero_btn hero_btn_secondary" to="/contact">
                                        <span>Contact With Me</span>
                                    </Link>
                                </div>
                                <div className="hero_highlights" aria-label="Portfolio highlights">
                                    <span>Travel Stories</span>
                                    <span>Personal Notes</span>
                                    <span>Photo Memories</span>
                                </div>
                            </div>
                            <div className="row">
                                <Social />
                            </div>
                            {/* == social area end == */}
                        </div>
                        <div className="col-lg-5 col-md-12 col-12 order-1 order-lg-2 justify-content-center d-flex justify-content-lg-end justify-content-center">
                            <div className="hero_visual" aria-label="Profile photo">
                                <div className="hero_visual_label">
                                    <span>Featured</span>
                                    <strong>Portfolio</strong>
                                </div>
                                <article className="card gallery_card hero_gallery_card">
                                    <div className="inner">
                                        <div className="gallery_thumbnail hero_gallery_thumbnail">
                                            {content?.image ? (
                                                <BackgroundImageWithLoader className="hero_gallery_bg" src={content.image} />
                                            ) : (
                                                <span className="hero_image_skeleton" aria-hidden="true"></span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                                <div className="hero_stats" aria-label="Quick profile stats">
                                    <div>
                                        <strong>40+</strong>
                                        <span>Gallery pieces</span>
                                    </div>
                                    <div>
                                        <strong>6+</strong>
                                        <span>Travel notes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* == hero content area end == */}
        </section>
    )
}

export default Hero;
