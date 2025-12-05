"use client";

import Link from "next/link";
import BackLink from "@/components/BackLink";
import Button from "@/components/Button";

export default function LoginPage() {
  return (
    <div
      className="bg-white bg-cover bg-center min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: "url('/images/quill-background.png')" }}
    >
      <BackLink href="/" />

      <div className="text-center relative w-full max-w-[1440px] px-10 max-md:px-5">
        {/* Logo */}
        <div className="text-[50px] font-medium tracking-[-0.1em] text-black mb-[60px] max-md:text-[36px]">
          pulse.
        </div>

        {/* Welcome Heading */}
        <h1
          className="font-medium tracking-[-0.1em] leading-[1.21] text-black mb-[50px]"
          style={{ fontSize: "clamp(60px, 7vw, 100px)" }}
        >
          Welcome Back
        </h1>

        {/* Description */}
        <p
          className="font-normal tracking-[-0.05em] leading-[0.86] text-black max-w-[630px] mx-auto mb-[60px] max-md:px-5"
          style={{ fontSize: "clamp(22px, 2.5vw, 35px)" }}
        >
          Create an account or log in to save your progress and access your plan
          anywhere.
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-[30px] mb-[70px]">
          <Button
            href="/signup"
            variant="primary"
            className="w-[322px] h-[47px] max-md:w-[280px]"
          >
            Create an Account
          </Button>
          <Button
            href="/signin"
            variant="secondary"
            className="w-[322px] h-[47px] max-md:w-[280px]"
          >
            I Already Have an Account
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xl font-light tracking-[-0.1em] leading-[1.5] text-black opacity-50">
          By continuing, you agree to Our Terms of Service.
        </p>
      </div>
    </div>
  );
}
