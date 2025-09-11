import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmileCare Dental - AI Voice Assistant",
  description: "Professional AI voice agent for SmileCare Dental Clinic - scheduling appointments, answering questions, and collecting patient information",
  keywords: "dental clinic, AI assistant, appointment booking, dental care",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b border-blue-100">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">SmileCare Dental</h1>
                    <p className="text-sm text-gray-600">AI Voice Assistant</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Available 24/7</span>
                  </div>
                  <div>📞 (555) 123-SMILE</div>
                  <div>📍 123 Dental Ave, Smile City</div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">© 2024 SmileCare Dental Clinic. All rights reserved.</p>
                <p className="flex items-center justify-center space-x-4">
                  <span>🕒 Mon-Fri: 8AM-6PM</span>
                  <span>🦷 General • Cosmetic • Orthodontics</span>
                  <span>💳 Insurance Accepted</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}