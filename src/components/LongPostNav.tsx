import { useEffect, useRef, useState } from 'react';
import './LongPostNav.css';

type Props = {
  homeHref: string;
  postsHref: string;
  postsLabel: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function trackNavigation(action: 'top' | 'home' | 'posts' | 'menu'): void {
  window.gtag?.('event', 'long_post_navigation', { action });
}

export function LongPostNav({ homeHref, postsHref, postsLabel }: Props) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVisibility = () => {
      const shouldShow = window.scrollY > Math.max(640, window.innerHeight * 0.8);
      setVisible(shouldShow);
      if (!shouldShow) setOpen(false);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (open && rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [open]);

  const goToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setOpen(false);
    trackNavigation('top');
  };

  return (
    <div ref={rootRef} className={`long-post-nav${visible ? ' long-post-nav--visible' : ''}${open ? ' long-post-nav--open' : ''}`}>
      {open ? (
        <nav id="long-post-nav-menu" className="long-post-nav__panel" aria-label="Post navigation">
          <a href={homeHref} onClick={() => trackNavigation('home')}>Home</a>
          <a href={postsHref} onClick={() => trackNavigation('posts')}>{postsLabel}</a>
        </nav>
      ) : null}
      <div className="long-post-nav__controls">
        <button type="button" className="long-post-nav__button long-post-nav__button--top" onClick={goToTop} tabIndex={visible ? 0 : -1}>
          <span aria-hidden="true">↑</span><span>Top</span>
        </button>
        <button
          type="button"
          className="long-post-nav__button"
          aria-expanded={open}
          aria-controls="long-post-nav-menu"
          onClick={() => { setOpen((current) => !current); trackNavigation('menu'); }}
          tabIndex={visible ? 0 : -1}
        >
          <span aria-hidden="true">☰</span><span>Menu</span>
        </button>
      </div>
    </div>
  );
}
