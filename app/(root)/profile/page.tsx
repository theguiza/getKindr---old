"use client";

import { FormEvent, ReactNode, useEffect, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/layout/button";
import { Edit } from "lucide-react";
import AlertMessage from "@/components/layout/alertMessage";
import {
  InputField,
  MultiSelectDropdown,
  PasswordField,
  PhoneField,
  LargeInputField,
} from "@/components/layout/fields";
import Link from "next/link";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateLocation,
  validateBio,
  validatePreferredName,
  validatePreferredDistance,
  validateTraits,
  validateGoals,
} from "@/components/shared/validations";
import { AvailabilityTracker } from "@/components/layout/availabilityfield";
import LocationSearchComponent from "@/components/layout/locationSearch";
import LocationDistanceField from "@/components/layout/locationDistInput";
import { Availability, Day } from "@/components/layout/availabilityfield";

interface UserData {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;

  organizationId?: string;
  volunteerId?: string;
  tokenBalance: number;
  volunteerHours: number;
  orgHostedEvents: number;

  preferredName: string;
  morningAvailability: Availability;
  eveningAvailability: Availability;
  bio: string;
  location: string;
  latitude: number;
  longitude: number;
  preferredDist: number;
  traits: string[];
  goals: string[];
}

interface Trait {
  id: number;
  name: string;
}

