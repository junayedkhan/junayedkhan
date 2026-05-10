import React from 'react'

const Social = () => {
    
    const social_share = [
        {
            iconName: "fab fa-facebook-f",
            link: "https://www.facebook.com/"
        },
        {
            iconName: "fab fa-twitter",
            link: "https://twitter.com/"
        },
        {
            iconName: "fab fa-linkedin-in",
            link: "https://www.linkedin.com/"
        }
    ]

    return (
        <>
        <div className="social_share">
            <span className="title">find with me</span>
            <ul className="social_share_inner d-flex">
                {social_share.map((val, index) => {
                    return(
                    <li key={index}>
                        <a href={`${val.link}`} target="blank" className="social_icon">
                            <i className={val.iconName}></i>
                        </a>
                    </li>
                    )
                 })}
            </ul>
        </div> 
        {/* == social share area end */}     
        </>
    )
}

export default Social;
