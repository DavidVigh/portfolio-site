import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Works } from "@/components/sections/Works";
import { Timeline } from "@/components/sections/Timeline";
import { ContactOrder } from "@/components/sections/ContactOrder";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 flex-col">
        <Hero />
        <Works />
        <Timeline />
        <ContactOrder />
      </main>
      <Footer />
    </>
  );
}
