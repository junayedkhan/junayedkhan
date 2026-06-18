import React, { useEffect, useState } from 'react';
import Icon from '../Icon';
import api from '../../utils/api';
import profileImage from '../../assets/image/th-without-animation.png';
import '../../assets/client-css/pages/about.css';

const ABOUT_CACHE_KEY = 'site-about-content';

const DEFAULT_ABOUT_CONTENT = {
  image: '',
  name: 'Junayed Khan',
  label: 'About Me',
  title: 'Hi, I am Junayed Khan',
  description: 'I am focused on building a clean personal portfolio where my travel moments, creative ideas, and personal brand can be presented in a professional way. My goal is to make the page feel simple, visual, and easy to explore.',
  status: 'Available',
  personalInfo: [
    { label: 'Name', value: 'Junayed Khan' },
    { label: 'Focus', value: 'Creative Portfolio' },
    { label: 'Location', value: 'Dhaka, Bangladesh' },
    { label: 'Language', value: 'Bangla, English' },
    { label: 'Availability', value: 'Open to collaborate' },
    { label: 'Project Type', value: 'Travel, portfolio, personal brand' },
  ],
  expertise: [
    { title: 'Travel Storytelling', text: 'Sharing places, moments, and experiences through clean visuals and simple storytelling.' },
    { title: 'Portfolio Presentation', text: 'Organizing photos, work, and personal identity into a polished modern portfolio.' },
    { title: 'Creative Direction', text: 'Choosing layout, mood, color, and content flow so the page feels professional and personal.' },
  ],
  skills: ['Travel Content', 'Portfolio Design', 'Photo Gallery', 'Personal Branding', 'Figma', 'Canva', 'Basic Web', 'Visual Story'],
  education: [
    { year: '2024 - Present', title: 'Creative Portfolio Building', text: 'Learning how to present personal work, travel content, and visual stories professionally.' },
    { year: '2022 - 2024', title: 'Creative Design Practice', text: 'Focused on layout, color, typography, portfolio design, and clean user experience.' },
  ],
  ctaText: 'Connect With Me',
  ctaPath: '/contact',
};

const buildDefaultTabs = (content = DEFAULT_ABOUT_CONTENT) => [
  { id: 'expertise', type: 'expertise', title: 'What I Work With', visible: true, items: content.expertise },
  { id: 'personalInfo', type: 'info', title: 'Personal Info', visible: true, items: content.personalInfo },
  { id: 'skills', type: 'skills', title: 'Skills & Tools', visible: true, items: content.skills },
  { id: 'education', type: 'education', title: 'Education', visible: true, items: content.education },
];

const normalizeAboutTabs = (tabs = [], content = DEFAULT_ABOUT_CONTENT) => {
  const savedTabs = Array.isArray(tabs) ? tabs : [];
  const defaultTabs = buildDefaultTabs(content).map((defaultTab) => {
    const savedTab = savedTabs.find((tab) => tab.id === defaultTab.id || tab.type === defaultTab.type) || {};
    return {
      ...defaultTab,
      ...savedTab,
      title: savedTab.title || defaultTab.title,
      visible: savedTab.visible !== false,
      items: Array.isArray(savedTab.items) && savedTab.items.length ? savedTab.items : defaultTab.items,
    };
  });
  const customTabs = savedTabs
    .filter((tab) => tab.type === 'custom' && tab.title && tab.text)
    .map((tab) => ({ ...tab, visible: tab.visible !== false }));

  return [...defaultTabs, ...customTabs];
};

const normalizeAboutContent = (content = {}) => ({
  ...DEFAULT_ABOUT_CONTENT,
  ...content,
  personalInfo: Array.isArray(content.personalInfo) && content.personalInfo.length ? content.personalInfo : DEFAULT_ABOUT_CONTENT.personalInfo,
  expertise: Array.isArray(content.expertise) && content.expertise.length ? content.expertise : DEFAULT_ABOUT_CONTENT.expertise,
  skills: Array.isArray(content.skills) && content.skills.length ? content.skills : DEFAULT_ABOUT_CONTENT.skills,
  education: Array.isArray(content.education) && content.education.length ? content.education : DEFAULT_ABOUT_CONTENT.education,
  tabs: normalizeAboutTabs(content.tabs, {
    ...DEFAULT_ABOUT_CONTENT,
    ...content,
    personalInfo: Array.isArray(content.personalInfo) && content.personalInfo.length ? content.personalInfo : DEFAULT_ABOUT_CONTENT.personalInfo,
    expertise: Array.isArray(content.expertise) && content.expertise.length ? content.expertise : DEFAULT_ABOUT_CONTENT.expertise,
    skills: Array.isArray(content.skills) && content.skills.length ? content.skills : DEFAULT_ABOUT_CONTENT.skills,
    education: Array.isArray(content.education) && content.education.length ? content.education : DEFAULT_ABOUT_CONTENT.education,
  }),
});

const renderAboutTabContent = (tab) => {
  if (tab.type === 'expertise') {
    return (
      <div className="about_expertise_grid">
        {(tab.items || []).map((item) => (
          <article className="about_expertise_item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    );
  }

  if (tab.type === 'info') {
    return (
      <div className="about_info_grid">
        {(tab.items || []).map((item) => (
          <div className="about_info_item" key={`${item.label}-${item.value}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (tab.type === 'skills') {
    return (
      <div className="about_skill_list">
        {(tab.items || []).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    );
  }

  if (tab.type === 'education') {
    return (
      <div className="about_education_list">
        {(tab.items || []).map((item) => (
          <article className="about_education_item" key={`${item.year}-${item.title}`}>
            <span>{item.year}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    );
  }

  return <div className="about_custom_tab">{String(tab.text || '').split('\n').filter(Boolean).map((line) => <p key={line}>{line}</p>)}</div>;
};

const readAboutCache = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(ABOUT_CACHE_KEY));
    return cached?.content ? normalizeAboutContent(cached.content) : DEFAULT_ABOUT_CONTENT;
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
};

const writeAboutCache = (content) => {
  try {
    localStorage.setItem(ABOUT_CACHE_KEY, JSON.stringify({ content, savedAt: Date.now() }));
  } catch {
    // Cache is optional.
  }
};

const About = () => {
  const [content, setContent] = useState(readAboutCache);
  const aboutImage = content.image || profileImage;
  const visibleTabs = (content.tabs || []).filter((tab) => tab.visible !== false);

  useEffect(() => {
    let active = true;

    api
      .get('/site/about')
      .then((res) => {
        const nextContent = Object.prototype.hasOwnProperty.call(res.data || {}, 'content')
          ? res.data.content
          : res.data;
        const normalized = normalizeAboutContent(nextContent);
        if (active) {
          setContent(normalized);
          writeAboutCache(normalized);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="about about_clean min-h-screen">
      <section className="about_clean_inner">
        <div className="about_clean_image">
          <img src={aboutImage} alt={content.name} />
          <div className="about_image_badge">
            <span></span>
            {content.status}
          </div>
        </div>

        <div className="about_clean_content">
          <span className="about_clean_label">{content.label}</span>
          <h1>{content.title}</h1>
          <p className="about_clean_description">{content.description}</p>

          {visibleTabs.map((tab) => (
            <div className="about_clean_section" key={tab.id}>
              <h2>{tab.title}</h2>
              {renderAboutTabContent(tab)}
            </div>
          ))}

          <a href={content.ctaPath} className="about_connect_btn">
            <Icon icon="send" />
            {content.ctaText}
          </a>
        </div>
      </section>
    </main>
  );
};

export default About;
