import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  children: ReactNode;
};

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey;
}

export function navigateTo(href: string, replace = false) {
  const url = new URL(href, window.location.origin);
  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextPath === currentPath) {
    return;
  }

  if (replace) {
    window.history.replaceState(null, '', nextPath);
  } else {
    window.history.pushState(null, '', nextPath);
  }

  window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
}

export function SiteLink({ href, children, onClick, target, ...props }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (event.defaultPrevented || target || !isPlainLeftClick(event)) {
      return;
    }

    const url = new URL(href, window.location.origin);

    if (url.origin !== window.location.origin) {
      return;
    }

    event.preventDefault();
    navigateTo(`${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <a {...props} href={href} target={target} onClick={handleClick}>
      {children}
    </a>
  );
}
