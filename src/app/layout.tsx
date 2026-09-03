import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DHANYADHAN | Department of Commerce • SDG Cell',
  description:
    'Institutional social-impact campaign uniting 17 Commerce classes to eliminate hunger and support sustainable community nourishment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-[#fcf9f3] text-[#1c1c18] font-sans relative overflow-x-hidden antialiased">
        {/* Fixed animated background layer */}
        <AnimatedBackground />

        {/* Content layer above background */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
