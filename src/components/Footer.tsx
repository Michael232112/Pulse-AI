export default function Footer() {
  return (
    <footer className="bg-primary py-[50px]">
      <div className="max-w-[1440px] mx-auto px-[60px] max-lg:px-10 max-md:px-5">
        <div className="flex justify-between items-center max-md:flex-col max-md:gap-5 max-md:text-center">
          <div className="text-[55px] font-medium tracking-[-0.1em] text-black max-md:text-[40px]">
            pulse.
          </div>
          <div className="flex gap-10 items-center max-md:flex-col max-md:gap-4">
            <span className="text-[32px] font-medium tracking-[-0.1em] text-black max-md:text-xl">
              founder gonz and mark
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