interface Goal {
  id: number;
  name: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    email,
    image,
    name,
  }: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  } = session?.user || {};
  const {
    accountProvider,
    accountType,
  }: {
    accountProvider?: string | null;
    accountType?: string | null;
  } = session || {};
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsgAccount, setSuccessMsgAccount] = useState("");
  const [successMsgVolunteer, setSuccessMsgVolunteer] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const isOrganization = accountType?.toLowerCase() === "organization";
  const [fieldErrors, setFieldErrors] = useState({});
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingVolunteer, setIsEditingVolunteer] = useState(false);
  const [profileImg, setProfileImg] = useState(image);
  const [userData, setUserData] = useState<UserData>({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",

    tokenBalance: 0,
    volunteerHours: 0,
    orgHostedEvents: 0,

    preferredName: "",
    morningAvailability: {
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    },
    eveningAvailability: {
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    },
    bio: "",
    location: "",
    latitude: 0,
    longitude: 0,
    preferredDist: 0,
    traits: [],
    goals: [],
  });

  // Volunteer Profile States
  const [isLoading, setIsLoading] = useState(true);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

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

  const [location, setLocation] = useState<string>(userData.location);
  const [coordinates, setCoordinates] = useState<[number, number]>([userData.latitude, userData.longitude]);
  const [latitude, longitude] = coordinates;
  
  // Hooks
  useEffect(() => {
    async function getUserDetails() {
      const url = encodeURIComponent(email || '');
      const res = await fetch(`/api/auth?email=${url}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('GET Response Details: ', res);
  
      if (!res.ok) {
        const error = await res.json();
        setErrorMsg(error.message);
        return;
      }
  
      const jsonRes = await res.json();
      const userInfo = jsonRes.user;
      console.log('User Details: ', userInfo);
  
      if (!userInfo) {
        setErrorMsg('User not found.');
        return;
      }
  
      // Set account type and user data
      setUserData(userInfo);
  
      // Set initial state for availability
      setMorningAvailability(userInfo.morningAvailability);
      setEveningAvailability(userInfo.eveningAvailability);
  
      // Set initial state for traits and goals
      setSelectedTraits(userInfo.traits);
      setSelectedGoals(userInfo.goals);
  
      setLocation(userInfo.location);
      setIsFetching(false);
    }
  
    if (email) getUserDetails();
  }, [email]);

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
        setErrorMsg("Unable to load traits and goals.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTraitsAndGoals();
  }, []);

  // Create section components for the profile page
  function ProfileSection({
    sectionHeading = "",
    editFields = false,
    children,
  }: {
    sectionHeading?: string;
    editFields?: boolean;
    children: ReactNode;
  }) {
    return (
      <div className="my-4 flex w-full flex-col rounded-lg border border-[#EAEAEA]">
        {sectionHeading && (
          <div className="flex w-full justify-between border-b px-6 py-6">
            <h1 className="text-xl font-semibold">{sectionHeading}</h1>
            {editFields && (
              <div
                className={`flex cursor-pointer items-center gap-2 self-center font-semibold ${
                  isFetching ? "text-[#858585]" : "text-secondary"
                } hover:opacity-80`}
                onClick={() => {
                  if (!isFetching) {
                    if (sectionHeading === "Account details") {
                      setIsEditingAccount((prev) => !prev);
                    } else if (sectionHeading === "Volunteer Profile") {
                      setIsEditingVolunteer((prev) => !prev);
                    }
                    setFieldErrors({});
                    setErrorMsg("");
                    if (sectionHeading === "Account details") {
                      setSuccessMsgAccount("");
                    } else if (sectionHeading === "Volunteer Profile") {
                      setSuccessMsgVolunteer("");
                    }
                    setInfoMsg("");
                  }
                }}
              >
                {(sectionHeading === "Account details" && isEditingAccount) ||
                (sectionHeading === "Volunteer Profile" &&
                  isEditingVolunteer) ? (
                  <p>Cancel</p>
                ) : (
                  <>
                    <p>Edit</p>
                    <Edit size={20} />
                  </>
                )}
              </div>
            )}
          </div>
        )}
        <div className="px-6 py-8">{children}</div>
      </div>
    );
  }

  function validateAccountDetailsForm({
    organizationName,
    firstName,
    lastName,
    email,
    phone,
    password,
  }: {
    organizationName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    if (
      (isOrganization && !organizationName) ||
      (!isOrganization && (!firstName || !lastName)) ||
      !email
    ) {
      setErrorMsg("Please fill out all mandatory fields.");
      setLoading(false);
      return false;
    } else if (!validateEmail(email, setFieldErrors, "email")) {
      setLoading(false);
      return false;
    } else if (
      isOrganization &&
      !validateName(organizationName, setFieldErrors, "organizationName")
    ) {
      setLoading(false);
      return false;
    } else if (
      !isOrganization &&
      (!validateName(firstName, setFieldErrors, "firstName") ||
        !validateName(lastName, setFieldErrors, "lastName"))
    ) {
      setLoading(false);
      return false;
    } else if (!validatePhone(phone, setFieldErrors, "phone")) {
      setLoading(false);
      return false;
    } else if (
      password &&
      !validatePassword(password, setFieldErrors, "password")
    ) {
      // only validate password if it's not empty
      setLoading(false);
      return false;
    }
    return true;
  }

  function validateVolunteerProfileForm({
    preferredName,
    morningAvailability,
    eveningAvailability,
    bio,
    location,
    preferredDist,
    traits,
    goals,
  }: {
    preferredName: string;
    morningAvailability: Availability;
    eveningAvailability: Availability;
    bio: string;
    location: string;
    preferredDist: number;
    traits: string[];
    goals: string[];
  }) {
    if (!validateLocation(location, setFieldErrors, "location")) {
      setLoading(false);
      return false;
    }
    if (!validateBio(bio, setFieldErrors, "bio")) {
      setLoading(false);
      return false;
    }
    if (
      !validatePreferredName(preferredName, setFieldErrors, "preferredName")
    ) {
      setLoading(false);
      return false;
    }
    if (!validateTraits(traits, setFieldErrors, "traits")) {
      setLoading(false);
      return false;
    }
    if (!validateGoals(goals, setFieldErrors, "goals")) {
      setLoading(false);
      return false;
    }
    if (
      !validatePreferredDistance(
        preferredDist,
        setFieldErrors,
        "preferredDistance",
      )
    ) {
      setLoading(false);
      return false;
    }
    return true;
  }

  async function updateAccountDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFieldErrors({});
    setSuccessMsgAccount("");

    const form = new FormData(e.currentTarget);

    const data = {
      organizationName: form.get("organizationName")?.toString().trim() ?? "",
      firstName: form.get("firstName")?.toString().trim() ?? "",
      lastName: form.get("lastName")?.toString().trim() ?? "",
      email: form.get("email")?.toString().trim() ?? "",
      phone: form.get("phone")?.toString().replace(/\D/g, "").trim() ?? "",
      password: form.get("password")?.toString().trim() ?? "",
      isOrganization: isOrganization,
      userEmail: email, // user's current email
      tokenBalance: userData.tokenBalance,
      volunteerHours: userData.volunteerHours,
      orgHostedEvents: userData.orgHostedEvents,

      preferredName: userData.preferredName,
      morningAvailability: userData.morningAvailability,
      eveningAvailability: userData.eveningAvailability,
      bio: userData.bio,
      location: userData.location,
      latitude: userData.latitude,
      longitude: userData.longitude,
      preferredDist: parseInt(
        form.get("preferredDistance")?.toString() || "0",
        10,
      ),
      traits: userData.traits,
      goals: userData.goals,
    };
    console.log("Profile Details: ", data);

    // validate form data
    if (!validateAccountDetailsForm(data)) return;

    setUserData(data);

    // if no updates were made, return
    if (
      ((isOrganization &&
        data.organizationName === userData.organizationName) ||
        (!isOrganization &&
          data.firstName === userData.firstName &&
          data.lastName === userData.lastName)) &&
      data.email === userData.email &&
      data.phone === userData.phone &&
      !data.password // password empty indicates no changes made
    ) {
      setInfoMsg("Hmm... no changes were made.");
      setLoading(false);
      setIsEditingAccount(false);
      setTimeout(() => setInfoMsg(""), 3000);
      return;
    }

    console.log("Sending update request: ", data);

    const res = await fetch("/api/auth/update/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);

    console.log("Profile update Response: ", res);
    if (!res) {
      setErrorMsg("An error occurred. Please try again.");
    } else if (res.ok) {
      setSuccessMsgAccount(
        "Profile updated successfully. Redirecting to login...",
      );
      setTimeout(() => signOut({ callbackUrl: "/login" }), 3000);
    } else {
      const error = await res.json();
      setErrorMsg(error.message);
    }
  }

  function AccountDetailsForm() {
    return (
      <>
        {errorMsg && <AlertMessage message={errorMsg} />}
        {successMsgAccount && (
          <AlertMessage message={successMsgAccount} type="success" />
        )}
        {infoMsg && <AlertMessage message={infoMsg} type="info" />}
        <form
          onSubmit={updateAccountDetails}
          className="flex w-full flex-col space-y-4"
        >
          {isOrganization ? (
            <InputField
              id="organizationName"
              name="organizationName"
              type="text"
              label="Organization Name"
              minLength={2}
              maxLength={50}
              defaultValue={userData.organizationName}
              error={
                (fieldErrors as { organizationName?: string })?.organizationName
              }
              disabled={!isEditingAccount}
            />
          ) : (
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
              <InputField
                id="firstName"
                name="firstName"
                type="text"
                label="First Name"
                minLength={2}
                maxLength={50}
                defaultValue={userData.firstName}
                error={(fieldErrors as { firstName?: string })?.firstName}
                disabled={!isEditingAccount}
              />
              <InputField
                id="lastName"
                name="lastName"
                type="text"
                label="Last Name"
                minLength={2}
                maxLength={50}
                defaultValue={userData.lastName}
                error={(fieldErrors as { lastName?: string })?.lastName}
                disabled={!isEditingAccount}
              />
            </div>
          )}
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="example@email.com"
            minLength={3}
            maxLength={100}
            defaultValue={userData.email}
            error={(fieldErrors as { email?: string })?.email}
            disabled={!isEditingAccount}
          />
          <PhoneField
            id="phone"
            name="phone"
            label="Phone"
            defaultValue={userData.phone}
            error={(fieldErrors as { phone?: string })?.phone}
            disabled={!isEditingAccount}
            optional
          />
          {accountProvider === "credentials" && (
            <PasswordField
              id="password"
              name="password"
              label="Password"
              minLength={8}
              maxLength={50}
              defaultValue={userData.password}
              error={(fieldErrors as { password?: string })?.password}
              disabled={!isEditingAccount}
            />
          )}
          {isEditingAccount && (
            <Button type="submit" loading={loading} text="Save Changes" />
          )}
        </form>
      </>
    );
  }

  async function updateVolunteerProfile(
    e: FormEvent<HTMLFormElement>,
    selectedTraits: string[],
    selectedGoals: string[],
    morningAvailability: Availability,
    eveningAvailability: Availability,
    location: string,
  ) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFieldErrors({});
    setSuccessMsgVolunteer("");
  
    const form = new FormData(e.currentTarget);
  
    

    const data = {
      organizationName: userData.organizationName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: "",
      isOrganization: isOrganization,
      userEmail: email, // user's current email
      tokenBalance: userData.tokenBalance,
      volunteerHours: userData.volunteerHours,
      orgHostedEvents: userData.orgHostedEvents,
      preferredName: form.get("preferredName")?.toString().trim() ?? "",
      morningAvailability: morningAvailability,
      eveningAvailability: eveningAvailability,
      bio: form.get("bio")?.toString().trim() ?? "",
      location: location,
      latitude: latitude,
      longitude: longitude,
      preferredDist: parseInt(form.get("preferredDistance")?.toString() || "0", 10),
      traits: selectedTraits,
      goals: selectedGoals,
    };
  
    console.log("Volunteer Details: ", data);
  
    if (!validateVolunteerProfileForm(data)) {
      setLoading(false);
      return;
    }
  
    // Update local state for user data
    setUserData((prevUserData) => ({
      ...prevUserData,
      ...data,
    }));
  
// if no updates were made, return
if (
  data.location === userData.location &&
  data.bio === userData.bio &&
  data.preferredName === userData.preferredName &&
  data.preferredDist === userData.preferredDist &&
  JSON.stringify(data.morningAvailability) === JSON.stringify(userData.morningAvailability) &&
  JSON.stringify(data.eveningAvailability) === JSON.stringify(userData.eveningAvailability) &&
  JSON.stringify(data.traits) === JSON.stringify(userData.traits) &&
  JSON.stringify(data.goals) === JSON.stringify(userData.goals)
) {
  setInfoMsg("Hmm... no changes were made.");
  setLoading(false);
  setIsEditingVolunteer(false);
  setTimeout(() => setInfoMsg(""), 3000);
  return;
}
  
    console.log("Sending update request: ", data);
  
    try {
      const res = await fetch("/api/auth/update/volunteerProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      console.log("Profile update Response: ", res);
      if (!res.ok) {
        const error = await res.json();
        setErrorMsg(error.message);
      } else {
        setSuccessMsgVolunteer("Volunteer profile updated successfully.");
        setIsEditingVolunteer(false);
        setTimeout(() => setSuccessMsgVolunteer(""), 3000);
      }
    } catch (error) {
      console.error("An error occurred while updating the profile:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function VolunteerProfileForm() {
    // Handlers for different volunteer form functionalities
    const handleTraitsChange = (newSelectedTraits: string[]) => {
      setSelectedTraits(newSelectedTraits);
    };
  
    const handleGoalsChange = (newSelectedGoals: string[]) => {
      setSelectedGoals(newSelectedGoals);
    };
  
    const handleLocationChange = (newLocation: string, newCoordinates: [number, number]) => {
      setLocation(newLocation);
      setCoordinates(newCoordinates)
      console.log("Location updated:", newLocation);
      console.log("Coordinates updated:", newCoordinates);
    };
  
    const handleAvailabilityChange = (
      type: "morning" | "evening",
      day: Day,
      value: boolean,
    ) => {
      if (type === "morning") {
        setMorningAvailability((prev) => {
          const newAvailability = { ...prev, [day]: value };
          console.log("Morning availability updated:", newAvailability);
          return newAvailability;
        });
      } else {
        setEveningAvailability((prev) => {
          const newAvailability = { ...prev, [day]: value };
          console.log("Evening availability updated:", newAvailability);
          return newAvailability;
        });
      }
    };
  
    return (
      <>
        {errorMsg && <AlertMessage message={errorMsg} />}
        {successMsgVolunteer && (
          <AlertMessage message={successMsgVolunteer} type="success" />
        )}
        {infoMsg && <AlertMessage message={infoMsg} type="info" />}
        <form
          onSubmit={(e) =>
            updateVolunteerProfile(
              e,
              selectedTraits,
              selectedGoals,
              morningAvailability,
              eveningAvailability,
              location,
            )
          }
          className="flex w-full flex-col space-y-4"
        >
          <InputField
            id="preferredName"
            name="preferredName"
            type="text"
            label="Preferred Name(Optional)"
            minLength={0}
            maxLength={100}
            defaultValue={userData.preferredName}
            error={(fieldErrors as { preferredName?: string })?.preferredName}
            disabled={!isEditingVolunteer}
          />
          <AvailabilityTracker
            id="availability"
            name="availability"
            label="Availability"
            morningAvailability={morningAvailability}
            eveningAvailability={eveningAvailability}
            onChange={handleAvailabilityChange}
            disabled={!isEditingVolunteer}
          />
          <LargeInputField
            id="bio"
            name="bio"
            placeholder=""
            label="Bio"
            minLength={1}
            maxLength={100}
            defaultValue={userData.bio}
            error={(fieldErrors as { bio?: string })?.bio}
            disabled={!isEditingVolunteer}
          />
          <LocationSearchComponent
            disabled={!isEditingVolunteer}
            initialLocation={location}
            initialCoordinates={coordinates}
            onUpdateLocation={handleLocationChange}
          />
          <LocationDistanceField
            id="preferredDistance"
            name="preferredDistance"
            label="Distance willing to travel from location: "
            placeholder=""
            minLength={0}
            maxLength={100}
            defaultValue={userData.preferredDist}
            error={(fieldErrors as { preferredDist?: string })?.preferredDist}
            disabled={!isEditingVolunteer}
          />
          <MultiSelectDropdown
            formFieldName="traits"
            label="Traits"
            options={traits.map((trait) => trait.name)}
            value={selectedTraits}
            onChange={handleTraitsChange}
            prompt="Select Traits:"
            disabled={!isEditingVolunteer}
          />
          <MultiSelectDropdown
            formFieldName="goals"
            label="Sustainable Development Goals"
            options={goals.map((goal) => goal.name)}
            value={selectedGoals}
            onChange={handleGoalsChange}
            prompt="Select Sustainable Development Goals:"
            disabled={!isEditingVolunteer}
          />
          {isEditingVolunteer && (
            <Button type="submit" loading={loading} text="Save Changes" />
          )}
        </form>
      </>
    );
  }

  async function UploadImage(base64Image: string) {
    // remove data:image/png;base64, from base64 string
    const formattedBase64 = base64Image.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      "",
    );
    const formData = new FormData();
    formData.append("image", formattedBase64);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    const res = await fetch("https://api.imgbb.com/1/upload?key=" + apiKey, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.status !== 200) {
      console.error("Error uploading image: ", data);
      setErrorMsg("Error uploading image. Please try again.");
      return;
    }

    return data.data.url;
  }

  async function UpdateProfileImage() {
    // upload image to api.imgbb.com by calling UploadImage function
    if (!profileImg || !profileImg.startsWith("data:image")) return;
    const imgUrl = await UploadImage(profileImg); // Add 'await' keyword to wait for the promise to resolve

    // send request to update profile image
    if (!imgUrl) {
      setErrorMsg("Error uploading image. Please try again.");
      return;
    }

    const res = await fetch("/api/auth/update/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        profileImage: imgUrl,
      }),
    });

    if (!res) {
      setErrorMsg("An error occurred. Please try again.");
    } else if (res.ok) {
      setSuccessMsgAccount(
        "Profile image updated successfully. Redirecting to login...",
      );
      setTimeout(() => signOut({ callbackUrl: "/login" }), 3000);
    } else {
      const error = await res.json();
      setErrorMsg(error.message);
    }
  }

  return (
    <div className="mx-auto mb-auto mt-28 flex w-full max-w-screen-xl flex-col gap-8 p-8 lg:flex-row">
      {/* Left Section -------------------------------------------------------------------------------------------------*/}
      <div className="flex w-full flex-col gap-8 md:flex-row lg:w-1/3 lg:flex-col">
        {/* Profile Section */}
        <ProfileSection>
          <div className="mb-4 flex justify-center">
            <Image
              src={profileImg || "/default_profile_img.png"}
              alt="Profile Picture"
              width="100"
              height="100"
              className="rounded-full"
            />
          </div>

          {/* Greeting */}
          <h1 className="my-4 flex text-xl">
            Hello,&nbsp;
            <span className="font-semibold text-primary">{name}!</span>
          </h1>

          {/* User Details */}
          <div className="mb-6 flex">
            <div className="flex w-full justify-between">
              <p className="text-sm text-[#4b4b4b]">
                Tokens:{" "}
                <span className="font-semibold text-secondary">
                  {userData.tokenBalance}
                </span>
              </p>
              {isOrganization ? (
                <p className="text-sm text-[#4b4b4b]">
                  Hosted Events:{" "}
                  <span className="font-semibold text-secondary">
                    {userData.orgHostedEvents}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-[#4b4b4b]">
                  Volunteered:{" "}
                  <span className="font-semibold text-secondary">
                    {userData.volunteerHours}h
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Profile Picture Input */}
          <input
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            id="profile-picture"
            onChange={(e) => {
              setErrorMsg("");
              const file = e.target.files?.[0];
              if (file) {
                console.log(file);

                // Check if file is a valid image type
                if (!["image/jpeg", "image/png"].includes(file.type)) {
                  setErrorMsg(
                    "Invalid file type. Please select a JPEG or PNG image.",
                  );
                  return;
                }

                // Check if file size is greater than 2MB
                if (!file.size || file.size > 2097152) {
                  setErrorMsg(
                    "File size is too large. Please select an image less than 2MB.",
                  );
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => setProfileImg(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />

          {/* Update Profile Image Button */}
          {profileImg?.startsWith("data:image") ? (
            <Button
              title="Update Profile Image"
              text="Update Image"
              onClick={UpdateProfileImage}
              full
            />
          ) : (
            <Button
              title="Change Profile Image"
              text="Change Image"
              disabled={isFetching}
              onClick={() => {
                document.getElementById("profile-picture")?.click();
              }}
              full
            />
          )}
        </ProfileSection>

        {/* Need Assistance Section */}
        <ProfileSection>
          <h1 className="mb-4 text-xl font-semibold">Need assistance?</h1>
          <p className="mb-8">
            Got questions with your account or recent volunteer events? Our
            support team is here to help! Whether it&apos;s account
            troubleshooting or event details, just shoot us an email. Your
            satisfaction is our priority!
          </p>
          <Button
            title="Send email to hello@getkindr.com"
            text="Email Us"
            onClick={() => {
              window.open("mailto:hello@getkindr.com");
            }}
            full
            outline
          />
        </ProfileSection>
      </div>

      {/* Right Section ------------------------------------------------------------------------------------ */}
      <div className="flex w-full flex-col lg:w-2/3">
        {/* Account Details Section */}
        <ProfileSection sectionHeading="Account details" editFields>
          {isFetching ? (
            <p className="animate-pulse text-[#858585] transition-all">
              Retrieving your account details...
            </p>
          ) : (
            <AccountDetailsForm />
          )}
        </ProfileSection>

        {/* Volunteer Profile Section */}
        {!isOrganization && (
        <ProfileSection sectionHeading="Volunteer Profile" editFields>
          {isFetching ? (
            <p className="animate-pulse text-[#858585] transition-all">
              Retrieving your volunteer details...
            </p>
          ) : (
            <VolunteerProfileForm />
          )}
        </ProfileSection>
        )}
        
        {/* Hosted/Attended Events Section */}
        {isOrganization ? (
          <ProfileSection sectionHeading="Hosted events">
            <p>
              To create, view, or edit your current and past hosted events,
              please visit your{" "}
              <Link
                href="/my-events"
                className="font-semibold text-primary hover:opacity-80"
              >
                hosted events here.
              </Link>
            </p>
          </ProfileSection>
        ) : (
          <ProfileSection sectionHeading="Attended events">
            <p>
              To view, manage, and keep track of your past volunteer events and
              hours, please visit your{" "}
              <Link
                href="/my-events"
                className="font-semibold text-primary hover:opacity-80"
              >
                attended events here.
              </Link>
            </p>
          </ProfileSection>
        )}
      </div>
    </div>
  );
}
