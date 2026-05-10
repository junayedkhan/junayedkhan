import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Hero from "../component/hero/Hero"
import About from '../component/about/About'
import Portfolio from '../component/portfolio/Portfolio'
import Blogs from '../component/blogs/Blogs'
import Contact from '../component/contact/Contact'

const Home = () => {

    const [isOpen,setIsOpen] = useState(false);
    const openMenu= ()=> setIsOpen(!isOpen);
    const [loading, setLoading] = useState(false)

    // === loading screen === //
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000)
    },[])


    // === dark mode area start === //
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
      const json = localStorage.getItem("dark-mode");
      const currentMode = JSON.parse(json);
      if (currentMode) {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }, []);
  
    useEffect(() => {
      if (darkMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      const json = JSON.stringify(darkMode);
      localStorage.setItem("dark-mode", json);
    }, [darkMode]);
    // === dark mode area end === //

    const nav_item = [
        { menuName: "home", icon: "fas fa-home"},
        { menuName: "about", icon: "fas fa-user"},
        { menuName: "portfolio", icon: "fas fa-briefcase"},
        { menuName: "blogs", icon: "fas fa-envelope-open"},
        { menuName: "contact", icon: "fas fa-comments"},
    ]

    return (
        <main className={loading ? "websfolio_th preloaderShow" : "websfolio_th"}>
            {loading ? <img src="assets/image/preloader.gif" alt="" /> : <>
                <button className="dark_and_light_btn" onClick={()=> setDarkMode(!darkMode)}>
                    {darkMode ?
                    (<i className="fas fa-sun" style={{color: "#c4cfde"}}></i>) :
                    (<i className="fas fa-moon" style={{color: "#212428"}}></i>)}
                </button>
                {/* == dark mode button end == */}
                <Tabs>
                    <div className={isOpen===false ? "nav_menu" : "nav_menu active" }>
                        <TabList>
                            {nav_item.map((val, index) => {
                            return(
                            <Tab key={index} className="nav_item" onClick={openMenu}>
                                <i className={val.icon} id="icon"></i>
                                <span className="tooltiptext">{val.menuName}</span>
                            </Tab>
                            )
                            })}
                        </TabList>
                    </div>
                    <button className={isOpen===false ? "hamburger" : "hamburger active" } onClick={openMenu}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                    {/* == mobile nev button == */}
                    {/* end menu content == */}
                    <TabPanel>
                        <Hero />
                    </TabPanel>
                    {/* == hero area end == */}
                    <TabPanel>
                        <About />
                    </TabPanel>
                    {/* == about area end == */}
                    <TabPanel>
                        <Portfolio />
                    </TabPanel>
                    {/* == portfolio area end == */}
                    <TabPanel>
                        <Blogs />
                    </TabPanel>
                    {/* == blog area end == */}
                    <TabPanel>
                        <Contact />
                    </TabPanel>
                    {/* == contact area end == */}
                    {/* === all tabpanel end === */}
                </Tabs>
                {/* === tab area end === */}

            </>}
        </main>
    )
}

export default Home;

