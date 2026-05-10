import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PersonalInfo from './PersonalInfo';
import Achievement from './Achievement';
import Education from './Education';
import Experience from './Experience';
import Skills from './Skills';
import Testimonial from './Testimonial';
import Clients from './Clients';

const About = () => {
    return (
        <main className="about"> 
            <div className="title_section">
                <span className="title_bg">resume</span>
                <h1 className="title" >about <span>me</span></h1>
            </div>
            {/* title area end */}
            <section className="main_content">
                <div className="container">
                    <Tabs className="tabs">
                        <TabList className="tablist row">
                            <Tab className="tab col-lg-3 col-md-3 col-sm-12">
                                <span>personal info</span>
                            </Tab>
                            <Tab className="tab col-lg-3 col-md-3 col-sm-12">
                                <span>education</span>
                            </Tab>
                            <Tab className="tab col-lg-3 col-md-3 col-sm-12">
                                <span>skills</span>
                            </Tab>
                            <Tab className="tab col-lg-3 col-md-3 col-sm-12">
                                <span>experience</span>
                            </Tab>
                        </TabList>
                        {/* == tab list area end == */}
                        <TabPanel className="personal_info">
                            <div className="row">
                                <div className="col-12 col-lg-5 _mb_60">
                                    <div className="row">
                                        <div className="col-12">
                                            <h4 className="main_title">porsonal info</h4>
                                        </div>
                                        <PersonalInfo />
                                    </div>
                                </div>
                                <div className="col-12 col-lg-7">
                                    <Achievement />
                                </div>
                                {/* == status box area end == */}
                            </div>
                        </TabPanel>
                        {/* == personal info TabPanel area end == */}
                        <TabPanel className="education">
                            <div className="row">
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
                            <div className="row">
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
            <section>
                <div className="title_section">
                    <span className="title_bg">Clients</span>
                    <h1 className="title" >Testimo<span>nial</span></h1>
                </div>
                {/* == title area end == */}
                <div className="container">
                    <Testimonial />
                </div>
            </section>
            {/* == testimonial area start == */}
            <section>
                <div className="title_section">
                    <span className="title_bg">some</span>
                    <h1 className="title" >Client<span>s</span></h1>
                </div>
                {/* == title area end == */}
                <div className="container">
                    <Clients /> 
                </div>
            </section>
            {/* == client area start == */}
        </main>
    )
}

export default About;
