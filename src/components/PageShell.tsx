import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { normalizePath } from "../utils/routing";

export function PageShell({ children }: { children: ReactNode }) {
  const currentPath = normalizePath(window.location.pathname || "/");
  return (
    <div className="page">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="shell">
        <header className="header">
          <a href="/" aria-label="LifeEducation home">
            <div className="brand" aria-hidden="true">LifeEducation.org</div>
          </a>
        </header>
        <SiteNav currentPath={currentPath} />
        <main id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
