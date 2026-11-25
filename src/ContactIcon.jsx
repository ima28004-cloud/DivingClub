const contactIcons = {
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2A18 18 0 0 1 4.1 12.2 18 18 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72l.7 3a2 2 0 0 1-.45 2.11L8.1 10.1a14 14 0 0 0 5.8 5.8l1.27-1.27a2 2 0 0 1 2.1-.45l3 .7A2 2 0 0 1 22 16.92z" />,
  email: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3.2 7 8.8 6 8.8-6" /></>,
  telegram: <path d="m21.5 3.5-19 7.2 6.2 2.4 2.5 6.1 3-4 4.7 3.4 2.6-15.1zM8.7 13.1l7.6-5.2" />,
};

export default function ContactIcon({ type, className = 'contact-icon' }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{contactIcons[type]}</svg>;
}
