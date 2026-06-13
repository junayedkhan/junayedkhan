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
        <div className="min-w-0">
            <div className="inner">
                <span className="subtitle text-xs font-extrabold uppercase tracking-[.18em] text-personal">2008 - 2015</span>
                <h3 className="main_title mt-2 text-2xl font-black capitalize text-ink">educational quality</h3>
                <div className="inner_list mt-6 grid gap-4">
                    {educational_quality.map((val, index) => {
                        return(
                        <div className="item rounded-3xl bg-vellum/80 p-5 shadow-soft ring-1 ring-white/80" key={index}>
                            <div className="heading flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                                <div className="title">
                                    <h4 className="text-lg font-black leading-snug text-ink">{val.title}</h4>
                                    <span className="mt-1 block text-sm text-slate-500">{val.subtitle}</span>
                                </div>
                                <div className="date_of_time">
                                    <span className="rounded-full bg-brass/10 px-3 py-1 text-xs font-bold text-brass">{val.date_of_time}</span>
                                </div>
                            </div>
                            <p className="description mt-4 text-sm leading-7 text-slate-600">{val.description}</p>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Education
