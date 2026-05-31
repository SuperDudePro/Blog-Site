import type { ReactNode } from 'react';
import { navigation, site } from '../data/siteContent';
import { homePath, normalizePath } from '../routes';
import { SmileyMark } from './SmileyMark';
import { SiteLink } from './SiteLink';

type Props = {
  children: ReactNode;
};

function getCurrentPath() {
  return normalizePath(window.location.pathname);
}

function isActive(href: string) {
  const current = getCurrentPath();
  if (href === homePath) {
    return current === homePath;
  }
  return current === href;
}

export function SiteShell({ children }: Props) {
  const currentPath = getCurrentPath();
  const homeActive = currentPath === homePath;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <SiteLink className={`site-brand ${homeActive ? 'site-brand--active' : ''}`} href={homePath}>
            <span className="site-brand__row">
              <SmileyMark size={28} />
              <h2 className="site-brand__title">{site.title}</h2>
            </span>
            <span className="site-brand__tag">{site.headerTagline ?? site.tagline}</span>
          </SiteLink>

          <nav className="site-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <SiteLink
                key={item.href}
                href={item.href}
                className={`site-nav__link ${isActive(item.href) ? 'is-active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </SiteLink>
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
              <SiteLink
                key={item.href}
                href={item.href}
                className={`site-footer__link ${isActive(item.href) ? 'is-active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </SiteLink>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
