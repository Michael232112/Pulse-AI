import Link from "next/link";

export default function Navbar() {
  return (
    <header className="py-[30px] bg-beige">
      <div className="max-w-[1440px] mx-auto px-[60px] flex justify-between items-center max-lg:px-10 max-md:flex-col max-md:gap-5 max-md:px-5">
        <div
          className="text-[55px] font-medium tracking-[-0.1em] text-black max-md:text-[40px]"
        >
          pulse.
        </div>
        <nav className="flex gap-20 items-center max-lg:gap-10 max-md:gap-5">
          <Link
            href="#features"
            className="text-[32px] font-medium tracking-[-0.1em] text-black no-underline transition-opacity duration-300 hover:opacity-70 max-lg:text-2xl max-md:text-lg"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-[32px] font-medium tracking-[-0.1em] text-black no-underline transition-opacity duration-300 hover:opacity-70 max-lg:text-2xl max-md:text-lg"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-[32px] font-medium tracking-[-0.1em] text-black no-underline transition-opacity duration-300 hover:opacity-70 max-lg:text-2xl max-md:text-lg"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
