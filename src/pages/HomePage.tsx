import { Hero } from '@/sections/Hero';
import { Adventures } from '@/sections/Adventures';
import { BrowseByType } from '@/sections/BrowseByType';
import { Experience } from '@/sections/Experience';
import { WhyUs } from '@/sections/WhyUs';
import { CaravanSupport } from '@/components/CaravanSupport';

export function HomePage() {
  return (
    <>
      <Hero />
      <Adventures />
      <BrowseByType />
      <CaravanSupport />
      <Experience />
      <WhyUs />
    </>
  );
}
