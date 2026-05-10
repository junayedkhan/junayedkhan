import React, {useState} from 'react'
import BlogDetails from './BlogDetails'

import img_01 from "../../assets/image/blog-01.jpg";
import img_02 from "../../assets/image/blog-02.jpg";
import img_03 from "../../assets/image/blog-03.jpg";

const blogContent = [
    {
        id: "1",
        img: img_01,
        category: "design",
        meta: "10 JUNE 2021 - 7.30 PM",
        title: "T-shirt design is the part of design",
        designation_01: `Just because we can't get out and about like we normally would,
                         doesn’t mean we have to stop taking pictures. There’s still plenty you can do,
                         provided you're prepared to use some imagination. Here are a few ideas to keep
                         you shooting until normal life resumes.`,
        designation_02: `Most photographers find it hard to see interesting pictures in places in which they are most familiar.
                         A trip somewhere new seems always exactly what our photography needed,
                         as shooting away from home consistently inspires us to new artistic heights.`,
        description_01: `Most photographers love to shoot the unusual, and you don’t get much more unusual
                         than These Unprecedented Times. Right now everything counts as out of the ordinary.
                         There are a number of remarkable things about these lockdown days that are worth photographing now
                         so we can remember them when it is all over.`,
        description_02: `Streets empty that are usually busy are remarkable and can evoke the sense of historical
                         pictures from before the invention of the motorcar. Other things that are different at the moment will
                         be queues to get into stores and the lines marked out on the floor to show how far apart we should be`,
        description_03: `Pretend everything is new and that you haven’t seen it before, and then you will be free
                         to notice the leading lines, the places where one edge meets another in delightful geometric harmony,
                         and how the ordinary things in the kitchen are transformed when the light is on or off.`,
        description_04: `The trick here is to look slowly, and then look again. Take the time to look in detail
                         and to look at the same thing from different angles, with different light, long lenses and wide lenses.
                         Then move to the left a bit. You may never feel the need to leave the house again.`
    },
    {
        id: "2",
        img: img_02,
        category: "design",
        meta: "7 MAY 2021 - 7.30 PM",
        title: "the service provide for design",
        designation_01: `Just because we can't get out and about like we normally would,
                         doesn’t mean we have to stop taking pictures. There’s still plenty you can do,
                         provided you're prepared to use some imagination. Here are a few ideas to keep
                         you shooting until normal life resumes.`,
        designation_02: `Most photographers find it hard to see interesting pictures in places in which they are most familiar.
                         A trip somewhere new seems always exactly what our photography needed,
                         as shooting away from home consistently inspires us to new artistic heights.`,
        description_01: `Most photographers love to shoot the unusual, and you don’t get much more unusual
                         than These Unprecedented Times. Right now everything counts as out of the ordinary.
                         There are a number of remarkable things about these lockdown days that are worth photographing now
                         so we can remember them when it is all over.`,
        description_02: `Streets empty that are usually busy are remarkable and can evoke the sense of historical
                         pictures from before the invention of the motorcar. Other things that are different at the moment will
                         be queues to get into stores and the lines marked out on the floor to show how far apart we should be`,
        description_03: `Pretend everything is new and that you haven’t seen it before, and then you will be free
                         to notice the leading lines, the places where one edge meets another in delightful geometric harmony,
                         and how the ordinary things in the kitchen are transformed when the light is on or off.`,
        description_04: `The trick here is to look slowly, and then look again. Take the time to look in detail
                         and to look at the same thing from different angles, with different light, long lenses and wide lenses.
                         Then move to the left a bit. You may never feel the need to leave the house again.`
    },
    {
        id: "3",
        img: img_03,
        category: "design",
        meta: "7 JULY 2021 - 7.30 PM",
        title: "Mobile app landing design & app maintain",
        designation_01: `Just because we can't get out and about like we normally would,
                         doesn’t mean we have to stop taking pictures. There’s still plenty you can do,
                         provided you're prepared to use some imagination. Here are a few ideas to keep
                         you shooting until normal life resumes.`,
        designation_02: `Most photographers find it hard to see interesting pictures in places in which they are most familiar.
                         A trip somewhere new seems always exactly what our photography needed,
                         as shooting away from home consistently inspires us to new artistic heights.`,
        description_01: `Most photographers love to shoot the unusual, and you don’t get much more unusual
                         than These Unprecedented Times. Right now everything counts as out of the ordinary.
                         There are a number of remarkable things about these lockdown days that are worth photographing now
                         so we can remember them when it is all over.`,
        description_02: `Streets empty that are usually busy are remarkable and can evoke the sense of historical
                         pictures from before the invention of the motorcar. Other things that are different at the moment will
                         be queues to get into stores and the lines marked out on the floor to show how far apart we should be`,
        description_03: `Pretend everything is new and that you haven’t seen it before, and then you will be free
                         to notice the leading lines, the places where one edge meets another in delightful geometric harmony,
                         and how the ordinary things in the kitchen are transformed when the light is on or off.`,
        description_04: `The trick here is to look slowly, and then look again. Take the time to look in detail
                         and to look at the same thing from different angles, with different light, long lenses and wide lenses.
                         Then move to the left a bit. You may never feel the need to leave the house again.`
    }
]

const Blogs = () => {

    const [openModel, setopenModel] = useState(false)
    const [data, setData] = useState([])

    return (
        <>
        <section className="blogs">
            <div className="title_section">
                    <span className="title_bg">news</span>
                    <h1 className="title" >my <span>blog</span></h1>
            </div>
            {/* == title area end == */}
            <div className="main_content">
                <div className="container">
                    <div className="row">
                        {blogContent.map((val, index) => {
                            return(
                            <div className="col-lg-6 col-xl-4 col-md-6 col-12 _mb_20_" key={index}>
                                <div className="card">
                                    <div className="inner">
                                        <div className="card_thumbnail">
                                            <img onClick={() => {
                                                setopenModel(true)
                                                setData(val)
                                            }}
                                            src={val.img}
                                            alt="blog" />
                                        </div>
                                        {/* == image area end == */}
                                        <div className="card_content">
                                            <div className="category_info">
                                                <p className="category_list">{val.category}</p>
                                                <p className="meta">{val.meta}</p>
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
                </div>
            </div>
        </section>
        {/* == blog area end == */}
        <section className={openModel ? "react_model" : "d-none"}>
            {openModel ? <div onClick={() => setopenModel(false)} className="react_model overlay"></div> : null}
            <div className="react_model_inner">
                <BlogDetails setopenModel={setopenModel} data={data}/>
            </div>
        </section>
        {/* == blog details model area end == */}
        </>
    )
}

export default Blogs;
