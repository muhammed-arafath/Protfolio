import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { IoTLab } from "@/components/sections/IoTLab";
import { Architecture } from "@/components/sections/Architecture";
import { Workflow } from "@/components/sections/Workflow";
import { Experience } from "@/components/sections/Experience";
import { Education } from "@/components/sections/Education";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <IoTLab />
        <Architecture />
        <Workflow />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
