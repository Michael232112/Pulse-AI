import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
}

export default function Button({
  variant = "primary",
  children,
  href,
  type = "button",
  className = "",
  onClick,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-[50px] py-3 rounded-[15px] text-xl font-normal tracking-[-0.1em] no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] cursor-pointer";

  const variants = {
    primary: "bg-primary text-white border-none",
    secondary: "bg-white text-black border border-black",
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={combinedStyles} onClick={onClick}>
      {children}
    </button>
  );
}
