
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { NotificationProvider } from '@/contexts/notification-context';
import { LanguageProvider } from '@/contexts/language-context';


export const metadata: Metadata = {
  title: 'Astrethique Visitor V2',
  description: 'Astrethique Visitor V2 Prototype',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <NotificationProvider>
            <div className="relative flex min-h-screen flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsentBanner />
            </div>
            <Toaster />
          </NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
