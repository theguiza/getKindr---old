"use client";
import React, { useState, useEffect } from "react";
import "../../globals.css";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Availability, AvailabilityTracker } from "@/components/layout/availabilityfield";
import { MultiSelectDropdown } from "@/components/layout/fields";

import { parse } from "path";
// Lock used to prevent multiple submissions.
let lock = false;

interface Trait {
  id: number;
  name: string;
}

interface Goal {
  id: number;
  name: string;
}


export default function Add_Event() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isOrganization = session?.accountType.toLowerCase() === "organization";

  const [eventId, setEventId] = useState<string | null>(null);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const [valueDate, setPlaceValueDate] = useState<string>(formattedDate);
  const [valueName, setValueName] = useState<string>("");
  const [valueStartTime, setValueStartTime] = useState<string>("");
  const [valueEndTime, setValueEndTime] = useState<string>("");
  const [placeholderVolNum, setPlaceValueVolNum] = useState<string>("0");
  const [valueVolNum, setValueVolNum] = useState<string>("0");
  const [valueRecurring, setValueRecurring] = useState<boolean>(false);
  const [valueOnline, setValueOnline] = useState<boolean>(false);
  const [valueDescription, setValueDescription] = useState<string>("");
  const [valueTags, setTagsValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");
  const [searchData, updateSearchData] = useState<any[]>([]);
  const [valueAddress, setValueAddress] = useState<string>("");
  const [valueLocation, setValueLocation] = useState<string>("");
  const [addressButtonValue, setAddressButtonValue] = useState<string>(
    "Search for a Location",
  );
  const [valueCoordinates, setValueCoordinates] = useState<string>("");

  const [traits, setTraits] = useState<Trait[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [allTraitsSelected, setAllTraitsSelected] = useState<boolean>(false);
  const [allGoalsSelected, setAllGoalsSelected] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [morningAvailability, setMorningAvailability] = useState<Availability>({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [eveningAvailability, setEveningAvailability] = useState<Availability>({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });

  const [showAddress, setShowAddress] = useState<boolean>(false);

  useEffect(() => {
    if (!session || status !== "authenticated" || !isOrganization) {
      router.push("/login");
    } else {
      const url = new URL(window.location.href);
      const eventID = url.searchParams.get("eventID");
      if (eventID) {
        setEventId(eventID);
      }
    }
  }, [session, status, router, isOrganization]);


  useEffect(() => {
    const fetchTraitsAndGoals = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/update/traits-and-goals", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const errorDetails = await res.json();
          console.error("Failed to fetch data:", errorDetails);
          throw new Error("Failed to fetch data");
        }
        const data: { traits: Trait[]; goals: Goal[] } = await res.json();
        setTraits(data.traits);
        setGoals(data.goals);
      } catch (error) {
        console.error("Failed to fetch traits or goals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTraitsAndGoals();
  }, []);

  const handleTraitChange = (selected: string[]) => {
    setSelectedTraits(selected);
    setAllTraitsSelected(selected.length === traits.length);
  };

  const handleGoalChange = (selected: string[]) => {
    setSelectedGoals(selected);
    setAllGoalsSelected(selected.length === goals.length);
  };

  const updateNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 80) {
      event.target.value = event.target.value.slice(0, 80);
    }
    setValueName(event.target.value);
    validateSubmit();
  };

  const updateLocationHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setValueLocation(event.target.value);
    if (event.target.value.length > 3) {
      setAddressButtonValue("Select an Address");
      document.getElementById("menu-button")?.classList.remove("bg-white");
      document.getElementById("menu-button")?.classList.add("bg-tertiary");
      document.getElementById("menu-button")?.classList.add("brightness-90");
      document.getElementById("menu-button")?.classList.add("bg-opacity-40");
      handleSearch();
    } else {
      updateSearchData([]);
      setAddressButtonValue("Search for a Location");
      document.getElementById("menu-button")?.classList.add("bg-white");
      document.getElementById("menu-button")?.classList.remove("bg-tertiary");
      document.getElementById("menu-button")?.classList.remove("brightness-90");
      document.getElementById("menu-button")?.classList.remove("bg-opacity-40");
      document.getElementById("addressDropdown")?.classList.add("h-0");
      document.getElementById("addressDropdown")?.classList.remove("ring-1");
      setShowAddress(false); // Use setShowAddress
    }
    validateSubmit();
  };

  const handleSearch = () => {
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
    )
      .then((response) => response.json())
      .then((data) => {
        updateSearchData(data.features);
        for (let i = 1; i <= 5; i++) {
          const menuItem = document.getElementById("menu-item-" + i);
          if (menuItem) {
            menuItem.textContent = (data.features[i - 1] as any).place_name;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching geocoding API:", error);
      });
  };

  const showAddresses = () => {
    if (searchData.length > 0 && !showAddress) {
      document.getElementById("addressDropdown")?.classList.remove("h-0");
      document.getElementById("addressDropdown")?.classList.add("ring-1");
      setShowAddress(true); // Use setShowAddress
    } else {
      document.getElementById("addressDropdown")?.classList.add("h-0");
      document.getElementById("addressDropdown")?.classList.remove("ring-1");
      setShowAddress(false); // Use setShowAddress
    }
  };

  const setAddress = (index: number) => {
    for (let i = 1; i <= 5; i++) {
      document.getElementById("dropdown-" + i)?.classList.remove("bg-tertiary");
      document
        .getElementById("dropdown-" + i)
        ?.classList.remove("brightness-105");
      document
        .getElementById("dropdown-" + index)
        ?.classList.remove("hover:bg-opacity-60");
      document.getElementById("dropdown-" + i)?.classList.add("hover:bg-gray-100");
    }
    document.getElementById("dropdown-" + index)?.classList.add("bg-tertiary");
    document.getElementById("dropdown-" + index)?.classList.add("brightness-105");
    document.getElementById("dropdown-" + index)?.classList.remove("hover:bg-gray-100");
    document.getElementById("dropdown-" + index)?.classList.add("hover:bg-opacity-60");
    setValueCoordinates((searchData[index - 1] as any).center);
    setValueLocation((searchData[index - 1] as any).place_name);
    setValueAddress((searchData[index - 1] as any).place_name);
    setTimeout(() => {
      document.getElementById("addressDropdown")?.classList.add("h-0");
      document.getElementById("addressDropdown")?.classList.remove("ring-1");
      setShowAddress(false); // Use setShowAddress
    }, 150);
    validateSubmit();
  };

  const formatDate = (event: string) => {
    if (event.length == 11) {
      event = event.slice(0, 4) + event.slice(5, 11);
    }
    if (event.length == 12) {
      event = event.slice(0, 4) + event.slice(6, 12);
    }
    setPlaceValueDate(event);
    validateSubmit();
  };

  const validDate = (event: string) => {
    if (new Date(event) < new Date()) {
      setPlaceValueDate(formattedDate);
    }
    if (new Date(event).getFullYear() > new Date().getFullYear() + 101) {
      setPlaceValueDate(formattedDate);
    }
  };

  const updateStartTimeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setValueStartTime(event.target.value);
    validateSubmit();
  };

  const updateEndTimeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueEndTime(event.target.value);
    validateSubmit();
  };

  const updateDescriptionHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (event.target.value.length > 1000) {
      event.target.value = event.target.value.slice(0, 1000);
    }
    setValueDescription(event.target.value);
    validateSubmit();
  };

  const handleInputClickVolNum = () => {
    setPlaceValueVolNum("");
  };

  const handleInputBlurVolNum = () => {
    if (placeholderVolNum !== "") return;
    setPlaceValueVolNum("0");
  };

  const handleInputChangeVolNum = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.value.length == 0) {
      setValueVolNum("0");
      return;
    }
    const newValue = event.target.value;
    if (newValue.charAt(0) === "-") {
      setValueVolNum("0");
      return;
    }
    let checkZero = newValue;
    if (newValue.charAt(0) === "0" && newValue.length > 1) {
      checkZero = newValue.slice(1);
    }
    if (checkZero.length > 3) {
      setValueVolNum(checkZero.slice(0, 3));
    } else {
      setValueVolNum(checkZero);
    }
    validateSubmit();
  };

  const updateValueTags = (event: React.ChangeEvent<HTMLInputElement>) => {
    let checkLen = event.target.value.replace(/#/g, "");
    let change = event.target.value.length - checkLen.length;
    if (checkLen.length > 100) {
      event.target.value = event.target.value.slice(0, 100 + change);
    }
    setTagsValue(event.target.value);
  };

  const formatValueTags = (event: string) => {
    if (event.length > 0) {
      const tags = valueTags.split(" ");
      let formattedTags = "";
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].charAt(0) !== "#" && tags[i].length > 0) {
          tags[i] = "#" + tags[i];
        }
        if (i === 0) {
          formattedTags = tags[i];
        } else {
          formattedTags = formattedTags + " " + tags[i];
        }
      }
      setTagsValue(formattedTags);
    }
  };

  const lockAndSubmit = () => {
    const submitButton = document.getElementById("submit") as HTMLInputElement;
    submitButton.disabled = true;
    if (lock) {
      return;
    }
    lock = true;
    submitEvent();
  };

  const submitEvent = async () => {
    let splitAddress = valueAddress.split(",");
    let formattedLocation = splitAddress[0] + ", " + splitAddress[1];
    for (let i = 2; i < splitAddress.length; i++) {
      if (i + 2 < splitAddress.length) {
        formattedLocation = formattedLocation + splitAddress[i] + ", ";
      }
    }
  
    if (validateSubmit()) {
  
      const eventInfo = {
        name: valueName,
        description: valueDescription,
        start_time: new Date(valueDate + " " + valueStartTime),
        end_time: new Date(valueDate + " " + valueEndTime),
        tags: valueTags.split(" "),
        address: valueAddress,
        city: formattedLocation,
        recurring: valueRecurring,
        online: valueOnline,
        token_bounty: 100,
        number_of_spots: parseInt(valueVolNum),
        coordinates: valueCoordinates,
        preferred_traits: selectedTraits,
        preferred_goals: selectedGoals,
        morning_availability: morningAvailability,
        evening_availability: eveningAvailability,
      };
  
      let response = document.getElementById("response") as HTMLInputElement;
      response.textContent = "Creating event...";
      response.classList.remove("opacity-0");
      response.classList.remove("h-0");
      response.classList.remove("mb-0");
      response.classList.add("mb-6");
  
      try {
        const res = await fetch(`/api/events/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventInfo),
        });
  
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          let errorMessage = "Unknown error";
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = await res.text();
          }
          console.error("Request failed:", errorMessage);
          response.textContent = `Event creation failed: ${errorMessage}. Please try again.`;
          response.classList.remove("text-secondary");
          response.classList.add("text-primary");
          lock = false;
          const submitButton = document.getElementById("submit") as HTMLInputElement;
          submitButton.disabled = false;
        } else {
          console.log("Successfully created event.");
          window.location.href = "/my-events";
        }
      } catch (error) {
        console.error("Network or server error:", error);
        response.textContent = `Event creation failed due to a network or server error. Please try again.`;
        response.classList.remove("text-secondary");
        response.classList.add("text-primary");
        lock = false;
        const submitButton = document.getElementById("submit") as HTMLInputElement;
        submitButton.disabled = false;
      }
    }
  };

  const validateSubmit = () => {
    var valid = true;
    if (valueName.length === 0) {
      valid = false;
    }
    // if (valueAddress.length === 0) {
    //   valid = false;
    // }
    if (valueLocation.length === 0) {
      valid = false;
    }
    if (valueCoordinates.length === 0) {
      valid = false;
    }
    if (valueDate.length === 0) {
      valid = false;
    }
    if (valueStartTime.length === 0) {
      valid = false;
    }
    if (valueEndTime.length === 0) {
      valid = false;
    }
    if (valueVolNum === "0" || valueVolNum === "null") {
      valid = false;
    }
    if (valueDescription.length === 0) {
      valid = false;
    }
    const submitButton = document.getElementById("submit");
    if (submitButton && valid) {
      submitButton.classList.remove("!bg-[#E5E5E5]");
      submitButton.classList.remove("cursor-not-allowed");
      return true;
    } else {
      submitButton?.classList.remove("!bg-[#E5E5E5]");
      submitButton?.classList.remove("cursor-not-allowed");
      submitButton?.classList.add("!bg-[#E5E5E5]");
      submitButton?.classList.add("cursor-not-allowed");
      return false;
    }
  };

  return (
    <div
      id="bodyBox"
      className="flex w-full flex-1 flex-col items-center bg-white pb-12 pt-4"
    >
      <div id="bodyContainer" className="flex w-10/12 flex-col">
        <p
          id="title"
          className="mt-16 pl-6 text-left font-display text-3xl font-bold text-tertiary brightness-90"
        >
          {eventId ? "Edit Event" : "Create Event"}
        </p>
        <p
          id="subTitle"
          className="mb-12 max-w-xs pl-6 font-display text-4xl font-bold text-secondary sm:max-w-full md:max-w-2xl md:text-6xl lg:max-w-full"
        >
          Host the future of giving back.
        </p>
        <div
          id="createEventBox"
          className="flex flex-col items-center rounded-lg border-4 border-primary bg-secondary bg-opacity-5"
        >
          <div id="reqFieldContainer" className="mt-8 h-fit w-5/6">
            <h3
              id="reqField"
              className="text-end text-lg font-semibold !text-secondary opacity-80"
            >
              Required Field <span className="text-primary">*</span>
            </h3>
          </div>
          <div
            id="eventNameContainer"
            className="mt-4 flex w-full justify-evenly"
          >
            <div id="eventNameSubContainer" className="flex w-5/6 flex-col">
              <label
                htmlFor="NameInput"
                className="pl-4 text-lg text-secondary"
              >
                Event Name <span className="text-primary">*</span>
              </label>
              <input
                id="NameInput"
                onChange={(e) => updateNameHandler(e)}
                value={valueName}
                className="text-ellipsis rounded-lg border-2 border-[#EAEAEA] pl-6 text-gray-800 sm:text-lg"
                placeholder="Enter Your Event Name"
              ></input>
            </div>
          </div>
          <div
            id="locationContainer"
            className="flex w-full justify-evenly pt-12"
          >
            <div
              id="addressSubContainer"
              className="flex w-1/3 min-w-36 flex-col pl-6 mb:ml-12 sm:min-w-52 md:ml-16 md:px-0 md:pr-8"
            >
              <label
                htmlFor="PositionInput"
                className="w-full pl-2 text-lg text-secondary mb:ml-4"
              >
                Location <span className="text-primary">*</span>
              </label>
              <input
                id="PositionInput"
                onChange={(e) => updateLocationHandler(e)}
                value={valueLocation}
                className="min-w-32 rounded-lg border-2 border-[#EAEAEA] pl-3 text-sm text-gray-800 mb:ml-2 mb:pl-4 sm:text-lg"
                placeholder="Event Address"
              ></input>
            </div>
            <div
              id="locationDropDownContainer"
              className="flex w-1/2 flex-col px-4 mb:mx-12 sm:mx-8 sm:px-0 md:m-0 md:px-8 lg:pl-16"
            >
              <label
                htmlFor="AddressInput"
                className="pl-3 text-lg text-secondary mb:pl-4"
              >
                Address <span className="text-primary">*</span>
              </label>
              <button
                type="button"
                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:text-lg"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={showAddresses}
              >
                {addressButtonValue}
                <svg
                  id="dropDownFormatting"
                  className="my-auto -mr-1 h-8 w-8 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                id="addressDropdown"
                className="z-10 mx-auto mt-2 h-0 w-11/12 divide-y-1 divide-gray-300 overflow-hidden rounded-md bg-white shadow-lg ring-0 ring-black ring-opacity-5 focus:outline-none"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                <div
                  className="overflow-hidden p-1 hover:bg-gray-100"
                  id="dropdown-1"
                  onClick={() => setAddress(1)}
                >
                  <button
                    className="text-md block w-full truncate px-4 py-2 text-gray-700"
                    id="menu-item-1"
                  >
                    1
                  </button>
                </div>
                <div
                  className="py-1 hover:bg-gray-100"
                  id="dropdown-2"
                  onClick={() => setAddress(2)}
                >
                  <button
                    className="text-md block w-full truncate px-4 py-2 text-gray-700"
                    id="menu-item-2"
                  >
                    2
                  </button>
                </div>
                <div
                  className="py-1 hover:bg-gray-100"
                  id="dropdown-3"
                  onClick={() => setAddress(3)}
                >
                  <button
                    className="text-md block w-full truncate px-4 py-2 text-gray-700"
                    id="menu-item-3"
                  >
                    3
                  </button>
                </div>
                <div
                  className="py-1 hover:bg-gray-100"
                  id="dropdown-4"
                  onClick={() => setAddress(4)}
                >
                  <button
                    className="text-md block w-full truncate px-4 py-2 text-gray-700"
                    id="menu-item-4"
                  >
                    4
                  </button>
                </div>
                <div
                  className="py-1 hover:bg-gray-100"
                  id="dropdown-5"
                  onClick={() => setAddress(5)}
                >
                  <button
                    className="text-md block w-full truncate px-4 py-2 text-gray-700"
                    id="menu-item-5"
                  >
                    5
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            id="dateTimeContainer"
            className="flex w-full flex-col items-center justify-evenly sm:flex-row"
          >
            <div className="mt-8 flex w-4/5 flex-col sm:w-1/3 sm:min-w-40">
              <label
                htmlFor="DateInput"
                className="pl-2 text-lg text-secondary mb:pl-4"
              >
                Date <span className="text-primary">*</span>
              </label>
              <input
                type="date"
                id="DateInput"
                onChange={(e) => formatDate(e.target.value)}
                onBlur={(e) => validDate(e.target.value)}
                className="min-w-34 rounded-lg border-2 border-[#EAEAEA] text-center text-sm font-semibold text-gray-800 sm:px-3 sm:text-base md:px-6"
                value={valueDate}
              ></input>
            </div>
            <div className="mt-8 flex w-4/5 flex-col sm:w-min lg:w-1/3">
              <label
                htmlFor="timeInput"
                className="pl-2 text-lg text-secondary mb:pl-4"
              >
                Time <span className="text-primary">*</span>
              </label>
              <div className="flex w-full flex-row rounded-lg border-2 border-[#EAEAEA] bg-white p-0.5">
                <input
                  type="time"
                  id="startTime"
                  onChange={(e) => updateStartTimeHandler(e)}
                  value={valueStartTime}
                  className="m-auto border-0 text-sm font-semibold text-gray-800 sm:p-2 sm:text-base md:px-3"
                  placeholder="12:00"
                ></input>
                <h1 className="mt-0.5 text-xl sm:text-2xl">-</h1>
                <input
                  type="time"
                  id="endTime"
                  onChange={(e) => updateEndTimeHandler(e)}
                  value={valueEndTime}
                  className="m-auto border-0 text-sm font-semibold text-gray-800 sm:p-2 sm:text-base md:px-3"
                  placeholder="23:59"
                ></input>
              </div>
            </div>
          </div>

          <div
            id="spotsAndCheckboxContainer"
            className="mt-8 flex w-full flex-col items-center justify-center md:flex-row md:justify-evenly"
          >
            <div
              id="subSpotsAndCheckboxContainer"
              className="mb-4 mt-10 flex w-full justify-between md:mt-0 md:w-4/5"
            >
              <div
                id=""
                className="ml-6 flex w-1/3 flex-col mb:ml-16 sm:min-w-36 md:ml-6 md:pt-4"
              >
                <label
                  htmlFor="SpotsInput"
                  className="pl-2 text-lg text-secondary mb:min-w-36 sm:pl-4"
                >
                  Available Spots <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  id="SpotsInput"
                  value={valueVolNum}
                  onClick={handleInputClickVolNum}
                  onChange={handleInputChangeVolNum}
                  onBlur={handleInputBlurVolNum}
                  className="rounded-lg border-2 border-[#EAEAEA] pl-6 text-center text-xl font-semibold text-gray-800 sm:min-w-40 sm:text-2xl"
                  placeholder={placeholderVolNum}
                ></input>
              </div>
              <div className="mr-4 mt-4 flex h-20 w-32 flex-col rounded-lg border-4 border-secondary border-opacity-80 mb:mr-10 sm:mr-16 md:h-24 md:w-36 md:pt-1">
                <div className="ml-2 mt-2 w-full">
                  <input
                    id="VirtualInput"
                    type="checkbox"
                    checked={valueOnline}
                    onChange={(e) =>
                      setValueOnline((e.target as HTMLInputElement).checked)
                    }
                    className="before:content[''] peer relative mb-1 h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-secondary transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-12 before:w-12 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:bg-secondary before:opacity-0 before:transition-opacity checked:border-primary checked:bg-primary hover:before:opacity-10 hover:checked:border-tertiary hover:checked:bg-tertiary hover:checked:brightness-90 focus:border-tertiary focus:ring-tertiary focus:checked:bg-tertiary focus:checked:ring-tertiary focus:checked:brightness-90"
                  />
                  <label
                    className="mt-px cursor-pointer select-none pl-2 font-semibold text-secondary md:text-xl"
                    htmlFor="VirtualInput"
                  >
                    Virtual
                  </label>
                </div>
                <div className="ml-2 mt-2 w-full">
                  <input
                    id="RecurringInput"
                    type="checkbox"
                    checked={valueRecurring}
                    onChange={(e) =>
                      setValueRecurring((e.target as HTMLInputElement).checked)
                    }
                    className="before:content[''] peer relative mb-1 h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-secondary transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-12 before:w-12 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:bg-secondary before:opacity-0 before:transition-opacity checked:border-primary checked:bg-primary hover:before:opacity-10 hover:checked:border-tertiary hover:checked:bg-tertiary hover:checked:brightness-90 focus:border-tertiary focus:ring-tertiary focus:checked:bg-tertiary focus:checked:ring-tertiary focus:checked:brightness-90"
                  />
                  <label
                    className="mt-px cursor-pointer select-none pl-2 font-semibold text-secondary md:text-xl"
                    htmlFor="RecurringInput"
                  >
                    Recurring
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex w-full justify-center">
            <div className="w-4/5 rounded-lg  ">
              <AvailabilityTracker
                morningAvailability={morningAvailability}
                eveningAvailability={eveningAvailability}
                onChange={(type, day, value) => {
                  const updateFn =
                    type === "morning"
                      ? setMorningAvailability
                      : setEveningAvailability;
                  updateFn((prev) => ({
                    ...prev,
                    [day]: value,
                  }));
                }}
              />
            </div>
          </div>
          <div className="mt-8 flex w-full justify-center">
            <div className="w-4/5">
              <MultiSelectDropdown
                formFieldName="traits"
                label="Select Preferred Traits"
                options={traits.map((trait) => trait.name)}
                value={selectedTraits}
                onChange={handleTraitChange}
              />
            </div>
          </div>
          <div className="mt-8 flex w-full justify-center">
            <div className="w-4/5">
              <MultiSelectDropdown
                formFieldName="goals"
                label="Select Preferred Sustainable Development Goals"
                options={goals.map((goal) => goal.name)}
                value={selectedGoals}
                onChange={handleGoalChange}
              />
            </div>
          </div>
          <div className="flex w-full justify-evenly pt-2">
            <div className="flex w-4/5 flex-col">
              <label
                htmlFor="DescriptionInput"
                className="pl-4 text-lg text-secondary"
              >
                Description <span className="text-primary">*</span>
              </label>
              <textarea
                id="DescriptionInput"
                rows={6}
                onChange={(e) => updateDescriptionHandler(e)}
                value={valueDescription}
                className="max-h-44 min-h-36 rounded-lg border-2 border-[#EAEAEA] pl-3 font-semibold text-gray-800"
              ></textarea>
            </div>
          </div>
          <div className="mt-8 flex w-full justify-evenly">
            <div className="flex w-4/5 flex-col">
              <label
                htmlFor="TagsInput"
                className="pl-4 text-lg text-secondary"
              >
                Tags
              </label>
              <input
                id="TagsInput"
                value={valueTags}
                onInput={updateValueTags}
                onBlur={(e) => formatValueTags(e.target.value)}
                className="rounded-lg border-2 border-[#EAEAEA] pl-3 font-semibold text-primary"
                placeholder="Enter tags related to your event ..."
              ></input>
            </div>
          </div>

          <div className="mb-8 mt-12 flex w-full justify-evenly">
            <Link href="/" className="w-1/5">
              <button className="text-md h-12 w-full rounded-md bg-secondary bg-opacity-60 font-semibold text-white transition-all duration-300 hover:opacity-80 focus:outline-none">
                Cancel
              </button>
            </Link>
            <button
              id="submit"
              onClick={lockAndSubmit}
              className="text-md h-12 w-1/5 cursor-not-allowed rounded-md !bg-[#E5E5E5] bg-primary font-semibold text-[#BDBDBD] text-white hover:opacity-80 focus:outline-none"
            >
              Submit
            </button>
          </div>
          <div className="margin-auto w-fill flex">
            <p
              id="response"
              className="h-0 text-center font-display text-2xl font-bold text-secondary opacity-0"
            >
              Password Reset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
