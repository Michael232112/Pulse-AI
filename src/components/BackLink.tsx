import Link from "next/link";

interface BackLinkProps {
  href: string;
}

export default function BackLink({ href }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="absolute top-11 right-[49px] text-[32px] font-medium tracking-[-0.1em] text-black no-underline transition-opacity duration-300 hover:opacity-70 max-md:right-5 max-md:text-2xl"
    >
      Back
    </Link>
  );
}
