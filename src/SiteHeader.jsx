import { useEffect, useRef, useState } from 'react';
import logo from './assets/logo.svg';
import ContactIcon from './ContactIcon.jsx';
import { clubName, clubTitle, contacts, sections, university } from './site-data.js';

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
              <a key={type} href={href}><ContactIcon type={type} className="header-icon" /><span>{label}</span></a>
            ))}
          </div>
          <JoinLink />
        </div>
      </header>
      <div className="header-scrim" aria-hidden="true" hidden={!menuOpen} />
    </>
  );
}
