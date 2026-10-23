import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/sections/Footer';
import { HomePage } from '@/pages/HomePage';
import { AdventuresPage } from '@/pages/AdventuresPage';
import { CollectionPage } from '@/pages/CollectionPage';
import { AdventurePage } from '@/pages/AdventurePage';
import { AboutPage } from '@/pages/AboutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CreditsPage } from '@/pages/CreditsPage';
import { RentalsPage } from '@/pages/RentalsPage';

// The partner portal and admin console are separate apps, loaded only when visited.
const PartnerApp = lazy(() => import('@/portal/PartnerApp'));
const AdminApp = lazy(() => import('@/admin/AdminApp'));

/** Jump to the top on page change, or to `#section` when the link has one. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // Wait a frame for the new page to render, then scroll to the anchor.
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'instant' }), 80);
    return () => clearTimeout(t);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  if (/^\/(partner|admin)(\/|$)/.test(pathname)) {
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/partner/*" element={<PartnerApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </Suspense>
      </>
    );
  }
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adventures" element={<AdventuresPage />} />
          <Route path="/adventures/type/:id" element={<CollectionPage kind="type" />} />
          <Route path="/adventures/region/:id" element={<CollectionPage kind="region" />} />
          <Route path="/adventures/:slug" element={<AdventurePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/rentals" element={<RentalsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
