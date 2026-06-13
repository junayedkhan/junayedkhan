import React from 'react'
import Icon from './Icon'

const Social = () => {
    
    const social_share = [
        {
            iconName: "facebook",
            link: "https://www.facebook.com/",
            label: "Facebook"
        },
        {
            iconName: "twitter",
            link: "https://twitter.com/",
            label: "Twitter"
        },
        {
            iconName: "linkedin",
            link: "https://www.linkedin.com/",
            label: "LinkedIn"
        }
    ]

    return (
        <>
        <div className="social_share mt-4">
            <span className="title mb-3 block text-xs font-extrabold uppercase tracking-[.18em] text-slate-500">find with me</span>
            <ul className="social_share_inner m-0 flex list-none gap-3 p-0">
                {social_share.map((val, index) => {
                    return(
                    <li key={index}>
                        <a href={val.link} target="_blank" rel="noreferrer" className="social_icon grid h-12 w-12 place-items-center rounded-2xl bg-ink text-vellum shadow-button transition duration-300 hover:-translate-y-1 hover:bg-personal" aria-label={val.label}>
                            <Icon icon={val.iconName} />
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
