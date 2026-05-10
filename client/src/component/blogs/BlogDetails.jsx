import React from 'react'
import Comment from './Comment'

const BlogDetails = ({ setopenModel, data }) => {

    return (
        <>
        <article className="blog_details">
            <button onClick={() => setopenModel(false)} className="react_model_close"><i className="fas fa-times"></i></button>
            {/* == button area end */}
            <div className="main_content">
                <div className="thumbnail">
                    <div className="inner">
                        <img src={data.img} alt="blog" />
                    </div>
                </div>
                {/* == image area end */}
                <div className="details">
                    <p className="meta">{data.meta}</p>
                    <h3 className="title">{data.title}</h3>
                </div>
                <div className="text_content">
                    <div className="description">
                        {/* == designation_01 == */}
                        <p className="bigger">{data.designation_01}</p>
                        {/* == description_01 == */}
                        <p>{data.description_01}</p>
                        {/* == description_02 == */}
                        <p>{data.description_02}</p>
                        <div className="quote_box">
                            <div className="icon">
                                <i className="fas fa-quote-left"></i>
                            </div>
                            {/* == designation_02 == */}
                            <p>{data.designation_02}</p>
                        </div>
                        {/* == designation_03 == */}
                        <p>{data.description_03}</p>
                        {/* == designation_04 == */}
                        <p>{data.description_04}</p>
                    </div>
                </div>
                {/* == text area end == */}
                <Comment />
                {/* == comment area end == */}
            </div>
        </article>
        {/* == blog details area end == */}
        </>
    )
}

export default BlogDetails
