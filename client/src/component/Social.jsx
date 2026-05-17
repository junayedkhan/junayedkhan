import React from 'react'

const Social = () => {
    
    const social_share = [
        {
            iconName: "fab fa-facebook-f",
            link: "https://www.facebook.com/",
            label: "Facebook"
        },
        {
            iconName: "fab fa-twitter",
            link: "https://twitter.com/",
            label: "Twitter"
        },
        {
            iconName: "fab fa-linkedin-in",
            link: "https://www.linkedin.com/",
            label: "LinkedIn"
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
                        <a href={val.link} target="_blank" rel="noreferrer" className="social_icon" aria-label={val.label}>
                            <i className={val.iconName} aria-hidden="true"></i>
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
