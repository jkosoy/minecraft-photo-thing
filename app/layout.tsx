import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Minecraft Photo Thing",
  description: "A Next.js app for Minecraft photos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
