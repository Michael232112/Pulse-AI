import Image from "next/image";

export default function TrainingPreviewSection() {
  return (
    <section className="bg-beige py-[100px] pb-[120px] relative">
      <div className="max-w-[1440px] mx-auto px-[60px] max-lg:px-10 max-md:px-5">
        <div className="relative z-[1] grid grid-cols-[1fr_1.2fr] gap-[100px] items-center max-lg:grid-cols-1 max-lg:gap-10">
          <div>
            <p
              className="font-normal tracking-[-0.05em] leading-[1.25] text-black"
              style={{ fontSize: "clamp(18px, 2vw, 40px)" }}
            >
              <strong className="font-normal">Pulse</strong> is your personal AI
              running partner. It designs a truly dynamic training plan that
              syncs with your workouts, your data, and your real-time feedback
              to help you reach your goals without burnout.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/training-screenshot-6fd850.png"
              alt="Training App Interface"
              width={600}
              height={400}
              className="w-4/5 max-w-[600px] h-auto max-lg:w-3/5 max-md:w-[90%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
