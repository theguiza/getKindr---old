"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Coins,
  Edit,
  LucideBuilding,
  MapPin,
  Tv,
  User,
  Users,
} from "lucide-react";
import { getDate, getTime } from "@/components/shared/utils";
import Image from "next/image";
import Button from "@/components/layout/button";

interface Volunteer {
  volunteerId: string;
  volunteer: {
    user: {
      name: string;
      email: string;
      image: string;
    };
  };
}

interface Application {
  id: string;
  volunteer: {
    user: {
      name: string;
      email: string;
      image: string;
    };
  };
}

interface EventDetails {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  organization: string;
  organizationId: string;
  tags: string[];
  city: string;
  status: string;
  numberOfSpots: number;
  online: boolean;
  recurring: boolean;
  tokenBounty: number;
  volunteers: Volunteer[];
  applications: Application[];
  isFavourite: boolean;
}

export default function Event() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<EventDetails>({
    id: "",
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    organization: "",
    organizationId: "",
    tags: [],
    city: "",
    status: "",
    numberOfSpots: 0,
    online: false,
    recurring: false,
    tokenBounty: 0,
    volunteers: [],
    applications: [],
    isFavourite: false,
  });
  const [isFetching, setIsFetching] = useState(true);
  const eventId = searchParams.get("id");
  const isOrganization = session?.accountType.toLowerCase() === "organization";
  const status = event.status.charAt(0).toUpperCase() + event.status.slice(1);

  useEffect(() => {
    async function fetchEvents() {
      await fetch("/api/events?eventID=" + eventId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          const fetchedEvent = await res.json();
          if (!fetchedEvent) {
            console.error("No event found", fetchedEvent);
            return;
          }
          console.log("Fetched Event:", fetchedEvent);
          setEvent({
            id: fetchedEvent.id,
            name: fetchedEvent.name,
            description: fetchedEvent.description,
            startTime: fetchedEvent.start_time,
            endTime: fetchedEvent.end_time,
            organization: fetchedEvent.organization.name,
            organizationId: fetchedEvent.organization.id,
            tags: fetchedEvent.tags,
            city: fetchedEvent.city,
            status: fetchedEvent.status.toLowerCase(),
            numberOfSpots: fetchedEvent.number_of_spots,
            online: fetchedEvent.online,
            recurring: fetchedEvent.recurring,
            tokenBounty: fetchedEvent.token_bounty,
            volunteers: fetchedEvent.event_volunteers || [],
            applications: fetchedEvent.event_applications || [],
            isFavourite: false,
          });
        })
        .catch((error) => {
          console.error("Error finding event: ", error);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
    fetchEvents();
  }, [eventId]);

  const handleApprove = async (applicationId: string) => {
    console.log('Approving application with ID:', applicationId);
    try {
      const response = await fetch("/api/events/approveApplication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });
  
      if (response.ok) {
        const updatedApplication = await response.json();
        setEvent((prevEvent) => ({
          ...prevEvent,
          applications: prevEvent.applications.filter(
            (app) => app.id !== applicationId
          ),
          volunteers: [
            ...prevEvent.volunteers,
            {
              volunteerId: updatedApplication.volunteerId,
              volunteer: updatedApplication.volunteer,
            },
          ],
        }));
      } else {
        console.error("Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving application:", error);
    }
  };
  
  const handleReject = async (applicationId: string) => {
    console.log('Rejecting application with ID:', applicationId);
    try {
      const response = await fetch("/api/events/rejectApplication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        console.log('Application rejected successfully:', responseData);
        setEvent((prevEvent) => ({
          ...prevEvent,
          applications: prevEvent.applications.filter(
            (app) => app.id !== applicationId
          ),
        }));
      } else {
        console.error("Failed to reject application:", responseData);
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
    }
  };

  const handleRemoveVolunteer = async (volunteerId: string) => {
    console.log('Removing volunteer with ID:', volunteerId);
    try {
      const response = await fetch("/api/events/removeVolunteer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volunteerId, eventId }),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        console.log('Volunteer removed successfully:', responseData);
        setEvent((prevEvent) => ({
          ...prevEvent,
          volunteers: prevEvent.volunteers.filter(
            (volunteer) => volunteer.volunteerId !== volunteerId
          ),
        }));
      } else {
        console.error("Failed to remove volunteer:", responseData);
      }
    } catch (error) {
      console.error("Error removing volunteer:", error);
    }
  };
  
  if (isFetching) {
    return (
      <div className="mt-28 flex w-full max-w-screen-xl flex-col p-8">
        <p className="animate-pulse text-center text-[#858585] transition-all">
          Loading event...
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12 mt-28 flex w-full max-w-screen-xl flex-col p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-primary"
      >
        <ArrowLeft size={18} />
        <p>Back</p>
      </button>
      <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
          <h1 className="flex font-display text-4xl font-bold text-secondary md:text-5xl">
            {event.name}
          </h1>
          {isOrganization &&
            event.organizationId === session?.organizationID && (
              <Button
                text="Edit Event"
                title="Edit Event"
                small
                onClick={() => router.push(`/edit-event?eventID=${eventId}`)}
              >
                Edit
              </Button>
            )}
        </div>
        <div className="text-md rounded-full border border-primary bg-transparent px-4 py-2 text-primary md:text-lg">
          <p className="px-1">{status}</p>
        </div>
      </div>

      <div className="mb-4 mt-12 flex w-full flex-col gap-4 lg:flex-row">
        <div className="flex w-full flex-col items-start gap-4 lg:w-3/4">
          <div className="text-md flex flex-col items-start gap-2 text-[#4b4b4b] sm:flex-row md:text-lg">
            <div className="flex items-center gap-2">
              <LucideBuilding size={20} />
              <p className="text-secondary opacity-80">{event.organization}</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <p className="text-secondary opacity-80">{event.city}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <p className="text-secondary opacity-80">
                {getDate(event.startTime)} &bull; {getTime(event.startTime)} -{" "}
                {getTime(event.endTime)}
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-4">
            {event.tags.map((tag: string) => (
              <div
                key={tag}
                className="md:text-md rounded-full bg-primary bg-opacity-10 px-4 py-1.5 text-sm text-primary"
              >
                #{tag}
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col justify-center gap-4 rounded-lg border border-[#EAEAEA] bg-white p-4 sm:flex-row sm:gap-12 lg:w-1/4 lg:flex-col lg:items-start lg:gap-4">
          <div className="flex flex-row items-center gap-4 text-secondary opacity-80 sm:flex-col md:flex-row">
            <Users size={20} />
            <h2 className="text-md md:text-lg">
              {event.numberOfSpots} spots available
            </h2>
          </div>
          <div className="flex flex-row items-center gap-4 text-secondary opacity-80 sm:flex-col md:flex-row">
            <Coins size={20} />
            <h2 className="text-md md:text-lg">{event.tokenBounty} tokens</h2>
          </div>
          <div className="flex flex-row items-center gap-4 text-secondary opacity-80 sm:flex-col md:flex-row">
            {event.online ? (
              <>
                <Tv size={20} />
                <h2 className="text-md md:text-lg">Online</h2>
              </>
            ) : (
              <>
                <User size={20} />
                <h2 className="text-md md:text-lg">In-person</h2>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col">
        <h2 className="mb-4 text-secondary text-3xl font-semibold">Description</h2>
        <p className="text-secondary">{event.description}</p>
      </div>

      <div className="mt-12 flex w-full flex-col gap-4">
        <h2 className="mb-4 text-secondary text-3xl font-semibold">
          Event Volunteers{" "}
          <span className="font-normal text-[#858585]">
            ({event.volunteers.length})
          </span>
        </h2>
        {!event.volunteers || event.volunteers.length === 0 ? (
          <p className="text-lg text-[#858585]">
            No volunteers have signed up for this event yet.
          </p>
        ) : (
          <div className="flex w-full flex-wrap justify-between gap-4">
            {event.volunteers.map((volunteer: Volunteer) => (
              <div
                key={volunteer.volunteerId}
                className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#EAEAEA] bg-white p-4 transition-all duration-300 ease-in-out hover:shadow-md md:w-[48%]"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      volunteer.volunteer.user.image ||
                      "/default_profile_img.png"
                    }
                    alt="User profile picture"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex flex-col items-start justify-between gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <p className="text-lg font-semibold">
                      {volunteer.volunteer.user.name}
                      {session?.volunteerID === volunteer.volunteerId && (
                        <span className="font-normal text-primary"> (You)</span>
                      )}
                    </p>
                    <p className="text-md text-[#4b4b4b]">
                      {volunteer.volunteer.user.email}
                    </p>
                  </div>
                </div>
                {isOrganization && session?.organizationID === event.organizationId && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleRemoveVolunteer(volunteer.volunteerId)}
                      className="text-primary"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 flex w-full flex-col gap-4">
        <h2 className="mb-4 text-secondary text-3xl font-semibold">
          Volunteer Applications{" "}
          <span className="font-normal text-[#858585]">
            ({event.applications.length})
          </span>
        </h2>
        {!event.applications || event.applications.length === 0 ? (
          <p className="text-lg text-[#858585]">
            No volunteer applications for this event yet.
          </p>
        ) : (
          <div className="flex w-full flex-wrap justify-between gap-4">
            {event.applications.map((application: Application) => (
              <div
                key={application.id}
                className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#EAEAEA] bg-white p-4 transition-all duration-300 ease-in-out hover:shadow-md md:w-[48%]"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      application.volunteer.user.image ||
                      "/default_profile_img.png"
                    }
                    alt="User profile picture"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex flex-col items-start justify-between gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <p className="text-lg font-semibold">
                      {application.volunteer.user.name}
                    </p>
                    <p className="text-md text-[#4b4b4b]">
                      {application.volunteer.user.email}
                    </p>
                  </div>
                </div>
                {isOrganization && session?.organizationID === event.organizationId && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleApprove(application.id)}
                      className="text-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(application.id)}
                      className="text-primary"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   ArrowLeft,
//   Calendar,
//   Coins,
//   Edit,
//   LucideBuilding,
//   MapPin,
//   Tv,
//   User,
//   Users,
// } from "lucide-react";
// import { getDate, getTime } from "@/components/shared/utils";
// import Image from "next/image";
// import Button from "@/components/layout/button";

// interface Volunteer {
//   volunteerId: string;
//   volunteer: {
//     user: {
//       name: string;
//       email: string;
//       image: string;
//     };
//   };
// }

// interface Application {
//   id: string;
//   volunteer: {
//     user: {
//       name: string;
//       email: string;
//       image: string;
//     };
//   };
// }

// interface EventDetails {
//   id: string;
//   name: string;
//   description: string;
//   startTime: string;
//   endTime: string;
//   organization: string;
//   organizationId: string;
//   tags: string[];
//   city: string;
//   status: string;
//   numberOfSpots: number;
//   online: boolean;
//   recurring: boolean;
//   tokenBounty: number;
//   volunteers: Volunteer[];
//   applications: Application[];
//   isFavourite: boolean;
// }

// async function fetchMatchScore(email: string, eventId: string) {
//   const response = await fetch("/api/events/calculateMatch", {
//     method: 'POST',
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ email, eventId })
//   });

//   if (response.ok) {
//     const data = await response.json();
//     return data.matchScore;
//   } else {
//     console.error("Failed to fetch match score");
//     return null;
//   }
// }

// export default function Event() {
//   const { data: session, status: sessionStatus } = useSession();
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [event, setEvent] = useState<EventDetails>({
//     id: "",
//     name: "",
//     description: "",
//     startTime: "",
//     endTime: "",
//     organization: "",
//     organizationId: "",
//     tags: [],
//     city: "",
//     status: "",
//     numberOfSpots: 0,
//     online: false,
//     recurring: false,
//     tokenBounty: 0,
//     volunteers: [],
//     applications: [],
//     isFavourite: false,
//   });
//   const [isFetching, setIsFetching] = useState(true);
//   const [volunteerScores, setVolunteerScores] = useState<{ [key: string]: number | null }>({});
//   const [applicationScores, setApplicationScores] = useState<{ [key: string]: number | null }>({});
//   const eventId = searchParams.get("id");
//   const isOrganization = session?.accountType.toLowerCase() === "organization";
//   const status = event.status.charAt(0).toUpperCase() + event.status.slice(1);

//   useEffect(() => {
//     async function fetchEvents() {
//       await fetch("/api/events?eventID=" + eventId, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//         .then(async (res) => {
//           const fetchedEvent = await res.json();
//           if (!fetchedEvent) {
//             console.error("No event found", fetchedEvent);
//             return;
//           }
//           console.log("Fetched Event:", fetchedEvent);
//           setEvent({
//             id: fetchedEvent.id,
//             name: fetchedEvent.name,
//             description: fetchedEvent.description,
//             startTime: fetchedEvent.start_time,
//             endTime: fetchedEvent.end_time,
//             organization: fetchedEvent.organization.name,
//             organizationId: fetchedEvent.organization.id,
//             tags: fetchedEvent.tags,
//             city: fetchedEvent.city,
//             status: fetchedEvent.status.toLowerCase(),
//             numberOfSpots: fetchedEvent.number_of_spots,
//             online: fetchedEvent.online,
//             recurring: fetchedEvent.recurring,
//             tokenBounty: fetchedEvent.token_bounty,
//             volunteers: fetchedEvent.event_volunteers || [],
//             applications: fetchedEvent.event_applications || [],
//             isFavourite: false,
//           });
//         })
//         .catch((error) => {
//           console.error("Error finding event: ", error);
//         })
//         .finally(() => {
//           setIsFetching(false);
//         });
//     }
//     fetchEvents();
//   }, [eventId]);

//   useEffect(() => {
//     async function fetchVolunteerScores() {
//       const scores: { [key: string]: number | null } = {};
//       for (const volunteer of event.volunteers) {
//         const score = await fetchMatchScore(volunteer.volunteer.user.email, event.id);
//         scores[volunteer.volunteerId] = score;
//       }
//       setVolunteerScores(scores);
//     }

//     async function fetchApplicationScores() {
//       const scores: { [key: string]: number | null } = {};
//       for (const application of event.applications) {
//         const score = await fetchMatchScore(application.volunteer.user.email, event.id);
//         scores[application.id] = score;
//       }
//       setApplicationScores(scores);
//     }

//     if (event.id) {
//       fetchVolunteerScores();
//       fetchApplicationScores();
//     }
//   }, [event]);

//   const handleApprove = async (applicationId: string) => {
//     console.log('Approving application with ID:', applicationId);
//     try {
//       const response = await fetch("/api/events/approveApplication", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ applicationId }),
//       });
  
//       if (response.ok) {
//         const updatedApplication = await response.json();
//         setEvent((prevEvent) => ({
//           ...prevEvent,
//           applications: prevEvent.applications.filter(
//             (app) => app.id !== applicationId
//           ),
//           volunteers: [
//             ...prevEvent.volunteers,
//             {
//               volunteerId: updatedApplication.volunteerId,
//               volunteer: updatedApplication.volunteer,
//             },
//           ],
//         }));
//       } else {
//         console.error("Failed to approve application");
//       }
//     } catch (error) {
//       console.error("Error approving application:", error);
//     }
//   };
  
//   const handleReject = async (applicationId: string) => {
//     console.log('Rejecting application with ID:', applicationId);
//     try {
//       const response = await fetch("/api/events/rejectApplication", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ applicationId }),
//       });
  
//       const responseData = await response.json();
  
//       if (response.ok) {
//         console.log('Application rejected successfully:', responseData);
//         setEvent((prevEvent) => ({
//           ...prevEvent,
//           applications: prevEvent.applications.filter(
//             (app) => app.id !== applicationId
//           ),
//         }));
//       } else {
//         console.error("Failed to reject application:", responseData);
//       }
//     } catch (error) {
//       console.error("Error rejecting application:", error);
//     }
//   };

//   const handleRemoveVolunteer = async (volunteerId: string) => {
//     console.log('Removing volunteer with ID:', volunteerId);
//     try {
//       const response = await fetch("/api/events/removeVolunteer", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ volunteerId, eventId }),
//       });
  
//       const responseData = await response.json();
  
//       if (response.ok) {
//         console.log('Volunteer removed successfully:', responseData);
//         setEvent((prevEvent) => ({
//           ...prevEvent,
//           volunteers: prevEvent.volunteers.filter(
//             (volunteer) => volunteer.volunteerId !== volunteerId
//           ),
//         }));
//       } else {
//         console.error("Failed to remove volunteer:", responseData);
//       }
//     } catch (error) {
//       console.error("Error removing volunteer:", error);
//     }
//   };
  
//   if (isFetching) {
//     return (
//       <div className="mt-28 flex w-full max-w-screen-xl flex-col p-8">
//         <p className="animate-pulse text-center text-[#858585] transition-all">
//           Loading event...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="mb-12 mt-28 flex w-full max-w-screen-xl flex-col p-8">
//       <button
//         onClick={() => router.back()}
//         className="mb-4 flex items-center gap-2 text-primary"
//       >
//         <ArrowLeft size={18} />
//         <p>Back</p>
//       </button>
//       <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
//         <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
//           <h1 className="flex font-display text-4xl font-bold text-secondary md:text-5xl">
//             {event.name}
//           </h1>
//           {isOrganization &&
//             event.organizationId === session?.organizationID && (
//               <Button
//                 text="Edit Event"
//                 title="Edit Event"
//                 small
//                 onClick={() => router.push(`/edit-event?eventID=${eventId}`)}
//               >
//                 Edit
//               </Button>
//             )}
//         </div>
//         <div className="text-md rounded-full border border-primary bg-transparent px-4 py-2 text-primary md:text-lg">
//           {status}
//         </div>
//       </div>
//       <div className="mt-8 flex w-full flex-col gap-4">
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <LucideBuilding className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">Organization: </span>
//             <span className="font-medium">{event.organization}</span>
//           </p>
//         </div>
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <Calendar className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">Date: </span>
//             <span className="font-medium">
//               {getDate(event.startTime)} at {getTime(event.startTime)} -{" "}
//               {getDate(event.endTime)} at {getTime(event.endTime)}
//             </span>
//           </p>
//         </div>
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <MapPin className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">City: </span>
//             <span className="font-medium">{event.city}</span>
//           </p>
//         </div>
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <Users className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">Number of Spots: </span>
//             <span className="font-medium">{event.numberOfSpots}</span>
//           </p>
//         </div>
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <Coins className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">Token Bounty: </span>
//             <span className="font-medium">{event.tokenBounty}</span>
//           </p>
//         </div>
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <Tv className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">Online: </span>
//             <span className="font-medium">{event.online ? "Yes" : "No"}</span>
//           </p>
//         </div>
//         <div className="flex items-start justify-start gap-4 md:items-center">
//           <User className="hidden text-[#111111] sm:flex" size={18} />
//           <p className="flex items-start justify-start gap-2 text-lg text-[#111111] md:items-center md:text-xl">
//             <span className="sm:hidden">Recurring: </span>
//             <span className="font-medium">{event.recurring ? "Yes" : "No"}</span>
//           </p>
//         </div>
//       </div>
//       <div className="mt-8 flex w-full flex-col gap-4 border-b border-[#EAEAEA] pb-8">
//         <h2 className="text-3xl font-semibold text-secondary">Description</h2>
//         <p className="text-lg text-[#4b4b4b]">{event.description}</p>
//       </div>
//       <div className="mt-8 flex w-full flex-col gap-4 border-b border-[#EAEAEA] pb-8">
//         <h2 className="text-3xl font-semibold text-secondary">Tags</h2>
//         <div className="flex flex-wrap gap-2">
//           {event.tags.map((tag, index) => (
//             <div
//               key={index}
//               className="rounded-full border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#4b4b4b]"
//             >
//               {tag}
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="mt-12 flex w-full flex-col gap-4">
//         <h2 className="mb-4 text-secondary text-3xl font-semibold">
//           Event Volunteers{" "}
//           <span className="font-normal text-[#858585]">
//             ({event.volunteers.length})
//           </span>
//         </h2>
//         {!event.volunteers || event.volunteers.length === 0 ? (
//           <p className="text-lg text-[#858585]">
//             No volunteers have signed up for this event yet.
//           </p>
//         ) : (
//           <div className="flex w-full flex-wrap justify-between gap-4">
//             {event.volunteers.map((volunteer: Volunteer) => (
//               <div
//                 key={volunteer.volunteerId}
//                 className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#EAEAEA] bg-white p-4 transition-all duration-300 ease-in-out hover:shadow-md md:w-[48%]"
//               >
//                 <div className="flex items-center gap-4 w-full">
//                   <Image
//                     src={
//                       volunteer.volunteer.user.image ||
//                       "/default_profile_img.png"
//                     }
//                     alt="User profile picture"
//                     width={48}
//                     height={48}
//                     className="rounded-full"
//                   />
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
//                     <div>
//                       <p className="text-lg font-semibold">
//                         {volunteer.volunteer.user.name}
//                         {session?.volunteerID === volunteer.volunteerId && (
//                           <span className="font-normal text-primary">
//                             {" "}
//                             (You)
//                           </span>
//                         )}
//                       </p>
//                       <p className="text-md text-[#4b4b4b]">
//                         {volunteer.volunteer.user.email}
//                       </p>
//                       {isOrganization && volunteerScores[volunteer.volunteerId] !== undefined && (
//                         <p className="text-md text-[#4b4b4b]">
//                           Match Score: {volunteerScores[volunteer.volunteerId]}
//                         </p>
//                       )}
//                     </div>
//                     {isOrganization &&
//                       session?.organizationID === event.organizationId && (
//                         <div className="flex items-center gap-4">
//                           <button
//                             onClick={() =>
//                               handleRemoveVolunteer(volunteer.volunteerId)
//                             }
//                             className="text-primary"
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//       {isOrganization && (
//         <div className="mt-12 flex w-full flex-col gap-4">
//           <h2 className="mb-4 text-secondary text-3xl font-semibold">
//             Volunteer Applications{" "}
//             <span className="font-normal text-[#858585]">
//               ({event.applications.length})
//             </span>
//           </h2>
//           {!event.applications || event.applications.length === 0 ? (
//             <p className="text-lg text-[#858585]">
//               No volunteer applications for this event yet.
//             </p>
//           ) : (
//             <div className="flex w-full flex-wrap justify-between gap-4">
//               {event.applications.map((application: Application) => (
//                 <div
//                   key={application.id}
//                   className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#EAEAEA] bg-white p-4 transition-all duration-300 ease-in-out hover:shadow-md md:w-[48%]"
//                 >
//                   <div className="flex items-center gap-4 w-full">
//                     <Image
//                       src={
//                         application.volunteer.user.image ||
//                         "/default_profile_img.png"
//                       }
//                       alt="User profile picture"
//                       width={48}
//                       height={48}
//                       className="rounded-full"
//                     />
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
//                       <div>
//                         <p className="text-lg font-semibold">
//                           {application.volunteer.user.name}
//                         </p>
//                         <p className="text-md text-[#4b4b4b]">
//                           {application.volunteer.user.email}
//                         </p>
//                         {isOrganization && applicationScores[application.id] !== undefined && (
//                           <p className="text-md text-[#4b4b4b]">
//                             Match Score: {applicationScores[application.id]}
//                           </p>
//                         )}
//                       </div>
//                       {isOrganization &&
//                         session?.organizationID === event.organizationId && (
//                           <div className="flex items-center gap-4">
//                             <button
//                               onClick={() => handleApprove(application.id)}
//                               className="text-primary"
//                             >
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => handleReject(application.id)}
//                               className="text-primary"
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }