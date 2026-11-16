import { useEffect, useState, type ReactNode } from 'react';
import { navigation, site } from '../data/siteContent';
import { homePath, normalizePath } from '../routes';
import { SmileyMark } from './SmileyMark';
import { SiteLink } from './SiteLink';
import { SubscribeForm } from './SubscribeForm';

type Props = {
  children: ReactNode;
};

const primaryNavigation = navigation.filter((item) => item.label !== 'Everything');
const footerNavigation = primaryNavigation;

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
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [currentPath]);
  const navLinks = (mobile: boolean) => primaryNavigation.map((item) => (
    <SiteLink
      key={item.href}
      href={item.href}
      onClick={() => { if (mobile) setMenuOpen(false); }}
      className={`site-nav__link ${isActive(item.href) ? 'is-active' : ''}`}
      aria-current={isActive(item.href) ? 'page' : undefined}
    >{item.label}</SiteLink>
  ));

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
              <span className="site-brand__title">{site.title}</span>
            </span>
            <span className="site-brand__tag">{site.headerTagline ?? site.tagline}</span>
          </SiteLink>

          <nav className="site-nav" aria-label="Primary navigation">
            <div className="site-nav__desktop">{navLinks(false)}</div>
            <div className="site-nav__compact">
              <button type="button" className="site-nav__toggle" aria-expanded={menuOpen} aria-controls="ood-mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
                {menuOpen ? 'Close menu' : 'Explore site'} <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
              </button>
              <div id="ood-mobile-navigation" className="site-nav__mobile-links" hidden={!menuOpen}>{navLinks(true)}</div>
            </div>
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
            <p className="site-footer__copy">
              <a href={site.youtubeUrl} target="_blank" rel="noopener noreferrer">Our Old Dad on YouTube</a>
              <span aria-hidden="true"> · </span>
              <a href="/rss.xml">RSS feed</a>
            </p>
          </div>

          <SubscribeForm compact />

          <nav
            className="site-footer__nav"
            aria-label="Footer navigation"
            style={{
              alignItems: 'flex-start',
              alignSelf: 'flex-start',
              flexWrap: 'nowrap',
              gap: '0.25rem',
            }}
          >
            {footerNavigation.map((item) => (
              <SiteLink
                key={item.href}
                href={item.href}
                className={`site-footer__link ${isActive(item.href) ? 'is-active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
                style={{ alignSelf: 'flex-start', paddingInline: '0.7rem' }}
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
