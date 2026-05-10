import React, { useEffect, useState } from 'react'

const personalInfo = [
    {title: "fast name", value: "John"},
    {title: "last name", value: "Lee"},
    {title: "age", value: "25"},
    {title: "nationality", value: "usa"},
    {title: "freelance", value: "jone lee"},
    {title: "address", value: "usa"},
    {title: "phone", value: "+2162118455"},
    {title: "email", value: "jonelee@gmail.com"},
    {title: "Skype", value: "jone.lee"},
    {title: "language", value: "english"},
]

const PersonalInfo = () => {

    const [data, setData] = useState([])

    const facthData = async() => {
        const res = await fetch(`http://localhost:8000/personal`)
        const data = await res.json()
        return setData(data)
    }


    useEffect(() => {
        facthData()
    },[])

    console.log(data)

    return (
        <>
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
        <ul>
            {data.map((val, index) => {
                return(
                    <li key={index}>fast name: {val.fast_name}</li>
                )
            })}
        </ul>
        </>
    );
};

export default PersonalInfo;
