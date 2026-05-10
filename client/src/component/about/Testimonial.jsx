import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

import img_01 from "../../assets/image/testimonial-01.png";
import img_02 from "../../assets/image/testimonial-02.png";
import img_03 from "../../assets/image/testimonial-03.png";
import img_04 from "../../assets/image/testimonial-04.png";

const testimonialContent = [
    {
        img: img_01,
        alt: "testmonial_image",
        subtitle: "rainbow-themes",
        name: "nevine acotanza",
        designation: "chief operating officer",
        title: "android app development",
        date: "vai Upwork - Mar 4, 2015 - Aug 30, 2021",
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer 
        took a galley of type and scrambled it to make a type specimen book`
    },
    {
        img: img_02,
        alt: "testmonial_image",
        subtitle: "bound - trolola",
        name: "jone duone doe",
        designation: "operating officer",
        title: "web App Development",
        date: "Upwork - Mar 4, 2016 - Aug 30, 2021",
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer 
        took a galley of type and scrambled it to make a type specimen book`
    },
    {
        img: img_03,
        alt: "testmonial_image",
        subtitle: "Glassfisom",
        name: "Nevine Dhawan",
        designation: "CEO Of Officer",
        title: "Android App Design",
        date: "Fiver - Mar 4, 2015 - Aug 30, 2021",
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took 
        a galley of type and scrambled it to make a type specimen book`
    },
    {
        img: img_04,
        alt: "testmonial_image",
        subtitle: "NCD - Design",
        name: "Mevine Thoda",
        designation: "Marketing Officer",
        title: "CEO - Marketing",
        date: "Thoda Department - Mar 4, 2018 - Aug 30, 2021",
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a 
        galley of type and scrambled it to make a type specimen book`
    }
]

const SampleNextArrow = (props) => {
    const { onClick } = props;
    return (
    <div className="slick_next" onClick={onClick}>
        <i className="fas fa-arrow-right"></i>
    </div>
    );
}
  
const SamplePrevArrow = (props) => {
    const { onClick } = props;
    return (
    <div className="slick_prev" onClick={onClick}>
        <i className="fas fa-arrow-left"></i>
    </div>
    );
}

const Testimonial = () => {

    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 2,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
        ],
    };


    return (
        <>
        <Slider {...settings} className="testimonial">
            {testimonialContent.map((val, index) => {
                return(
                <div className="inner" key={index}>
                    <div className="row">
                        <div className="col-12">
                            <div className="card_description">
                                <div className="title_area">
                                    <h4 className="title">{val.title}</h4>
                                </div>
                                <div className="seperator"></div>
                                <p className="description">{val.description}</p>
                            </div>
                        </div>
                        {/* == description area start == */}
                        <div className="col-12">
                            <div className="card_info">
                                <div className="card_img">
                                    <i></i>
                                    <div className="img" style={{backgroundImage: `url(${val.img})`}}></div>
                                    {/* <img src={val.img} alt={val.alt} className="img" /> */}
                                </div>
                                <div className="card_content">
                                    {/* <span className="subtitle">{val.subtitle}</span> */}
                                    <h3 className="name">{val.name}</h3>
                                    <span className="designation">{val.designation}</span>
                                </div>
                            </div>
                        </div>
                        {/* == info area end == */}
                    </div>
                </div>
                )
            })}
        </Slider>
        {/* == single testimonial area end == */}
        </>
    )
}

export default Testimonial;


