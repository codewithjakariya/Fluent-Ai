import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FluentAI — AI Voice English Tutor",
  description:
    "An interactive AI voice English tutor for Bengali-speaking learners: 4-phase curriculum, IELTS speaking mastery, and bilingual voice coaching with Alex."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
