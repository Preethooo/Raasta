import { useEffect } from 'react';
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

/** Jump to the top on page change (filters only change the query, so they don't). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
