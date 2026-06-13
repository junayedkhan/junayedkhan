import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PersonalInfo from './PersonalInfo';
import Achievement from './Achievement';
import Education from './Education';
import Experience from './Experience';
import Skills from './Skills';

const About = () => {
    return (
        <main className="about min-h-screen pb-20"> 
            <div className="title_section relative flex min-h-32 items-center justify-center">
                <span className="title_bg absolute text-6xl font-black uppercase text-ink/5 md:text-8xl">resume</span>
                <h1 className="title relative text-3xl font-black uppercase text-ink md:text-5xl" >about <span className="text-personal">me</span></h1>
            </div>
            {/* title area end */}
            <section className="main_content">
                <div className="mx-auto max-w-6xl px-4">
                    <Tabs className="tabs">
                        <TabList className="tablist m-0 mb-8 grid list-none grid-cols-1 rounded-[1.5rem] border border-white/70 bg-vellum/75 p-2 shadow-classic backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
                            <Tab className="tab rounded-full py-4 text-center font-bold text-ink transition hover:text-personal">
                                <span>personal info</span>
                            </Tab>
                            <Tab className="tab rounded-full py-4 text-center font-bold text-ink transition hover:text-personal">
                                <span>education</span>
                            </Tab>
                            <Tab className="tab rounded-full py-4 text-center font-bold text-ink transition hover:text-personal">
                                <span>skills</span>
                            </Tab>
                            <Tab className="tab rounded-full py-4 text-center font-bold text-ink transition hover:text-personal">
                                <span>experience</span>
                            </Tab>
                        </TabList>
                        {/* == tab list area end == */}
                        <TabPanel className="personal_info">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                                <div>
                                    <div>
                                        <div>
                                            <h4 className="main_title mb-4 text-2xl font-black capitalize text-ink">personal info</h4>
                                        </div>
                                        <PersonalInfo />
                                    </div>
                                </div>
                                <div>
                                    <Achievement />
                                </div>
                                {/* == status box area end == */}
                            </div>
                        </TabPanel>
                        {/* == personal info TabPanel area end == */}
                        <TabPanel className="education">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Education />
                                <Experience />
                            </div>
                        </TabPanel>
                        {/* == education TabPanel area end == */}
                        <TabPanel className="skill">
                            <Skills />
                        </TabPanel>
                        {/* == skill TabPanel area end == */}
                        <TabPanel className="experience">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Education />
                                <Experience />
                            </div>
                        </TabPanel>
                        {/* == education tab area end == */} 
                    </Tabs>
                    {/* == tabs content area end == */}
                </div>
            </section>
            {/* == resume area end */}
        </main>
    )
}

export default About;
