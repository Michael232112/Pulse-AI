import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import TrainingPreviewSection from "@/components/landing/TrainingPreviewSection";
import TrainAnywhereSection from "@/components/landing/TrainAnywhereSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TrainingPreviewSection />
      <TrainAnywhereSection />
      <Footer />
    </>
  );
}
