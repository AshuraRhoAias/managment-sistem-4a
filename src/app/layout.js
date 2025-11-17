import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/Utils/Login/AuthContext";
import LocationGuard from "@/components/LocationGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Management System Electoral",
  description: "Sistema de gestión electoral",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LocationGuard>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocationGuard>
      </body>
    </html>
  );
}