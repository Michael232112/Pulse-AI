"use client";

import { useState, FormEvent } from "react";
import BackLink from "@/components/BackLink";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { updatePassword } from "./actions";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("password", password);
    formDataObj.append("confirmPassword", confirmPassword);

    const result = await updatePassword(formDataObj);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-beige min-h-screen flex items-center justify-center relative">
      {/* Back link goes to dashboard since they are technically logged in now, or home */}
      <BackLink href="/" />

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
          Set new password
        </h1>

        {error && (
          <div className="w-full max-w-[430px] mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[430px] mx-auto">
          <div className="mb-[30px]">
            <FormInput
              label="New Password"
              type="password"
              id="password"
              name="password"
              placeholder="**************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-[30px]">
            <FormInput
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="**************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-[322px] h-[47px] mt-5 max-md:w-full max-md:max-w-[322px]"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
