const training = [
  ['Вводный курс', 'Знакомство с дайвингом и снаряжением под руководством инструктора.', 7000],
  ['Базовый курс в закрытой воде', 'Теория, упражнения в бассейне и подготовка к следующему этапу.', 42000],
  ['Базовый курс в открытой воде', 'Продолжение обучения в открытой воде. Условия оформления Open Water Diver SSI уточняйте при записи.', 28000],
  ['Продвинутый дайвер', 'Курс в открытой воде для тех, кто уже освоил базовые навыки.', 48000],
];

const specialties = [
  ['Стресс и спасение', 49000],
  ['Сухой костюм', 31500],
  ['Подлёдный дайвинг', 31500],
  ['Погружения с боковым креплением баллонов', 31500],
  ['Идеальная плавучесть', 28500],
  ['Подводное ориентирование', 31500],
  ['Ночные погружения', 23500],
  ['Погружения на найтроксе', 13500],
  ['Глубокие погружения', 31500],
  ['Погружения к затонувшим объектам', 31500],
  ['Наука дайвинга', 28500],
  ['Первая помощь, СЛР, дефибрилляция и помощь с кислородом', 20500],
];

const skillsUpdate = [['Scuba Skills Update индивидуально', 7000]];

const rental = [
  ['Комплект для дайвинга в бассейне: гидрокостюм, жилет, регулятор, маска и ласты', 400],
  ['Комплект для снорклинга: маска, трубка и ласты', 100],
  ['Один элемент комплекта для снорклинга', 50],
  ['Второй баллон или спарка', 400],
  ['Сухой костюм для бассейна', 1500],
  ['Сухой костюм для открытой воды', 2500],
  ['Второй холодноводный регулятор', 500],
];

const services = [
  ['Самостоятельное погружение, 2,5 часа, для сертифицированных дайверов', 500],
  ['Занятие с инструктором, 2,5 часа, индивидуально', 7000],
  ['Заправка до 200 атм, за литр объёма баллона', 30],
  ['Заправка до 300 атм, за литр объёма баллона', 50],
  ['Ремонт регулятора, запчасти отдельно', 7500],
];

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function Kicker({ depth, children }) {
  return <p className="kicker"><span />{depth} м <b /> {children}</p>;
}

export function CatalogSection({ id, depth, category, title, description, signup = false, children }) {
  const titleId = `${id}-title`;
  return (
    <section className="scene catalog-section" id={id} data-depth={depth} aria-labelledby={titleId} tabIndex={-1}>
      <div className="content">
        <header className="catalog-heading">
          <Kicker depth={depth}>{category}</Kicker>
          <h2 id={titleId}>{title}</h2>
          {description && <p>{description}</p>}
          {signup && <a className="button catalog-cta" href="#join">Записаться</a>}
        </header>
        {children}
      </div>
    </section>
  );
}

function PriceList({ items }) {
  return (
    <dl className="price-list">
      {items.map(([name, price]) => (
        <div key={name}><dt>{name}</dt><dd>{rubles.format(price)}</dd></div>
      ))}
    </dl>
  );
}

function ServiceCard({ title, items }) {
  return <article className="service-card"><h3>{title}</h3><PriceList items={items} /></article>;
}

export function Training({ section }) {
  return (
    <CatalogSection
      {...section}
      category="Обучение"
      title="Путь дайвера"
      description="Начните с вводного занятия. Инструктор поможет разобраться со снаряжением, объяснит упражнения в бассейне и подскажет, как продолжить обучение в открытой воде."
      signup
    >
      <div className="price-grid">
        {training.map(([name, description, price]) => (
          <article className="price-card" key={name}>
            <h3>{name}</h3><p>{description}</p><strong>{rubles.format(price)}</strong>
          </article>
        ))}
      </div>
      <div className="course-note">
        <p>Базовый курс в закрытой воде включает теорию и занятия в бассейне. Возможность получить Referral Diver SSI после бассейна и условия оформления Open Water Diver SSI уточняйте у инструктора.</p>
      </div>
      <div className="course-note">
        <p>Цены по прайсу РТУ МИРЭА за одного человека. Для обучающихся в ВУЦ, студентов второго курса, планирующих поступление в ВУЦ, и других категорий, указанных в прайсе, обучение проводится безвозмездно. Для остальных студентов РТУ МИРЭА действует скидка 20%.</p>
        <a className="text-link" href="https://www.mirea.ru/education/voennyy-uchebnyy-tsentr/kluby/klub-dayvinga/">Таблица цен и условия скидок на mirea.ru</a>
      </div>
    </CatalogSection>
  );
}

export function Specialties({ section }) {
  return (
    <CatalogSection
      {...section}
      category="Специализации"
      title="Дополнительные курсы"
      description="После базового курса можно выбрать специализацию. Стоимость в таблице указана за одного человека по прайсу РТУ МИРЭА."
      signup
    >
      <div className="table-frame">
        <table className="course-table" aria-labelledby="courses-title">
          <thead><tr><th scope="col">Специализация</th><th scope="col">Стоимость</th></tr></thead>
          <tbody>
            {specialties.map(([name, price]) => (
              <tr key={name}><th scope="row">{name}</th><td>{rubles.format(price)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="skills-update">
        <ServiceCard title="Восстановление навыков" items={skillsUpdate} />
      </div>
    </CatalogSection>
  );
}

export function Equipment({ section }) {
  return (
    <CatalogSection
      {...section}
      category="Снаряжение и сервис"
      title="Прокат и погружения"
      description="Перед бронированием уточните стоимость и наличие у клуба."
      signup
    >
      <div className="rental-grid">
        <ServiceCard title="Прокат оборудования" items={rental} />
        <ServiceCard title="Бассейн, заправка и ремонт" items={services} />
      </div>
    </CatalogSection>
  );
}
