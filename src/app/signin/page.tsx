"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { signin } from "./actions";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formDataObj = new FormData();
    formDataObj.append("email", email);
    formDataObj.append("password", password);

    const result = await signin(formDataObj);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-beige min-h-screen flex items-center justify-center relative">
      <BackLink href="/login" />

      <div className="text-center relative w-full max-w-[630px] px-10 max-md:px-5">
        {/* Logo */}
        <div className="text-[50px] font-medium tracking-[-0.1em] text-black mb-20 max-md:text-[36px] max-md:mb-10">
          pulse.
        </div>

        {/* Heading */}
        <h1
          className="font-normal tracking-[-0.05em] leading-[1.2] text-black mb-[60px] max-md:text-[22px] max-md:mb-10"
          style={{ fontSize: "clamp(20px, 2.5vw, 25px)" }}
        >
          Your dashboard, weekly plan, and AI coach are ready for you. Log in to
          see your plan and continue your training.
        </h1>

        {error && (
          <div className="w-full max-w-[430px] mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[430px] mx-auto">
          <div className="mb-[30px]">
            <FormInput
              label="Email"
              type="email"
              id="email"
              name="email"
              placeholder="justinnabunturan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-[30px]">
            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              placeholder="**************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-black/60 hover:text-black underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-[322px] h-[47px] mt-10 max-md:w-full max-md:max-w-[322px]"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-xl font-normal tracking-[-0.1em] text-black mt-[60px] max-md:text-lg">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-black underline transition-opacity duration-300 hover:opacity-70"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
