import { useEffect, useRef, useState } from 'react';
import logo from './assets/logo.svg';
import { clubName, clubTitle, contacts, sections, university } from './site-data.js';

const phoneIcon = <path d="M22 16.92v3a2 2 0 0 1-2.18 2A18 18 0 0 1 4.1 12.2 18 18 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72l.7 3a2 2 0 0 1-.45 2.11L8.1 10.1a14 14 0 0 0 5.8 5.8l1.27-1.27a2 2 0 0 1 2.1-.45l3 .7A2 2 0 0 1 22 16.92z" />;
const contactIcons = {
  phone: phoneIcon,
  email: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3.2 7 8.8 6 8.8-6" /></>,
  telegram: <path d="m21.5 3.5-19 7.2 6.2 2.4 2.5 6.1 3-4 4.7 3.4 2.6-15.1zM8.7 13.1l7.6-5.2" />,
};

function HeaderIcon({ children, variant = '' }) {
  return <svg className={`header-icon ${variant}`} viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

function JoinLink({ mobile = false }) {
  return (
    <a href="#join" className={mobile ? 'header-join header-join-mobile' : 'header-join'}>
      <HeaderIcon><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3.5v4m9-4v4m-13 3H20" /></HeaderIcon>
      <span>Записаться{!mobile && <span className="header-mobile-copy"> на курс</span>}</span>
    </a>
  );
}

export default function SiteHeader({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    const measure = () => header.style.setProperty('--menu-bar-height', `${header.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const mobileHeader = window.matchMedia('(max-width: 1239px)');
    const close = () => setMenuOpen(false);
    function onEscape(event) {
      if (event.key !== 'Escape') return;
      close();
      toggleRef.current.focus();
    }
    function onOutsideClick(event) {
      if (!headerRef.current.contains(event.target)) close();
    }

    document.addEventListener('keydown', onEscape);
    document.addEventListener('click', onOutsideClick);
    mobileHeader.addEventListener('change', close);
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('click', onOutsideClick);
      mobileHeader.removeEventListener('change', close);
    };
  }, [menuOpen]);

  function closeOnBlur(event) {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
  }

  function closeOnNavigate(event) {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.target.closest('a[href^="#"]')) {
      setMenuOpen(false);
    }
  }

  return (
    <>
      <header className="site-header menu-ready" ref={headerRef} onBlur={closeOnBlur} onClick={closeOnNavigate}>
        <a href="#surface" className="brand" aria-label={clubName}>
          <img src={logo} width="42" height="42" alt="" />
          <span>{clubTitle}<small>{university}</small></span>
        </a>
        <JoinLink mobile />
        <button
          ref={toggleRef}
          type="button"
          className="header-menu-toggle"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="header-panel"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <HeaderIcon variant="icon-open"><path d="M3 5.5h18M3 12h18M3 18.5h18" /></HeaderIcon>
          <HeaderIcon variant="icon-close"><path d="m5 5 14 14M19 5 5 19" /></HeaderIcon>
        </button>
        <div className="header-panel" id="header-panel">
          <nav className="header-nav" aria-label="Разделы сайта">
            {sections.slice(0, -1).map(({ id, label }) => (
              <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>
            ))}
          </nav>
          <div className="header-contacts" role="group" aria-label="Контакты клуба">
            {Object.entries(contacts).map(([type, { href, label }]) => (
              <a key={type} href={href}><HeaderIcon>{contactIcons[type]}</HeaderIcon><span>{label}</span></a>
            ))}
          </div>
          <JoinLink />
        </div>
      </header>
      <div className="header-scrim" aria-hidden="true" hidden={!menuOpen} />
    </>
  );
}
