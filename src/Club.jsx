import { CatalogSection, Kicker } from './Catalog.jsx';
import { clubName, contacts } from './site-data.js';
import poolLesson from './assets/pool-lesson.webp';
import openWaterLesson from './assets/open-water-lesson.webp';
import underwaterLesson from './assets/underwater-lesson.webp';
import clubTrip from './assets/club-trip.webp';
import poolArchive from './assets/pool-archive.webp';
import openWaterArchive from './assets/open-water-archive.webp';
import poolTraining from './assets/pool-training.webp';
import clubPool from './assets/club-pool.webp';

const photos = [
  [poolLesson, 1000, 666, 'Занятие по дайвингу в бассейне', 'Занятия в бассейне'],
  [openWaterLesson, 1280, 853, 'Занятие дайверов в открытой воде', 'Открытая вода'],
  [underwaterLesson, 526, 370, 'Дайверы на подводном занятии', 'Подводные занятия'],
  [clubTrip, 1000, 563, 'Участники клуба на выезде', 'Выезд клуба'],
  [poolArchive, 1000, 563, 'Кадр из архива занятий в бассейне'],
  [openWaterArchive, 1000, 656, 'Кадр из архива занятий на открытой воде'],
  [poolTraining, 800, 533, 'Кадр тренировки в бассейне'],
  [clubPool, 1000, 666, 'Фото клуба с занятия в бассейне'],
];

export function About({ section }) {
  return (
    <CatalogSection
      {...section}
      category="Команда"
      title="О клубе"
      description="Клуб объединяет тех, кто хочет освоить подводное плавание. Участники отрабатывают навыки в бассейне, тренируются на открытой воде и выезжают в экспедиции в различные регионы России."
    >
      <div className="club-collage" role="group" aria-labelledby="collage-title">
        <h3 id="collage-title">Занятия и выезды клуба</h3>
        <div className="collage-grid">
          {photos.map(([src, width, height, alt, caption]) => (
            <figure className="collage-photo" key={src}>
              <img src={src} width={width} height={height} alt={alt} loading="lazy" />
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </CatalogSection>
  );
}

export function Location({ section }) {
  return (
    <CatalogSection {...section} category="Адрес клуба" title="Маршрут до клуба">
      <div className="location-grid">
        <div className="location-info">
          <h3>{clubName}</h3>
          <address>Москва, проспект Вернадского, 78, стр. 5</address>
          <p>Ближайшее метро — «Юго-Западная». Перед первым занятием уточните у инструктора, где вас встретят на территории кампуса.</p>
          <div className="location-actions">
            <a className="button" href="https://yandex.ru/maps/?rtext=55.663654%2C37.483219~55.668299%2C37.484041&rtt=pd" target="_blank" rel="noopener">Пешком от «Юго-Западной»</a>
            <a className="text-link" href="https://yandex.ru/maps/?rtext=~55.668299%2C37.484041" target="_blank" rel="noopener">Маршрут из другой точки</a>
          </div>
        </div>
        <figure className="location-map">
          <iframe
            title={`${clubName} на Яндекс Картах`}
            src="https://yandex.ru/map-widget/v1/?z=16&ol=biz&oid=178744849408"
            width="760"
            height="420"
            loading="lazy"
          />
          <figcaption>
            Для загрузки карты нужен интернет.{' '}
            <a href="https://yandex.ru/maps/org/dayving_klub_rtu_mirea/178744849408/" target="_blank" rel="noopener">Открыть метку в Яндекс Картах</a>
          </figcaption>
        </figure>
      </div>
    </CatalogSection>
  );
}

export function Join({ section }) {
  return (
    <section className="scene join" id={section.id} data-depth={section.depth} aria-labelledby="join-title" tabIndex={-1}>
      <div className="content join-content">
        <Kicker depth={section.depth}>Участие</Kicker>
        <h2 id="join-title">Записаться на курс</h2>
        <p>Специалисты помогут Вам выбрать подходящую программу и подскажут всё необходимое для интересных и эффективных тренировок</p>
        <p className="join-address"><a href="#location">Проспект Вернадского, 78, стр. 5</a></p>
        <a className="button" href={contacts.phone.href} aria-label={`Позвонить в клуб, ${contacts.phone.label}`}>
          {contacts.phone.label}
        </a>
        <div className="contact-links">
          <a href={contacts.email.href}>Написать инструктору</a>
          <a href={contacts.telegram.href}>Клуб в Telegram</a>
        </div>
      </div>
    </section>
  );
}
