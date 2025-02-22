import { LucideEye, LucideEyeOff } from "lucide-react";
import { useEffect, useState, useRef } from "react";

function InputField({
  id = "",
  name = "",
  type = "text",
  placeholder = "",
  label = "",
  minLength = 0,
  maxLength = 100,
  defaultValue = "",
  onChange = () => {},
  error = "",
  disabled = false,
  optional = false,

}) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-sm text-[#4B4B4B]">
        {label}
        {optional && <span className="text-[#858585]"> (Optional)</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={onChange}
        className={`h-12 w-full rounded-lg border border-[#EAEAEA] px-4 ${
          disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
        }`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
interface LargeInputFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  label?: string;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  optional?: boolean;
}

const LargeInputField: React.FC<LargeInputFieldProps> = ({
  id = "",
  name = "",
  placeholder = "",
  label = "",
  minLength = 0,
  maxLength = 1000,
  defaultValue = "",
  onChange = () => {},
  error = "",
  disabled = false,
  optional = false,
}) => {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-sm text-[#4B4B4B]">
        {label}
        {optional && <span className="text-[#858585]"> (Optional)</span>}
      </label>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={onChange}
        className={`h-40 w-full rounded-lg border border-[#EAEAEA] px-4 py-2 text-lg ${
          disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
        }`}
        style={{ resize: 'vertical' }}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

function PasswordField({
  id = "",
  name = "",
  placeholder = "",
  label = "",
  minLength = 0,
  maxLength = 100,
  defaultValue = "",
  onChange = () => {},
  error = "",
  disabled = false,
}) {
  const [hidePassword, setHidePassword] = useState(true);
  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-sm text-[#4B4B4B]">
        {label}
      </label>
      <div className="relative">
        <input
          type={hidePassword ? "password" : "text"}
          id={id}
          name={name}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled}
          defaultValue={defaultValue}
          onChange={onChange}
          className={`h-12 w-full rounded-lg border border-[#EAEAEA] px-4 pr-8 ${
            disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
          }`}
        />
        {hidePassword ? (
          <LucideEye
            className="absolute right-4 top-3 text-[#4B4B4B] hover:cursor-pointer"
            onClick={() => setHidePassword(false)}
          />
        ) : (
          <LucideEyeOff
            className="absolute right-4 top-3 text-[#4B4B4B] hover:cursor-pointer"
            onClick={() => setHidePassword(true)}
          />
        )}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

function ToggleField({ id = "", name = "", label = "", onChange = () => {} }) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label
        htmlFor={name}
        className="relative my-2 inline-flex cursor-pointer items-center gap-4 text-sm text-[#4B4B4B]"
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          className="peer sr-only"
          value="WORKING"
          onChange={onChange}
        />
        <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-0 rtl:peer-checked:after:-translate-x-full dark:border-[#D4D4D4] dark:bg-[#D4D4D4]"></div>
        {label}
      </label>
    </div>
  );
}

function formatPhoneNumber(value: string) {
  // Remove all non-numeric characters from the input value
  const cleaned = value.replace(/\D/g, "");

  // Apply formatting based on the cleaned value
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    // Check if all digits are entered, otherwise, return formatted string with only entered digits
    return match[1]
      ? "(" +
          match[1] +
          (match[2] ? ") " + match[2] + (match[3] ? " - " + match[3] : "") : "")
      : "";
  }

  // If no match is found, return an empty string
  return "";
}

function PhoneField({
  id = "",
  name = "",
  placeholder = "",
  label = "",
  minLength = 0,
  maxLength = 100,
  defaultValue = "",
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {},
  error = "",
  optional = false,
  disabled = false,
}) {
  const [phone, setPhone] = useState(
    defaultValue ? formatPhoneNumber(defaultValue) : "",
  );

  useEffect(() => {
    if (defaultValue) setPhone(formatPhoneNumber(defaultValue));
  }, [defaultValue]);

  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-sm text-[#4B4B4B]">
        {label}
        {optional && <span className="text-[#858585]"> (Optional)</span>}
      </label>
      <input
        type="tel"
        id={id}
        name={name}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        value={phone}
        disabled={disabled}
        onChange={(e) => {
          const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
          const formattedValue = formatPhoneNumber(numericValue);
          setPhone(formattedValue);
          if (onChange) {
            onChange({
              ...e,
              target: { ...e.target, name: name, value: numericValue },
            });
          } else {
            e.preventDefault();
          }
        }}
        className={`h-12 w-full rounded-lg border border-[#EAEAEA] px-4 ${
          disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
        }`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

interface MultiSelectDropdownProps {
  formFieldName: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (selectedOptions: string[]) => void;
  prompt?: string;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  formFieldName = "",
  label = "",
  options = [],
  value = [],
  onChange,
  prompt = "Select one or more options",
  disabled = false,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [localSelectedOptions, setLocalSelectedOptions] = useState<string[]>(value);

  useEffect(() => {
    setLocalSelectedOptions(value);
  }, [value]);

  const optionsListRef = useRef<HTMLUListElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const option = e.target.value;
    const selectedOptionSet = new Set(localSelectedOptions);

    if (isChecked) {
      selectedOptionSet.add(option);
    } else {
      selectedOptionSet.delete(option);
    }

    const newSelectedOptions = Array.from(selectedOptionSet);
    setLocalSelectedOptions(newSelectedOptions);
  };

  const handleApplyClick = () => {
    onChange(localSelectedOptions);
    setIsDropdownVisible(false);
  };

  const isSelectAllEnabled = localSelectedOptions.length < options.length;

  const handleSelectAllClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const allOptions = [...options];
    setLocalSelectedOptions(allOptions);
    onChange(allOptions); // Ensure the onChange function is called with all options
  };

  const isClearSelectionEnabled = localSelectedOptions.length > 0;

  const handleClearSelectionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLocalSelectedOptions([]);
    onChange([]); // Ensure the onChange function is called with an empty array
  };

  const toggleDropdown = () => {
    if (isDropdownVisible) {
      handleApplyClick();
    } else {
    setIsDropdownVisible(true);
    }
  };

  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={formFieldName} className="text-med font-medium text-[#4B4B4B]">
        {label}
      </label>
      <div className="relative">
        <div
          className={`cursor-pointer bg-white after:content-['▼'] after:text-xs after:ml-1 after:inline-flex after:items-center after:transition-transform inline-flex border rounded-lg px-5 py-2.5 ${
            disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
          }`}
          onClick={toggleDropdown}
        >
          {prompt}
          {localSelectedOptions.length > 0 && (
            <span className="ml-1 text-blue-500">{`(${localSelectedOptions.length} selected)`}</span>
          )}
        </div>

        {isDropdownVisible && !disabled && (
          <div className="absolute bg-white border w-full max-h-60 overflow-y-scroll z-10">
            <ul>
              <li>
                <button
                  onClick={handleSelectAllClick}
                  disabled={!isSelectAllEnabled}
                  className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
                >
                  {"Select All"}
                </button>
              </li>
              <li>
                <button
                  onClick={handleClearSelectionClick}
                  disabled={!isClearSelectionEnabled}
                  className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
                >
                  {"Clear selection"}
                </button>
              </li>
            </ul>
            <ul>
              {options.map((option) => (
                <li key={option}>
                  <label className="flex whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100">
                    <input
                      type="checkbox"
                      name={formFieldName}
                      value={option}
                      checked={localSelectedOptions.includes(option)}
                      onChange={handleChange}
                      disabled={disabled}
                      className="cursor-pointer"
                    />
                    <span className="ml-1">{option}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex justify-end p-2">
              <button
                onClick={handleApplyClick}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { InputField, PasswordField, ToggleField, PhoneField, MultiSelectDropdown, LargeInputField};
