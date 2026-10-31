import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "SysLab — Understand systems. Build your intuition.",
  description: "An interactive laboratory for learning system design through visual explanations and experiments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
