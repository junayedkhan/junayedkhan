import React from 'react'

const AchievementContent = [
    {number: "12", text_1: "years of", text_2: "exprerience"},
    {number: "97", text_1: "COMPLETED", text_2: "PROJECTS"},
    {number: "81", text_1: "HAPPY", text_2: "CUSTOMERS"},
    {number: "53", text_1: "AWARDS", text_2: "WON"},
]

const Achievement = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {AchievementContent.map((val, index) => {
                return(
                <div key={index}>
                    <div className="stats_box h-full rounded-3xl bg-vellum/80 p-5 shadow-soft ring-1 ring-white/80">
                        <h3 className="text-4xl font-black text-brass">{val.number}</h3>
                        <p className="mt-2 text-xs font-extrabold uppercase leading-5 tracking-wide text-slate-600">
                            {val.text_1}
                            <span className="block">{val.text_2}</span>
                        </p>
                    </div>
                </div>
                )
            })}
        </div>
    )
}

export default Achievement
