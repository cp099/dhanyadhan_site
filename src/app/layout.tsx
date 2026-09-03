import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

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
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fbfaf7] text-[#14281f] relative overflow-x-hidden">
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
