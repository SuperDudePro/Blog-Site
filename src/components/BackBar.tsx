import type { ReactNode } from "react";

export function BackBar({ children }: { children: ReactNode }) {
  return <section className="back-bar">{children}</section>;
}
