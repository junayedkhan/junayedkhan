import React from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

import brand_01 from "../../assets/image/1.png";
import brand_02 from "../../assets/image/2.png";
import brand_03 from "../../assets/image/3.png";
import brand_04 from "../../assets/image/4.png";
import brand_05 from "../../assets/image/5.png";

const clientscontent = [
    {img: brand_01, alt: "john due", name: "john due"},
    {img: brand_02, alt: "Smiths Marth", name: "Smiths Marth"},
    {img: brand_03, alt: "Adon Smith", name: "Adon Smith"},
    {img: brand_04, alt: "Smitha Mila", name: "Smitha Mila"},
    {img: brand_05, alt: "Mila Dus", name: "Mila Dus"}
]

const Clients = () => {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
              }
            },
            {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                }
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
              }
            }
        ],
    };

    return (
        <section className="client_area">
            <Slider {...settings} className="client_slider">
                {clientscontent.map((val, index) => {
                    return(
                    <div className="inner" key={index}>
                        <div className="client" >
                            <div className="thumbnail">
                                <img src={val.img} alt={val.name} className="img"/>
                            </div>
                            <div className="client_name">
                                <span>{val.name}</span>
                            </div>
                        </div>
                    </div>
                    )
                })}
            </Slider>
            {/* == single client area end == */}
        </section>
    )
}

export default Clients;
