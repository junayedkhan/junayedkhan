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
        <ul className="personal_info about_list list-unstyled">
            {personalInfo.map((val, index) => {
                return(
                <li key={index}>
                    <span className="title">{val.title}: </span>
                    <span className="value d-block d-sm-inline-block d-lg-block d-xl-inline-block">
                        {val.value}
                    </span>
                </li>
                )
            })}
        </ul>
    );
};

export default PersonalInfo;
