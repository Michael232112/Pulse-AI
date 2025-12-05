"use client";

import { useState, FormEvent } from "react";
import BackLink from "@/components/BackLink";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { forgotPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formDataObj = new FormData();
    formDataObj.append("email", email);

    const result = await forgotPassword(formDataObj);

    setIsLoading(false);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
      setEmail(""); // Clear the input on success
    }
  };

  return (
    <div className="bg-beige min-h-screen flex items-center justify-center relative">
      <BackLink href="/signin" />

      <div className="text-center relative w-full max-w-[630px] px-10 max-md:px-5">
        {/* Logo */}
        <div className="text-[50px] font-medium tracking-[-0.1em] text-black mb-10 max-md:text-[36px] max-md:mb-10">
          pulse.
        </div>

        {/* Heading */}
        <h1
          className="font-normal tracking-[-0.05em] leading-[1.2] text-black mb-[40px] max-md:text-[22px] max-md:mb-10"
          style={{ fontSize: "clamp(20px, 2.5vw, 25px)" }}
        >
          Reset your password
        </h1>

        <p className="text-[20px] font-light text-black/70 mb-10 max-w-[430px] mx-auto">
          Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
        </p>

        {message && (
          <div
            className={`w-full max-w-[430px] mx-auto mb-6 p-4 rounded-lg text-sm border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
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
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-[322px] h-[47px] mt-5 max-md:w-full max-md:max-w-[322px]"
            disabled={isLoading}
          >
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
