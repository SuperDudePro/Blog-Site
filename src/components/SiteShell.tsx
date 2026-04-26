import type { ReactNode } from 'react';
import { navigation, site } from '../data/siteContent';
import { SmileyMark } from './SmileyMark';

type Props = {
  children: ReactNode;
};

function getCurrentHash() {
  return window.location.hash || '#/';
}

function isActive(href: string) {
  const current = getCurrentHash();
  if (href === '#/') {
    return current === '#/' || current === '#';
  }
  return current === href;
}

export function SiteShell({ children }: Props) {
  const currentHash = getCurrentHash();
  const homeActive = currentHash === '#/' || currentHash === '#';

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <a className={`site-brand ${homeActive ? 'site-brand--active' : ''}`} href="#/">
            <span className="site-brand__row">
              <SmileyMark size={28} />
              <h2 className="site-brand__title">{site.title}</h2>
            </span>
            <span className="site-brand__tag">{site.headerTagline ?? site.tagline}</span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`site-nav__link ${isActive(item.href) ? 'is-active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="site-main" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <p className={`site-footer__title ${homeActive ? 'is-active' : ''}`}>
              <span className="site-brand__row site-brand__row--footer">
                <SmileyMark size={24} />
                <span>{site.title}</span>
              </span>
            </p>
            <p className="site-footer__copy">{site.footerNote}</p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`site-footer__link ${isActive(item.href) ? 'is-active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
