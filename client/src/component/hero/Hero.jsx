import React, { useEffect, useState } from 'react'
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
    const [isHeroReady, setIsHeroReady] = useState(false)

    useEffect(() => {
        let active = true

        api
            .get('/site/hero')
            .then((res) => {
                const nextContent = res.data?.content || res.data
                if (active && nextContent) {
                    setContent(normalizeHeroContent(nextContent))
                }
            })
            .catch(() => {
                if (active) setContent(null)
            })
            .finally(() => {
                if (active) setIsHeroReady(true)
            })

        return () => {
            active = false
        }
    }, [])

    if (!isHeroReady || !content) {
        return (
            <section className="hero hero_loading">
                <div className="hero_loading_state">
                    <span className="hero_loading_mark">J</span>
                    <div className="hero_loading_lines">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="hero">
            <div className="main_content">
                <div className="container">
                    <div className="row about_content">
                        <div className="col-lg-7 col-md-12 col-12 order-2 order-lg-1">
                            <div className="text_content">
                                <span className="subtitle">WELCOME TO MY WORLD</span>
                                <h1 className="title">
                                    Hi, I'm <span className="text">{content.name}</span> <br />
                                </h1>
                                <p className="designation">
                                    I'm a Web
                                    <Typewriter
                                        words={content.designation.map((role) => ` ${role}`)}
                                        loop={true} cursor cursorStyle='_'
                                        typeSpeed={100}
                                        deleteSpeed={50}
                                        delaySpeed={2000}
                                    />
                                </p>
                                {/* == type write end == */}
                                {/* == title area end == */}
                                <p className="description">{content.description}</p>
                                {/* == description area end == */}
                            </div>
                            <div className="row">
                                <Social />
                            </div>
                            {/* == social area end == */}
                        </div>
                        <div className="col-lg-5 col-md-12 col-12 order-1 order-lg-2 justify-content-center d-flex justify-content-lg-end justify-content-center">
                            <article className="card gallery_card hero_gallery_card" aria-label="Profile photo">
                                <div className="inner">
                                    <div className="gallery_thumbnail hero_gallery_thumbnail">
                                        <BackgroundImageWithLoader className="hero_gallery_bg" src={content.image} />
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
            {/* == hero content area end == */}
        </section>
    )
}

export default Hero;
