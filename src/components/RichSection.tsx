export function RichSection({
  heading,
  body,
  bullets,
  footer,
}: {
  heading: string;
  body?: string[];
  bullets?: string[];
  footer?: string;
}) {
  return (
    <section className="doc-section">
      <h2 className="doc-section-title">{heading}</h2>
      {body?.map((paragraph) => (
        <p key={paragraph} className="doc-section-text">
          {paragraph}
        </p>
      ))}
      {bullets?.length ? (
        <ul className="doc-list">
          {bullets.map((item) => (
            <li key={item} className="doc-list-item">
              <span className="doc-list-dot" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {footer ? <p className="doc-section-text">{footer}</p> : null}
    </section>
  );
}
