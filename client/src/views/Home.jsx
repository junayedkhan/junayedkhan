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
    const [isMobileNav, setIsMobileNav] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(max-width: 1199px)").matches
    );


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

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1199px)");
        const onChange = () => setIsMobileNav(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    // Reset scroll position when location changes
    useEffect(() => {
        // Smooth scroll to top with animation
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    useEffect(() => {
        if (isMobileNav && isOpen) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }
        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, [isMobileNav, isOpen]);

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
    const isBlogDetailsPage = location.pathname.replace(/\/$/, "").startsWith("/blogs/");

    const handleTabSelect = (index) => {
        const path = nav_item[index].path;
        if (path !== location.pathname) {
            // Smooth scroll to top with animation
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            navigate(path);
        }
    };

    return (
        <main className="websfolio_th">
            <>
                <button
                    type="button"
                    className="dark_and_light_btn"
                    onClick={()=> setDarkMode(!darkMode)}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ?
                    (<i className="fas fa-sun" style={{color: "#c4cfde"}} aria-hidden="true"></i>) :
                    (<i className="fas fa-moon" style={{color: "#0b2c1f"}} aria-hidden="true"></i>)}
                </button>
                {/* == dark mode button end == */}
                <Tabs selectedIndex={selectedIndex} onSelect={handleTabSelect}>
                    {isMobileNav && isOpen ? (
                        <button
                            type="button"
                            className="nav_backdrop"
                            aria-label="Close menu"
                            onClick={() => setIsOpen(false)}
                        />
                    ) : null}
                    <div className={isOpen===false ? "nav_menu" : "nav_menu active" }>
                        <TabList>
                            {nav_item.map((val, index) => {
                            return(
                            <Tab key={index} className="nav_item" onClick={openMenu}>
                                <i className={val.icon} id="icon" aria-hidden="true"></i>
                                <span className="tooltiptext">{val.menuName}</span>
                            </Tab>
                            )
                            })}
                        </TabList>
                    </div>
                    {isBlogDetailsPage ? (
                        <button
                            type="button"
                            className="nav_blog_back"
                            onClick={() => navigate("/blogs")}
                            aria-label="Back to all blogs"
                        >
                            <i className="fas fa-arrow-left" aria-hidden="true"></i>
                            <span>All blogs</span>
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className={isOpen===false ? "hamburger" : "hamburger active" }
                        onClick={openMenu}
                        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={isOpen}
                    >
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

