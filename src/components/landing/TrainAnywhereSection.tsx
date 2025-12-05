import Image from "next/image";
import Button from "@/components/Button";

export default function TrainAnywhereSection() {
  return (
    <section className="bg-beige py-[100px] pb-[120px]">
      <div className="max-w-[1440px] mx-auto px-[60px] max-lg:px-10 max-md:px-5">
        <div className="grid grid-cols-2 gap-[100px] items-start max-lg:grid-cols-1 max-lg:gap-10">
          <div>
            <Image
              src="/images/lifestyle-photo.png"
              alt="Train Anywhere"
              width={700}
              height={500}
              className="w-full h-auto"
            />
          </div>
          <div>
            <h2
              className="font-medium tracking-[-0.1em] leading-[0.94] text-black mb-10"
              style={{ fontSize: "clamp(40px, 6vw, 90px)" }}
            >
              train anywhere.
              <br />
              no excuses.
            </h2>
            <p
              className="font-normal tracking-[-0.05em] leading-[1.25] text-black mb-10"
              style={{ fontSize: "clamp(18px, 2vw, 40px)" }}
            >
              Pulse is the only coach that sees your entire schedule. It not
              only plans your runs but also intelligently schedules them around
              your other commitments, like your strength training days, work
              meetings, or rest days, to optimize your performance and prevent
              burnout.
            </p>
            <Button href="/login">Start Training</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
