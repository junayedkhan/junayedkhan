import React from 'react'

const educational_quality = [
    {
    title: "Examples Of Personal Portfolio",
    subtitle: "College of Studies (2000 - 2002)",
    date_of_time: "4.70/5",
    description: `Maecenas finibus nec sem ut imperdiet. Ut tincidunt est ac dolor aliquam sodales.
                  Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.`
    },
    {
    title: "Personal Portfolio April Fools",
    subtitle: "University of DVI (1997 - 2001)",
    date_of_time: "4.70/5",
    description: `The education should be very interactual. Ut tincidunt est ac dolor aliquam sodales. 
                  Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.`
    },
    {
    title: "Tips For Personal Portfolio",
    subtitle: "University of Studies (1997 - 2001)",
    date_of_time: "4.70/5",
    description: `If you are going to use a passage. Ut tincidunt est ac dolor aliquam sodales.
                  Phasellus sed mauris hendrerit, laoreet sem in, lobortis mauris hendrerit ante.`
    },
]

const Education = () => {
    return (
        <div className="col-lg-6 col-md-12 col-12 _mb_60">
            <div className="inner">
                <span className="subtitle">2008 - 2015</span>
                <h3 className="main_title">educational quality</h3>
                <div className="inner_list">
                    {educational_quality.map((val, index) => {
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

export default Education
