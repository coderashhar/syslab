"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, FlaskConical } from "lucide-react";

const COMPLETION_STORAGE_KEY = "syslab-rate-limiting-completions";
const defaultCompletedLessons = { "token-bucket": true };

export default function LessonLayout({ children, active = "token-bucket", completionId = active }) {
  const [completedLessons, setCompletedLessons] = useState(defaultCompletedLessons);
  const lessons = [{ id: "token-bucket", label: "Token Bucket", href: "/learn/rate-limiting/token-bucket" }, { id: "leaky-bucket", label: "Leaky Bucket", href: "/learn/rate-limiting/leaky-bucket" }, { id: "fixed-window", label: "Fixed Window", href: "/learn/rate-limiting/fixed-window" }, { id: "sliding-log", label: "Sliding Window Log", href: "/learn/rate-limiting/sliding-log" }, { id: "sliding-counter", label: "Sliding Window Counter", href: "/learn/rate-limiting/sliding-counter" }];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COMPLETION_STORAGE_KEY);
      if (stored) setCompletedLessons({ ...defaultCompletedLessons, ...JSON.parse(stored) });
    } catch {
      // Keep the default completion state when browser storage is unavailable.
    }
  }, []);

  function completeLesson() {
    if (!completionId || completedLessons[completionId]) return;
    const next = { ...completedLessons, [completionId]: true };
    setCompletedLessons(next);
    try {
      window.localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The in-memory state still gives immediate feedback when storage is unavailable.
    }
  }

  return <div className="page-wrap"><div style={{ display: "grid", gridTemplateColumns: "210px minmax(0, 1fr)", gap: 46, alignItems: "start" }}><aside style={{ position: "sticky", top: 104 }}><div className="eyebrow" style={{ marginBottom: 13 }}>Rate limiting</div>{lessons.map((lesson, index) => <Link key={lesson.id} href={lesson.href} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 0", color: active === lesson.id ? "#f1edff" : "#8c899b", fontSize: 12, borderBottom: "1px solid #242431" }}><span className="mono" style={{ width: 18, color: active === lesson.id ? "#a78bfa" : "#5c596b" }}>{String(index + 1).padStart(2, "0")}</span><span style={{ flex: 1 }}>{lesson.label}</span>{completedLessons[lesson.id] && <CheckCircle2 size={13} color="#7be69b" />}</Link>)}<div className="surface" style={{ padding: 13, marginTop: 24, background: "#1b1830" }}><FlaskConical size={16} color="#a78bfa" /><div style={{ fontSize: 12, fontWeight: 700, marginTop: 9 }}>Ready to test it?</div><div className="muted" style={{ fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>Open the playground and send your own traffic.</div><Link href="/playground" style={{ color: "#c5b7ff", display: "flex", alignItems: "center", gap: 5, fontSize: 11, marginTop: 12 }}>Open lab <ArrowRight size={13} /></Link></div></aside><article>{children}{completionId && <div className="lesson-completion"><button type="button" className={`lesson-completion-button${completedLessons[completionId] ? " completed" : ""}`} onClick={completeLesson} disabled={completedLessons[completionId]}><Check size={15} />{completedLessons[completionId] ? "Lesson completed" : "Mark lesson complete"}</button></div>}</article></div></div>;
}
