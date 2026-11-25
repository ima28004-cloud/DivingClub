import { useLayoutEffect, useRef } from 'react';
import SiteHeader from './SiteHeader.jsx';
import { About, Join, Location } from './Club.jsx';
import { Equipment, Specialties, Training } from './Catalog.jsx';
import { OceanBubbles, useDiveMotion, useWaterRefraction } from './motion.jsx';
import { centerName, sections } from './site-data.js';
import heroImage from './assets/hero.webp';

function Hero({ section }) {
  const heroRef = useRef(null);
  useWaterRefraction(heroRef);

  return (
    <section className="scene hero" id={section.id} data-depth={section.depth} aria-labelledby="title" tabIndex={-1} ref={heroRef}>
      <div className="hero-media refract" data-water aria-hidden="true">
        <img src={heroImage} width="1672" height="941" fetchPriority="high" alt="" />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content content">
        <div className="water-title refract" data-water-text>
          <h1 id="title"><span>Дайвинг-центр</span><br />{' '}<span>ВУЦ РТУ МИРЭА</span></h1>
        </div>
        <div className="hero-summary">
          <p>Обучение дайвингу в Москве: полный путь от новичка до профессионала.</p>
          <p>Пробные занятия, базовые и продвинутые курсы, специализации.</p>
          <p>Международная сертификация — Scuba Schools International (SSI)</p>
        </div>
        <div className="hero-actions">
          <a className="button" href="#join"><i className="dive-icon" aria-hidden="true" />Записаться на курс</a>
          <a className="text-link" href="#practice">Посмотреть курсы</a>
        </div>
      </div>
      <a className="scroll-cue" href="#practice"><i aria-hidden="true" />Листайте, чтобы погрузиться</a>
    </section>
  );
}

function DepthGauge({ depth, activeSection }) {
  const maxDepth = sections.at(-1).depth;
  return (
    <nav className="depth" aria-label="Шкала виртуального погружения">
      <div className="depth-heading">Глубина</div>
      <div className="depth-reading"><span>{String(depth).padStart(2, '0')}</span> <span>м</span></div>
      <div className="depth-scale">
        <span className="depth-cursor" aria-hidden="true" />
        {sections.map(({ id, depth, label }) => (
          <a
            key={id}
            href={`#${id}`}
            style={{ '--mark': `${depth / maxDepth * 100}%` }}
            aria-label={`${depth} м — ${label}`}
            aria-current={activeSection === id ? 'location' : undefined}
          >{depth}</a>
        ))}
      </div>
    </nav>
  );
}

const sectionComponents = { surface: Hero, club: About, practice: Training, courses: Specialties, rental: Equipment, location: Location, join: Join };

function navigateToSection(event) {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest('a[href^="#"]');
  const target = anchor && document.getElementById(anchor.hash.slice(1));
  if (!target) return;

  event.preventDefault();
  if (anchor.hash !== window.location.hash) window.history.pushState(null, '', anchor.hash);
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: 'instant' });
}

export default function App() {
  const mainRef = useRef(null);
  const { depth, activeSection } = useDiveMotion(sections, mainRef);

  useLayoutEffect(() => {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <div onClick={navigateToSection}>
      <OceanBubbles />
      <a className="skip" href="#content">Перейти к содержанию</a>
      <SiteHeader activeSection={activeSection} />
      <main id="content" ref={mainRef} tabIndex={-1}>
        {sections.map((section) => {
          const Section = sectionComponents[section.id];
          return <Section key={section.id} section={section} />;
        })}
      </main>
      <DepthGauge depth={depth} activeSection={activeSection} />
      <footer className="footer">
        <div className="content footer-inner">
          <span>{centerName}</span>
          <span className="footer-note">Шкала показывает виртуальную глубину</span>
          <a href="#surface">На поверхность</a>
          <p className="footer-note footer-disclaimer">Информация на сайте носит ознакомительный характер и не является публичной офертой.</p>
        </div>
      </footer>
    </div>
  );
}
