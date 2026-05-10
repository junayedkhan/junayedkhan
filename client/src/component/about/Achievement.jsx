import React from 'react'

const AchievementContent = [
    {number: "12", text_1: "years of", text_2: "exprerience"},
    {number: "97", text_1: "COMPLETED", text_2: "PROJECTS"},
    {number: "81", text_1: "HAPPY", text_2: "CUSTOMERS"},
    {number: "53", text_1: "AWARDS", text_2: "WON"},
]

const Achievement = () => {
    return (
        <div className="row">
            {AchievementContent.map((val, index) => {
                return(
                <div className="col-6" key={index}>
                    <div className="stats_box">
                        <h3>{val.number}</h3>
                        <p>
                            {val.text_1}
                            <span className="d-block">{val.text_2}</span>
                        </p>
                    </div>
                </div>
                )
            })}
        </div>
    )
}

export default Achievement
