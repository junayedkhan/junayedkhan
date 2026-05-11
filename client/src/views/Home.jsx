import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import Hero from "../component/hero/Hero"
import About from '../component/about/About'
import Portfolio from '../component/portfolio/Portfolio'
import Blogs from '../component/blogs/Blogs'
import Contact from '../component/contact/Contact'

const getStoredDarkMode = () => {
    try {
        return JSON.parse(localStorage.getItem("dark-mode")) || false;
    } catch {
        return false;
    }
};

const Home = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen,setIsOpen] = useState(false);
    const openMenu= ()=> setIsOpen(!isOpen);
    const [loading, setLoading] = useState(() => !sessionStorage.getItem("site-loaded"))

    // === loading screen === //
    useEffect(() => {
        if (sessionStorage.getItem("site-loaded")) {
            setLoading(false);
            return;
        }

        const loadingTimer = setTimeout(() => {
            sessionStorage.setItem("site-loaded", "true");
            setLoading(false)
        }, 850)

        return () => clearTimeout(loadingTimer)
    },[])


    // === dark mode area start === //
    const [darkMode, setDarkMode] = useState(getStoredDarkMode);

    useEffect(() => {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
      }
      const json = JSON.stringify(darkMode);
      localStorage.setItem("dark-mode", json);
    }, [darkMode]);
    // === dark mode area end === //

    const nav_item = [
        { menuName: "home", icon: "fas fa-home", path: "/"},
        { menuName: "about", icon: "fas fa-user", path: "/about"},
        { menuName: "gallery", icon: "fas fa-images", path: "/gallery", aliases: ["/portfolio"]},
        { menuName: "blogs", icon: "fas fa-envelope-open", path: "/blogs", aliases: ["/blogs/"]},
        { menuName: "contact", icon: "fas fa-comments", path: "/contact"},
    ]

    const selectedIndex = Math.max(
        nav_item.findIndex((item) => item.path === location.pathname || item.aliases?.some((alias) => location.pathname.startsWith(alias))),
        0
    );

    const handleTabSelect = (index) => {
        const path = nav_item[index].path;
        if (path !== location.pathname) {
            navigate(path);
        }
    };

    return (
        <main className="websfolio_th">
            {loading ? (
                <div className="modern_loader" role="status" aria-live="polite">
                    <div className="modern_loader_card">
                        <span className="modern_loader_logo">J</span>
                        <div className="modern_loader_text">
                            <strong>Loading</strong>
                            <span>Preparing your page</span>
                        </div>
                        <div className="modern_loader_bar">
                            <span></span>
                        </div>
                    </div>
                </div>
            ) : null}
            <>
                <button className="dark_and_light_btn" onClick={()=> setDarkMode(!darkMode)}>
                    {darkMode ?
                    (<i className="fas fa-sun" style={{color: "#c4cfde"}}></i>) :
                    (<i className="fas fa-moon" style={{color: "#212428"}}></i>)}
                </button>
                {/* == dark mode button end == */}
                <Tabs selectedIndex={selectedIndex} onSelect={handleTabSelect}>
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

            </>
        </main>
    )
}

export default Home;

