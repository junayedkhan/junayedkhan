import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Typewriter } from 'react-simple-typewriter'
import Social from '../Social'
import api from '../../utils/api'
import Icon from '../Icon'
import { ImageWithLoader } from '../ImageWithLoader'

const HERO_CACHE_KEY = "site-hero-content"

const readHeroCache = () => {
    try {
        const cached = JSON.parse(localStorage.getItem(HERO_CACHE_KEY))
        return cached?.content ? normalizeHeroContent(cached.content) : null
    } catch {
        return null
    }
}

const writeHeroCache = (content) => {
    try {
        localStorage.setItem(HERO_CACHE_KEY, JSON.stringify({ content, savedAt: Date.now() }))
    } catch {
        // Cache is optional. Rendering should keep working if storage is unavailable.
    }
}

const normalizeHeroContent = (content) => ({
    name: content?.name || "",
    designation: Array.isArray(content?.designation) && content.designation.length
        ? content.designation
        : [],
    description: content?.description || "",
    image: content?.image || ""
})

const Hero = () => {
    const [content, setContent] = useState(() => readHeroCache())
    const [isLoading, setIsLoading] = useState(() => !readHeroCache())
    const heroRoles = content?.designation || []
    const heroDescription = content?.description || "I create clean digital experiences, collect travel memories, and share the stories behind every frame."
    const heroImage = content?.image || "/assets/image/home.png"
    const heroName = content?.name || "Kalvin"

    useEffect(() => {
        let active = true
        if (!content) setIsLoading(true)

        api
            .get('/site/hero')
            .then((res) => {
                const nextContent = Object.prototype.hasOwnProperty.call(res.data || {}, "content")
                    ? res.data.content
                    : res.data
                if (active && nextContent) {
                    const normalizedContent = normalizeHeroContent(nextContent)
                    setContent(normalizedContent)
                    writeHeroCache(normalizedContent)
                }
            })
            .catch(() => {
                if (active && !content) setContent(null)
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    return (
        <section className="hero relative isolate min-h-screen overflow-hidden">
            <div className="main_content">
                <div className="mx-auto max-w-7xl">
                    <div className="about_content hero_minimal_content relative z-10">
                        <div className="hero_panel">
                            <div className="text_content">
                                {isLoading || !content ? (
                                    <div className="hero_content_skeleton" aria-hidden="true">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="hero_eyebrow inline-flex items-center justify-center rounded-full text-[11px] font-extrabold uppercase tracking-[.18em]">
                                            Portfolio / Travel / Journal
                                        </span>
                                        <h1 className="title max-w-4xl text-balance text-[2.65rem] font-black leading-[1.02] text-ink sm:text-[3.6rem] md:text-[4.25rem] lg:text-[5rem]">
                                            Hi! I'm <span className="text text-personal">{heroName}</span>.
                                        </h1>
                                        {heroRoles.length ? (
                                            <p className="designation text-lg font-bold text-ink sm:text-xl md:text-2xl">
                                                <Typewriter
                                                    words={heroRoles}
                                                    loop={true} cursor cursorStyle='_'
                                                    typeSpeed={100}
                                                    deleteSpeed={50}
                                                    delaySpeed={2000}
                                                />
                                            </p>
                                        ) : null}
                                        <p className="hero_intro max-w-2xl text-sm font-medium leading-7 text-vellum/85 sm:text-base">
                                            {heroDescription}
                                        </p>
                                        {/* == type write end == */}
                                        {/* == title area end == */}
                                    </>
                                )}
                                {/* == description area end == */}
                                <div className="hero_actions flex flex-wrap gap-3" aria-label="Primary actions">
                                    <Link className="hero_btn hero_btn_primary inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-[13px] font-extrabold uppercase tracking-wide text-vellum shadow-button transition duration-300 hover:-translate-y-1 hover:bg-personal hover:text-white" to="/gallery">
                                        <span>View Gallery</span>
                                        <Icon icon="arrow-right" />
                                    </Link>
                                    <Link className="hero_btn hero_btn_secondary inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 bg-white/70 px-6 text-[13px] font-extrabold uppercase tracking-wide text-ink shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-ink hover:text-vellum" to="/contact">
                                        <span>Contact Me</span>
                                    </Link>
                                </div>
                                <div className="hero_social_wrap">
                                    <Social />
                                </div>
                            </div>
                            <div className="hero_visual" aria-hidden={isLoading || !content ? "true" : undefined}>
                                {isLoading || !content ? (
                                    <div className="hero_image_skeleton"></div>
                                ) : (
                                    <figure className="hero_image_card">
                                        <ImageWithLoader
                                            src={heroImage}
                                            alt={`${heroName} portrait`}
                                            wrapperClassName="hero_image_loader"
                                        />
                                        <figcaption className="hero_visual_label">
                                            <span>Featured Story</span>
                                            <strong>{heroName}</strong>
                                        </figcaption>
                                    </figure>
                                )}
                            </div>
                            {/* == social area end == */}
                        </div>
                    </div>
                </div>
            </div>
            {/* == hero content area end == */}
        </section>
    )
}

export default Hero;
