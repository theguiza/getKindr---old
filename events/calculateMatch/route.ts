import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateMatchScore, Availability, VolunteerFactors, EventPreferences } from "@/app/utilities/matchAlgorithm";

export async function POST(req: NextRequest) {
  console.log("Request received");
  const { email, eventId } = await req.json();

  if (!email || !eventId) {
    console.log("Missing email or eventId");
    return NextResponse.json({ message: "Missing email or eventId" }, { status: 400 });
  }

  try {
    console.log("Fetching user");
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        volunteer: {
          include: {
            availability: true,
            traits: true,
            goals: true,
          },
        },
      },
    });

    if (!user || !user.volunteer) {
      console.log("Volunteer not found");
      return NextResponse.json({ message: "Volunteer not found" }, { status: 404 });
    }

    const volunteer = user.volunteer;
    console.log("Processing availability");
    const morningAvailability: { [day: string]: boolean } = {};
    const eveningAvailability: { [day: string]: boolean } = {};

    volunteer.availability.forEach((avail: Availability) => {
      morningAvailability[avail.dayOfWeek] = avail.morningAvailable;
      eveningAvailability[avail.dayOfWeek] = avail.eveningAvailable;
    });

    const volunteerFactors: VolunteerFactors = {
      latitude: volunteer.latitude ?? null,
      longitude: volunteer.longitude ?? null,
      preferredDist: volunteer.preferredDist ?? null,
      availability: {
        morningAvailability,
        eveningAvailability,
      },
      traits: volunteer.traits,
      goals: volunteer.goals,
      rating: volunteer.rating ?? 0,
    };

    console.log("Fetching event");
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        preferredAvailability: true,
        preferredTraits: true,
        preferredGoals: true,
      },
    });

    if (!event) {
      console.log("Event not found");
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    console.log("Processing preferred availability");
    const preferredMorningAvailability: { [day: string]: boolean } = {};
    const preferredEveningAvailability: { [day: string]: boolean } = {};

    event.preferredAvailability.forEach((avail: Availability) => {
      preferredMorningAvailability[avail.dayOfWeek] = avail.morningAvailable;
      preferredEveningAvailability[avail.dayOfWeek] = avail.eveningAvailable;
    });

    const eventPreferences: EventPreferences = {
      latitude: event.latitude,
      longitude: event.longitude,
      preferredGoals: event.preferredGoals,
      preferredTraits: event.preferredTraits,
      preferredAvailability: {
        morningAvailability: preferredMorningAvailability,
        eveningAvailability: preferredEveningAvailability,
      },
    };

    console.log("Calculating match score");
    const matchScore = calculateMatchScore(volunteerFactors, eventPreferences);

    console.log("Returning match score:", matchScore);
    return NextResponse.json({ matchScore }, { status: 200 });
  } catch (error) {
    console.error("Error calculating match score:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}