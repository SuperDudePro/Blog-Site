import { NAV_ITEMS } from "../data/site";

export function SiteNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <div className="site-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isCurrent = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(`${item.href}/`));
          return (
            <a
              key={item.href}
              href={item.href}
              className={isCurrent ? "site-nav-link site-nav-link-active" : "site-nav-link"}
              aria-current={isCurrent ? "page" : undefined}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
