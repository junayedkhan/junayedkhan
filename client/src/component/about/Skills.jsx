import React from 'react'

const design_skill = [
    {lavel: "photoshop", number: "90%"},
    {lavel: "FIGMA", number: "80%"},
    {lavel: "ADOBE XD", number: "65%"},
    {lavel: "ADOBE ILLUSTRATOR", number: "80%"},
    {lavel: "DESIGN", number: "55%"},
]

const Development_Skill = [
    {lavel: "HTML", number: "90%"},
    {lavel: "CSS", number: "80%"},
    {lavel: "JAVASCRIPT", number: "65%"},
    {lavel: "react js", number: "80%"},
    {lavel: "next js", number: "55%"},
]

const Skills = () => {
    return (
    <div className="grid gap-6 md:grid-cols-2">
        <div>
            <div className="inner rounded-3xl bg-vellum/80 p-6 shadow-soft ring-1 ring-white/80">
                <span className="subtitle text-xs font-extrabold uppercase tracking-[.18em] text-brass">features</span>
                <h4 className="main_title mt-2 text-2xl font-black text-ink">design skill</h4>
                <div className="skill_charts mt-6 grid gap-5">
                    {design_skill.map((val, index) => {
                        return(
                        <div className="skill_charts_inner" key={index}>
                            <div className="heading mb-2 flex items-center justify-between">
                                <h6 className="lavel text-xs font-extrabold uppercase tracking-wide text-ink">{val.lavel}</h6>
                                <h6 className="number text-xs font-bold text-personal">{val.number}</h6>
                            </div>
                            <div className="progress_bar h-3 overflow-hidden rounded-full bg-slate-200">
                                <div className="progress_bar_inner h-full rounded-full bg-ink" style={{width: val.number}}></div>
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
        {/* == design skill list area end == */}
        <div>
            <div className="inner rounded-3xl bg-vellum/80 p-6 shadow-soft ring-1 ring-white/80">
                <span className="subtitle text-xs font-extrabold uppercase tracking-[.18em] text-brass">features</span>
                <h4 className="main_title mt-2 text-2xl font-black text-ink">Development Skill</h4>
                <div className="skill_charts mt-6 grid gap-5">
                    {Development_Skill.map((val, index) => {
                        return(
                        <div className="skill_charts_inner" key={index}>
                            <div className="heading mb-2 flex items-center justify-between">
                                <h6 className="lavel text-xs font-extrabold uppercase tracking-wide text-ink">{val.lavel}</h6>
                                <h6 className="number text-xs font-bold text-personal">{val.number}</h6>
                            </div>
                            <div className="progress_bar h-3 overflow-hidden rounded-full bg-slate-200">
                                <div className="progress_bar_inner h-full rounded-full bg-ink" style={{width: val.number}}></div>
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
        {/* == Development Skill list area end == */}
    </div>
    )
}

export default Skills
