"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, FlaskConical, GitCompareArrows, LayoutGrid, Network, Radio, Swords, Library, Menu } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/playground", label: "Playground", icon: FlaskConical },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/system-design/rate-limiting", label: "System Design", icon: Network },
  { href: "/challenges", label: "Challenges", icon: Swords },
  { href: "/reference", label: "Reference", icon: Library },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className={`shell-grid${sidebarOpen ? "" : " sidebar-collapsed"}`}>
      <aside id="primary-sidebar" className="sidebar" hidden={!sidebarOpen}>
        <div style={{ padding: "24px 20px 20px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 8, background: "#7656e8", color: "white" }}><Radio size={17} /></span>
            <span style={{ fontWeight: 760, letterSpacing: "-.03em", fontSize: 19 }}>SysLab</span>
          </Link>
          <div className="muted" style={{ fontSize: 11, marginTop: 7, paddingLeft: 40 }}>Build your intuition.</div>
        </div>
        <nav className="sidebar-links" style={{ padding: "12px 12px" }} aria-label="Primary navigation">
          <div className="eyebrow" style={{ padding: "10px 11px 8px" }}>Workspace</div>
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 8, marginBottom: 3, color: active ? "#f2efff" : "#9290a1", background: active ? "#27213f" : "transparent", fontSize: 13, fontWeight: active ? 650 : 500 }}><Icon size={16} strokeWidth={1.8} /><span>{label}</span>{label === "Playground" && <span style={{ marginLeft: "auto", fontSize: 10, color: "#a78bfa", background: "#34275c", padding: "2px 6px", borderRadius: 999 }}>NEW</span>}</Link>;
          })}
        </nav>
        <div className="sidebar-footer" style={{ position: "absolute", bottom: 18, left: 20, right: 20, borderTop: "1px solid #292938", paddingTop: 14 }}>
          <div className="muted" style={{ fontSize: 11, lineHeight: 1.5 }}>Interactive lessons for serious system design study.</div>
        </div>
      </aside>
      <main className="main-canvas">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9895a8", fontSize: 12 }}><button type="button" className="icon-btn" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={sidebarOpen} aria-controls="primary-sidebar" title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} onClick={() => setSidebarOpen((open) => !open)}><Menu size={16} /></button><span>Rate limiting module</span><span style={{ color: "#464354" }}>/</span><span style={{ color: "#dbd7ea" }}>{pathname === "/" ? "Overview" : pathname.split("/").filter(Boolean).slice(-1)[0]?.replaceAll("-", " ") || "SysLab"}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="status-dot status-info" /><span className="muted" style={{ fontSize: 12 }}>Client-side sandbox</span></div>
        </header>
        {children}
      </main>
    </div>
  );
}
