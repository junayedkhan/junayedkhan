import React from 'react'

const personalInfo = [
    {title: "first name", value: "Junayed"},
    {title: "last name", value: "Khan"},
    {title: "profession", value: "Web Developer"},
    {title: "nationality", value: "Bangladeshi"},
    {title: "freelance", value: "Available"},
    {title: "location", value: "Dhaka, Bangladesh"},
    {title: "phone", value: "Available on request"},
    {title: "email", value: "Use contact form"},
    {title: "focus", value: "React, UI, Frontend"},
    {title: "language", value: "Bangla, English"},
]

const PersonalInfo = () => {
    return (
        <ul className="personal_info about_list grid grid-cols-1 gap-3 sm:grid-cols-2">
            {personalInfo.map((val, index) => {
                return(
                <li className="rounded-2xl bg-vellum/80 p-4 shadow-soft ring-1 ring-white/80" key={index}>
                    <span className="title block text-xs font-extrabold uppercase tracking-wide text-slate-500">{val.title}</span>
                    <span className="value mt-1 block font-bold text-ink">
                        {val.value}
                    </span>
                </li>
                )
            })}
        </ul>
    );
};

export default PersonalInfo;
