import React from 'react'
import { Typewriter } from 'react-simple-typewriter'
import Social from '../Social'
import { BackgroundImageWithLoader } from '../ImageWithLoader'

const heroContent = {
    name: "Junayed",
    designation: [' Developer', ' Designer'],
    description: `I build clean, responsive web experiences with thoughtful motion,
                  clear interfaces, and careful attention to every interaction.`,
    image: "assets/image/home.png"
}

const Hero = () => {

    return (
        <section className="hero">
            <div className="main_content">
                <div className="container">
                    <div className="row about_content">
                        <div className="col-lg-7 col-md-12 col-12 order-2 order-lg-1">
                            <div className="text_content">
                                <span className="subtitle">WELCOME TO MY WORLD</span>
                                <h1 className="title">
                                    Hi, I'm <span className="text">{heroContent.name}</span> <br />
                                </h1>
                                <p className="designation">
                                    I'm a Web
                                    <Typewriter
                                        words={heroContent.designation}
                                        loop={true} cursor cursorStyle='_'
                                        typeSpeed={100}
                                        deleteSpeed={50}
                                        delaySpeed={2000}
                                    />
                                </p>
                                {/* == type write end == */}
                                {/* == title area end == */}
                                <p className="description">{heroContent.description}</p>
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
                                        <BackgroundImageWithLoader className="hero_gallery_bg" src={heroContent.image} />
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
