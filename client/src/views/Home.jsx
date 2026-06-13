import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import Hero from "../component/hero/Hero"
import About from '../component/about/About'
import Portfolio from '../component/portfolio/Portfolio'
import Blogs from '../component/blogs/Blogs'
import Contact from '../component/contact/Contact'
import Icon from '../component/Icon'

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

    // Reset scroll position when location changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0 });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    const nav_item = [
        { menuName: "home", icon: "home", path: "/"},
        { menuName: "about", icon: "user", path: "/about"},
        { menuName: "gallery", icon: "images", path: "/gallery", aliases: ["/portfolio"]},
        { menuName: "blogs", icon: "mail-open", path: "/blogs", aliases: ["/blogs/"]},
        { menuName: "contact", icon: "comments", path: "/contact"},
    ]

    const selectedIndex = Math.max(
        nav_item.findIndex((item) => item.path === location.pathname || item.aliases?.some((alias) => location.pathname.startsWith(alias))),
        0
    );
    const isBlogDetailsPage = location.pathname.replace(/\/$/, "").startsWith("/blogs/");

    const handleTabSelect = (index) => {
        const path = nav_item[index].path;
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        if (path !== location.pathname) {
            window.scrollTo({ top: 0, left: 0 });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            navigate(path);
        }
    };

    return (
        <main className={`websfolio_th min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(183,121,31,.16),transparent_25%),radial-gradient(circle_at_88%_18%,rgba(15,118,110,.16),transparent_24%),linear-gradient(120deg,#fffaf0,#f4f3ee)] text-ink dark:bg-[#15181d] ${selectedIndex === 0 ? "home_active" : ""}`}>
            <>
                <button
                    type="button"
                    className="dark_and_light_btn fixed right-4 top-4 z-[2100] grid h-12 w-12 place-items-center rounded-full border border-white/50 bg-ink text-vellum shadow-button transition duration-300 hover:-translate-y-1"
                    onClick={()=> setDarkMode(!darkMode)}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? <Icon icon="sun" /> : <Icon icon="moon" />}
                </button>
                {/* == dark mode button end == */}
                <Tabs selectedIndex={selectedIndex} onSelect={handleTabSelect}>
                    <div className="nav_menu fixed inset-x-0 top-4 z-[2000] flex justify-center px-3 transition duration-500">
                        <TabList className="m-0 flex list-none flex-wrap items-center justify-center gap-2 rounded-full border border-white/25 bg-ink/55 p-2 shadow-classic backdrop-blur-xl">
                            {nav_item.map((val, index) => {
                            return(
                            <Tab key={index} className="nav_item flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/12 px-4 text-vellum ring-1 ring-white/15 transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-ink">
                                <Icon icon={val.icon} />
                                <span className="tooltiptext hidden text-xs font-extrabold uppercase tracking-wide sm:inline">{val.menuName}</span>
                            </Tab>
                            )
                            })}
                        </TabList>
                    </div>
                    {isBlogDetailsPage ? (
                        <button
                            type="button"
                            className="nav_blog_back fixed left-4 top-4 z-[2100] inline-flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-vellum shadow-button"
                            onClick={() => navigate("/blogs")}
                            aria-label="Back to all blogs"
                        >
                            <Icon icon="arrow-left" />
                            <span>All blogs</span>
                        </button>
                    ) : null}
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

