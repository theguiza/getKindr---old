import React from "react";

export interface Availability {
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}



type Day = keyof Availability;

interface AvailabilityTrackerProps {
  id?: string;
  name?: string;
  label?: string;
  morningAvailability?: Availability;
  eveningAvailability?: Availability;
  onChange: (type: "morning" | "evening", day: Day, value: boolean) => void;
  disabled?: boolean;
  error?: string;
}

const defaultAvailability: Availability = {
  sunday: false,
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
};

const AvailabilityTracker: React.FC<AvailabilityTrackerProps> = ({
  id = "",
  name = "",
  label = "Availability",
  morningAvailability = defaultAvailability,
  eveningAvailability = defaultAvailability,
  onChange,
  disabled = false,
  error = "",
}) => {
  const handleDayChange = (type: "morning" | "evening", day: Day) => {
    const updatedValue =
      type === "morning"
        ? !morningAvailability[day]
        : !eveningAvailability[day];
    onChange(type, day, updatedValue);
  };

  const handleSelectAll = (type: "morning" | "evening", selected: boolean) => {
    Object.keys(defaultAvailability).forEach((day) => {
      onChange(type, day as Day, selected);
    });
  };

  const renderAvailabilitySection = (
    type: "morning" | "evening",
    availability: Availability
  ) => (
    <div className={`w-1/2 ${type === "morning" ? "pr-2" : "pl-2"}`}>
      <h2 className="text-md mb-2 font-semibold text-[#4B4B4B]">
        {type.charAt(0).toUpperCase() + type.slice(1)} Availability
      </h2>
      <div className="mb-2">
        <input
          type="checkbox"
          id={`selectAll-${type}`}
          onChange={(e) => handleSelectAll(type, e.target.checked)}
          disabled={disabled}
          className="form-checkbox mr-2 h-4 w-4 cursor-pointer rounded-full"
        />
        <label
          htmlFor={`selectAll-${type}`}
          className={`cursor-pointer text-sm text-[#4B4B4B] ${
            disabled ? "cursor-not-allowed text-[#858585]" : ""
          }`}
        >
          Select All {type.charAt(0).toUpperCase() + type.slice(1) + "s"}
        </label>
      </div>
      <ul>
        {Object.keys(availability).map((day) => (
          <li key={day} className="mb-2 flex items-center">
            <input
              type="checkbox"
              id={`${type}-${day}`}
              checked={availability[day as Day]}
              onChange={() => handleDayChange(type, day as Day)}
              className="form-checkbox mr-2 h-4 w-4 cursor-pointer rounded-full"
              disabled={disabled}
            />
            <label
              htmlFor={`${type}-${day}`}
              className={`cursor-pointer text-sm text-[#4B4B4B] ${
                disabled ? "cursor-not-allowed text-[#858585]" : ""
              }`}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={id} className="text-sm text-[#4B4B4B]">
        {label}
      </label>
      <div
        className={`flex bg-white rounded-lg border border-[#EAEAEA] px-4 py-2 ${
          disabled ? "cursor-not-allowed bg-[#F5F5F5]" : ""
        }`}
      >
        {renderAvailabilitySection("morning", morningAvailability)}
        {renderAvailabilitySection("evening", eveningAvailability)}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export { AvailabilityTracker, type Day };