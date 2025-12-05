"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import BackLink from "@/components/BackLink";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { signup } from "./actions";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    age: "",
    height: "",
    weight: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formDataObj = new FormData();
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    formDataObj.append("name", formData.name);
    formDataObj.append("age", formData.age);
    formDataObj.append("height", formData.height);
    formDataObj.append("weight", formData.weight);

    const result = await signup(formDataObj);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-beige min-h-screen overflow-x-hidden relative">
      <BackLink href="/login" />

      <div className="flex min-h-screen w-full max-lg:flex-col">
        {/* Left Side: Image and Heading */}
        <div className="flex-1 relative flex flex-col items-start justify-center p-[60px] overflow-hidden bg-transparent max-lg:p-5">
          <Image
            src="/images/runner-ekiden.png"
            alt="Runner"
            width={1200}
            height={800}
            className="absolute top-[-150px] left-0 w-[110%] h-auto object-cover z-[1] min-h-screen brightness-[60%] max-lg:relative max-lg:top-0 max-lg:max-w-full"
          />
          <h1
            className="relative z-[2] font-medium tracking-[-0.1em] leading-[1.21] text-white max-w-[640px] mt-[200px] max-lg:text-[60px] max-lg:mt-5"
            style={{ fontSize: "clamp(60px, 8vw, 120px)" }}
          >
            Start Your Truly Personal Plan
          </h1>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-[60px] bg-beige max-lg:p-5">
          <div className="text-[50px] font-medium tracking-[-0.1em] text-black mb-[60px] text-center max-md:text-[36px]">
            pulse.
          </div>

          {error && (
            <div className="w-full max-w-[565px] mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-[565px]">
            {/* Form Grid */}
            <div className="grid grid-cols-2 gap-10 mb-10 max-lg:grid-cols-1 max-lg:gap-5">
              {/* Left Column */}
              <div className="flex flex-col gap-[30px] max-lg:gap-5">
                <FormInput
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="justinnabunturan@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <FormInput
                  label="Name"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Justin Nabunturan"
                  value={formData.name}
                  onChange={handleChange}
                />
                <FormInput
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="**************"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-[30px] max-lg:gap-5">
                <FormInput
                  label="Age"
                  type="text"
                  id="age"
                  name="age"
                  placeholder="30"
                  value={formData.age}
                  onChange={handleChange}
                />
                <FormInput
                  label="Height (cm)"
                  type="number"
                  id="height"
                  name="height"
                  placeholder="160"
                  value={formData.height}
                  onChange={handleChange}
                />
                <FormInput
                  label="Weight (kg)"
                  type="number"
                  id="weight"
                  name="weight"
                  placeholder="55"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                className="w-[322px] h-[47px] mt-10 max-md:w-full max-md:max-w-[322px]"
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
