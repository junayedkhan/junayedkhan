import React from 'react'
import { Typewriter } from 'react-simple-typewriter'
import Social from '../Social'

const heroContent = {
    name: "John Lee",
    designation: ['Developer', 'Designer'],
    description: `I use animation as a third dimension by which to simplify experiences
                  and kuiding thro each and every interaction. I’m not adding motion
                  just to spruce things up, but doing it in ways that.`,
    image: "assets/image/home.png"
}

const Hero = () => {

    return (
        <section className="hero" data-aos="fade-up">
            <div className="main_content">
                <div className="container">
                    <div className="row about_content">
                        <div className="col-lg-7 col-md-12 col-12 order-2 order-lg-1">
                            <div className="text_content">
                                <span className="subtitle">WELCOME TO MY WORLD</span>
                                <h1 className="title">
                                    Hi, I’m <span className="text">{heroContent.name}</span> <br />
                                    <span className="text">a </span>
                                    <Typewriter
                                        words={heroContent.designation}
                                        loop={true}
                                        cursor
                                        cursorStyle='_'
                                        typeSpeed={100}
                                        deleteSpeed={50}
                                        delaySpeed={2000}
                                    />
                                    {/* == type write end == */}
                                </h1>
                                {/* == title area end == */}
                                <p className="description">{heroContent.description}</p>
                                {/* == description area end == */}
                            </div>
                            <div className="row">
                                <Social />
                            </div>
                            {/* == social area end == */}
                        </div>
                        <div className="col-lg-5 col-md-12 col-12 order-1 order-lg-2 justify-content-center">
                            <div className="thumbnail">
                                <div className="inner" style={{backgroundImage: `url(${heroContent.image})`}}></div>
                            </div>
                            {/* == thumbnail area end == */}
                        </div>
                    </div>
                </div>
            </div>
            {/* == hero content area end == */}
        </section>
    )
}

export default Hero;
