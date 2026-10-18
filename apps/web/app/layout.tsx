import type { Metadata } from "next";
import { Dongle, Geist_Mono } from "next/font/google";
import "@insaeng/design-system/fonts.css";
import "./globals.css";
import { restoreRootAttributes } from "./color-scheme";
import { SchemePicker } from "./scheme-picker";

const showSchemePicker = process.env.NODE_ENV === "development";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dongle = Dongle({
  variable: "--font-dongle",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Jaewon Yang",
  description: "My life in a nutshell",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`
        ${geistMono.variable}
        ${dongle.variable}
        h-full antialiased
      `}
      suppressHydrationWarning={showSchemePicker}
    >
      <body className="flex min-h-full flex-col">
        {showSchemePicker && (
          <script dangerouslySetInnerHTML={{ __html: restoreRootAttributes }} />
        )}
        {children}
        {showSchemePicker && <SchemePicker />}
      </body>
    </html>
  );
}
