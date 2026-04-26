export function PageIntro({
  pill,
  title,
  subtitle,
  notice,
}: {
  pill: string;
  title: string;
  subtitle?: string;
  notice?: string;
}) {
  return (
    <section className="doc-hero">
      <div className="doc-pill">{pill}</div>
      <h1 className="doc-title">{title}</h1>
      {subtitle ? <p className="doc-subtitle">{subtitle}</p> : null}
      {notice ? <div className="doc-notice">{notice}</div> : null}
    </section>
  );
}
