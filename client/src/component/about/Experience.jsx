import React from 'react'

const Job_Experience = [
    {
    title: "The Personal Portfolio Mystery",
    subtitle: "Job at jk-themes-pro (2008 - 2016)",
    date_of_time: "4.70/5",
    description: `Generate Lorem Ipsum which looks. Ut tincidunt est ac dolor aliquam sodales.
                  Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.`
    },
    {
    title: "Diploma in Web Development",
    subtitle: "BSE In CSE (2004 - 2008)",
    date_of_time: "4.70/5",
    description: `Contrary to popular belief. Ut tincidunt est ac dolor aliquam sodales.
                  Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.`
    },
    {
    title: "Diploma in Computer Science",
    subtitle: "Works at Plugin Development (2016 - 2020)",
    date_of_time: "4.70/5",
    description: `Maecenas finibus nec sem ut imperdiet. Ut tincidunt est ac dolor aliquam sodales.
                  Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.`
    },
]

const Experience = () => {
    return (
        <div className="col-lg-6 col-md-12 col-12">
            <div className="inner">
                <span className="subtitle">2008 - 2015</span>
                <h3 className="main_title">Job Experience</h3>
                <div className="inner_list">
                    {Job_Experience.map((val, index) => {
                        return(
                        <div className="item" key={index}>
                            <div className="heading">
                                <div className="title">
                                    <h4>{val.title}</h4>
                                    <span>{val.subtitle}</span>
                                </div>
                                <div className="date_of_time">
                                    <span>{val.date_of_time}</span>
                                </div>
                            </div>
                            <p className="description">{val.description}</p>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Experience
