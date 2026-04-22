import type { ReactNode } from 'react';
import { navigation, site } from '../data/siteContent';

type Props = {
  children: ReactNode;
};

export function SiteShell({ children }: Props) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="site-brand" href="#/">
            <span className="site-brand__title">{site.title}</span>
            <span className="site-brand__tag">{site.headerTagline ?? site.tagline}</span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="site-nav__link">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <p className="site-footer__title">{site.title}</p>
            <p className="site-footer__copy">{site.footerNote}</p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="site-footer__link">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
