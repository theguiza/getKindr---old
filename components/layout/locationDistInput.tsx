import React, { useState, useEffect } from "react";


function LocationDistanceField({
    id = "",
    name = "",
    placeholder = "",
    label = "Distance",
    minLength = 0,
    maxLength = 100,
    defaultValue = 0,
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
        <div className="flex items-center space-x-2">
          <input
            type="number"
            id={id}
            name={name}
            placeholder={placeholder}
            minLength={minLength}
            maxLength={maxLength}
            disabled={disabled}
            defaultValue={defaultValue}
            onChange={onChange}
            className={`h-12 flex-1 rounded-lg border border-[#EAEAEA] px-4 ${
              disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
            }`}
            style={{ flex: '1 0 20%' }} 
          />
          <span className="text-sm text-[#4B4B4B]">km</span>
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
  
  export default LocationDistanceField;