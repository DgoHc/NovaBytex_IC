import { Hero } from "@/components/sections/Hero";
import { Partners } from "@/components/sections/Partners";
import { Services } from "@/components/sections/Services";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Benefits } from "@/components/sections/Benefits";
import { CTA } from "@/components/sections/CTA";
import { NfcBanner } from "@/components/sections/NfcBanner";

export default function Home() {
  return (
    <div>
      <Hero />
      <Partners />
      <Services />
      <NfcBanner />
      <FeaturedProducts />
      <Benefits />
      <CTA />
    </div>
  );
}
