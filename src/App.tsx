import { useEffect, useMemo, useState } from "react";
import { TREE_FAVICON } from "./data/site";
import { DOMAINS } from "./data/domainsData";
import { normalizePath } from "./utils/routing";
import { HomePage } from "./pages/HomePage";
import { WhyPage } from "./pages/WhyPage";
import { By18Page } from "./pages/By18Page";
import { FloorPage } from "./pages/FloorPage";
import { DomainsPage } from "./pages/DomainsPage";
import { DomainDetailPage } from "./pages/DomainDetailPage";
import { QAPage } from "./pages/QAPage";
import { PostsPage } from "./pages/PostsPage";
import { PostPage } from "./pages/PostPage";

export default function App() {
  useEffect(() => {
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = TREE_FAVICON;
  }, []);

  const [pathname, setPathname] = useState<string>(() => normalizePath(window.location.pathname || "/"));

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname || "/"));
    window.addEventListener("popstate", onPopState);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http") || href.startsWith("#")) return;

      const nextUrl = new URL(href, window.location.origin);
      if (nextUrl.origin !== window.location.origin) return;

      const nextPath = normalizePath(nextUrl.pathname);
      if (nextPath.includes(".")) return;

      event.preventDefault();
      if (nextPath !== pathname) {
        window.history.pushState({}, "", nextPath);
        setPathname(nextPath);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  useEffect(() => {
    const titleMap: Record<string, string> = {
      "/": "LifeEducation.org",
      "/why": "Why LifeEducation.org Exists",
      "/floor": "The 18-Year-Old Floor | LifeEducation.org",
      "/by-18": "By 18: What You Can Do | LifeEducation.org",
      "/domains": "10 Domains | LifeEducation.org",
      "/posts": "Posts | LifeEducation.org",
      "/qa": "LifeEducation Q&A",
    };

    if (pathname.startsWith("/posts/")) {
      document.title = "Post | LifeEducation.org";
      return;
    }

    if (pathname.startsWith("/domains/")) {
      const slug = pathname.replace("/domains/", "");
      const domain = DOMAINS.find((item) => item.slug === slug);
      document.title = domain ? `${domain.title} | LifeEducation.org` : "Domain not found | LifeEducation.org";
      return;
    }

    document.title = titleMap[pathname] ?? "LifeEducation.org";
  }, [pathname]);

  const page = useMemo(() => {
    if (pathname === "/why") return <WhyPage />;
    if (pathname === "/by-18") return <By18Page />;
    if (pathname === "/floor") return <FloorPage />;
    if (pathname === "/qa") return <QAPage />;
    if (pathname === "/posts") return <PostsPage />;
    if (pathname.startsWith("/posts/")) return <PostPage slug={pathname.replace("/posts/", "")} />;
    if (pathname === "/domains") return <DomainsPage />;
    if (pathname.startsWith("/domains/")) {
      return <DomainDetailPage slug={pathname.replace("/domains/", "")} />;
    }
    return <HomePage />;
  }, [pathname]);

  return <>{page}</>;
}
