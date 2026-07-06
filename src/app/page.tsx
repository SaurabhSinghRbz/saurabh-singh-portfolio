import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import ProofStrip from "@/components/sections/ProofStrip";
import Impact from "@/components/sections/Impact";
import About from "@/components/sections/About";
import CaseStudies from "@/components/sections/CaseStudies";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import HowIWork from "@/components/sections/HowIWork";
import Academic from "@/components/sections/Academic";
import Journey from "@/components/sections/Journey";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import Console from "@/components/sections/Console";
import FloatingDock from "@/components/FloatingDock";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProofStrip />
        <Impact />
        <About />
        <Console />
        <CaseStudies />
        <Experience />
        <Skills />
        <HowIWork />
        <Academic />
        <Journey />
        <FAQ />
        <Contact />
      </main>
      <FloatingDock />
      <Footer />
    </>
  );
}
