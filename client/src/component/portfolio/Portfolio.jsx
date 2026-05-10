import React, { useEffect, useState } from 'react';
import PortfolioDetails from './PortfolioDetails';

import img01 from "../../assets/image/portfolio-01.jpg"
import img02 from "../../assets/image/portfolio-02.jpg"
import img03 from "../../assets/image/portfolio-03.jpg"
import img04 from "../../assets/image/portfolio-04.jpg"
import img05 from "../../assets/image/portfolio-05.jpg"
import img06 from "../../assets/image/portfolio-06.jpg"

const portfolioContent = [
    {
        id: "1",
        img: img01,
        alt: "portfolio",
        tag: "webdesign",
        meta: "600",
        title: "The services provide for design",
        description_1: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate distinctio assumenda
                        explicabo veniam temporibus eligendi`,
        description_2: `Consectetur adipisicing elit. Cupiditate distinctio assumenda. dolorum alias suscipit
                        rerum maiores aliquam earum odit, nihil culpa quas iusto hic minus!`
    },
    {
        id: "2",
        img: img02,
        alt: "portfolio",
        tag: "webdesign",
        meta: "500",
        title: "Mobile app landing design & app maintain",
        description_1: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate distinctio assumenda
                        explicabo veniam temporibus eligendi`,
        description_2: `Consectetur adipisicing elit. Cupiditate distinctio assumenda. dolorum alias suscipit
                        rerum maiores aliquam earum odit, nihil culpa quas iusto hic minus!`
    },
    {
        id: "3",
        img: img03,
        alt: "portfolio",
        tag: "photoshop",
        meta: "400",
        title: "Logo design creativity & Application" ,
        description_1: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate distinctio assumenda
                        explicabo veniam temporibus eligendi`,
        description_2: `Consectetur adipisicing elit. Cupiditate distinctio assumenda. dolorum alias suscipit
                        rerum maiores aliquam earum odit, nihil culpa quas iusto hic minus!`
    },
    {
        id: "4",
        img: img04,
        alt: "portfolio",
        tag: "devolapment",
        meta: "350",
        title: "Mobile app landing design & Services",
        description_1: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate distinctio assumenda
                        explicabo veniam temporibus eligendi`,
        description_2: `Consectetur adipisicing elit. Cupiditate distinctio assumenda. dolorum alias suscipit
                        rerum maiores aliquam earum odit, nihil culpa quas iusto hic minus!`
    },
    {
        id: "5",
        img: img05,
        alt: "portfolio",
        tag: "photoshop",
        meta: "200",
        title: "App for tecnology & services",
        description_1: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate distinctio assumenda
                        explicabo veniam temporibus eligendi`,
        description_2: `Consectetur adipisicing elit. Cupiditate distinctio assumenda. dolorum alias suscipit
                        rerum maiores aliquam earum odit, nihil culpa quas iusto hic minus!`
    },
    {
        id: "6",
        img: img06,
        alt: "portfolio",
        tag: "webdesign",
        meta: "500",
        title: "Design for tecnology & services",
        description_1: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate distinctio assumenda
                        explicabo veniam temporibus eligendi`,
        description_2: `Consectetur adipisicing elit. Cupiditate distinctio assumenda. dolorum alias suscipit
                        rerum maiores aliquam earum odit, nihil culpa quas iusto hic minus!`
    },
]

const Portfolio = () => {
	const [tag, setTag] = useState('all');
	const [filtered, setFiltered] = useState([]);
    const [data, setData] = useState([])
    const [openModel, setopenModel] = useState(false)

    const TagButton = ({ name, handleSetTag, tagActive }) => {
        return (
            <button className={`tag ${tagActive ? 'active' : null}`} onClick={() => handleSetTag(name)}>
                {name.toUpperCase()}
            </button>
        );
    };

    useEffect(() => {
        tag === 'all' ? setFiltered(portfolioContent) : setFiltered(portfolioContent.filter(image => image.tag === tag));
    },[tag])

	return (
        <>
        <section className="portfolio">
            <div className="title_section">
                <span className="title_bg">works</span>
                <h1 className="title" >my <span>portfolio</span></h1>
            </div>
            {/* == title area end == */}
            <div className="main_content">
                <div className="container">
                    <div className="portfolio_tags">
                        <TagButton name="all" tagActive={tag === 'all' ? true : false} handleSetTag={setTag} />
                        <TagButton name="webdesign" tagActive={tag === 'webdesign' ? true : false} handleSetTag={setTag} />
                        <TagButton name="devolapment" tagActive={tag === 'devolapment' ? true : false} handleSetTag={setTag} />
                        <TagButton name="photoshop" tagActive={tag === 'photoshop' ? true : false} handleSetTag={setTag} />
                    </div>
                    {/* == portfolio navigation area end == */}
                    <div className="row">
                        {filtered.map((val, index) => {
                            return(
                            <div className="col-lg-6 col-xl-4 col-md-6 col-12 _mb_20_" key={index}>
                                <div className="card">
                                    <div className="inner">
                                        <div className="card_thumbnail">
                                            <img src={val.img} alt={val.alt}
                                            onClick={() => {
                                                setopenModel(true)
                                                setData(val)
                                            }}
                                            />
                                        </div>
                                        {/* == thumbnail area end == */}
                                        <div className="card_content">
                                            <div className="category_info">
                                                <p className="category_list">{val.tag}</p>
                                                <p className="meta"><i class="fas fa-heart"></i> {val.meta}</p>
                                            </div>
                                            <h4 className="title"
                                            onClick={() => {
                                                setopenModel(true)
                                                setData(val)
                                            }}>
                                            {val.title}
                                            </h4>
                                        </div>
                                        {/* == text area end == */}
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                    {/* == portfolio card area end == */}
                </div>
            </div>
        </section>
        {/* == portfolio area end == */}
        <section className={openModel ? "react_model" : "d-none"}>
            {openModel ? <div onClick={() => setopenModel(false)} className="react_model overlay"></div> : null}
                <div className="react_model_inner">
                    <PortfolioDetails data={data} setopenModel={setopenModel}/>
                </div>
        </section>
        {/* == portfolio model area end == */}
        </>
	);
}

export default Portfolio;

