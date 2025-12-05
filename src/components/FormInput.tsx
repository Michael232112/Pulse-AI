interface FormInputProps {
  label: string;
  type?: string;
  id: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({
  label,
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
}: FormInputProps) {
  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor={id}
        className="text-base font-light tracking-[-0.05em] text-black mb-2.5 w-full max-w-[390px] text-left"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full max-w-[390px] h-[50px] px-[17px] py-[15px] border-none rounded-[15px] bg-white font-sans text-sm font-normal tracking-[-0.1em] text-black placeholder:text-gray-500 placeholder:opacity-100"
      />
    </div>
  );
}
