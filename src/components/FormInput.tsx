import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormInput({
  label,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor={props.id}
        className="text-base font-light tracking-[-0.05em] text-black mb-2.5 w-full max-w-[390px] text-left"
      >
        {label}
      </label>
      <input
        {...props}
        className={`w-full max-w-[390px] h-[50px] px-[17px] py-[15px] border-none rounded-[15px] bg-white font-sans text-sm font-normal tracking-[-0.1em] text-black placeholder:text-gray-500 placeholder:opacity-100 ${className}`}
      />
    </div>
  );
}
