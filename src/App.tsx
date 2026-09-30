import { Header } from '@/components/Header';
import { Hero } from '@/sections/Hero';
import { Adventures } from '@/sections/Adventures';
import { Experience } from '@/sections/Experience';
import { WhyUs } from '@/sections/WhyUs';
import { Footer } from '@/sections/Footer';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Adventures />
        <Experience />
        <WhyUs />
      </main>
      <Footer />
    </>
  );
}
