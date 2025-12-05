import Image from "next/image";
import Button from "@/components/Button";

export default function HeroSection() {
  return (
    <section className="pt-[60px] bg-beige text-center">
      <div className="max-w-[1440px] mx-auto px-[60px] max-lg:px-10 max-md:px-5">
        <h1
          className="font-medium tracking-[-0.1em] leading-[1.2] text-black mb-5"
          style={{ fontSize: "clamp(120px, 20vw, 300px)" }}
        >
          pulse.
        </h1>
        <h2
          className="font-normal tracking-[-0.05em] leading-[1.25] text-black mb-[50px]"
          style={{ fontSize: "clamp(30px, 3vw, 40px)" }}
        >
          Training That Fits Your Life
        </h2>
        <Button href="/login">Get Started</Button>
      </div>
      <div className="w-full mt-20 overflow-hidden">
        <Image
          src="/images/explore-image-4639f8.png"
          alt="Running in motion"
          width={1920}
          height={800}
          className="w-full h-auto block"
          priority
        />
      </div>
    </section>
  );
}
