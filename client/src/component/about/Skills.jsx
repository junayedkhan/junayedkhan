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
    <div className="row">
        <div className="col-lg-6 col-md-6 col-12 _mb_60">
            <div className="inner">
                <span className="subtitle">features</span>
                <h4 className="main_title">design skill</h4>
                <div className="skill_charts">
                    {design_skill.map((val, index) => {
                        return(
                        <div className="skill_charts_inner" key={index}>
                            <div className="heading">
                                <h6 className="lavel">{val.lavel}</h6>
                                <h6 className="number">{val.number}</h6>
                            </div>
                            <div className="progress_bar">
                                <div className="progress_bar_inner" style={{width: val.number}}></div>
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
        {/* == design skill list area end == */}
        <div className="col-lg-6 col-md-6 col-12">
            <div className="inner">
                <span className="subtitle">features</span>
                <h4 className="main_title">Development Skill</h4>
                <div className="skill_charts">
                    {Development_Skill.map((val, index) => {
                        return(
                        <div className="skill_charts_inner" key={index}>
                            <div className="heading">
                                <h6 className="lavel">{val.lavel}</h6>
                                <h6 className="number">{val.number}</h6>
                            </div>
                            <div className="progress_bar">
                                <div className="progress_bar_inner" style={{width: val.number}}></div>
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
