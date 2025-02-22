import prisma from "@/lib/prisma";
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Define the interfaces for Trait and Goal
interface Trait {
  name: string;
}

interface Goal {
  name: string;
}

/**
 * This function will update an existing event in the database.
 * @param {Request} request - The incoming request
 * Request Params: id, name, description, start_time, end_time, tags, address, city, recurring, online, token_bounty, number_of_spots, coordinates, morning_availability, evening_availability, preferred_traits, preferred_goals
 * @returns {Response} - The response to the incoming request
 * @endpoint PUT /api/events/update
 */

export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    console.error("No valid session found");
    return new NextResponse("No valid session found", { status: 401 });
  } else if (token.accountType !== "ORGANIZATION") {
    console.error("Unauthorized access");
    return new NextResponse("Unauthorized access", { status: 403 });
  }

  try {
    const {
      id,
      name,
      description,
      start_time,
      end_time,
      tags,
      address,
      city,
      recurring,
      online,
      token_bounty,
      number_of_spots,
      coordinates,
      morning_availability,
      evening_availability,
      preferred_traits,
      preferred_goals,
    } = await request.json();

    if (!id) {
      console.error("Missing event ID");
      return new NextResponse("Missing event ID", { status: 400 });
    }

    console.log("Event ID:", id);
    console.log("Request data:", {
      id,
      name,
      description,
      start_time,
      end_time,
      tags,
      address,
      city,
      recurring,
      online,
      token_bounty,
      number_of_spots,
      coordinates,
      morning_availability,
      evening_availability,
      preferred_traits,
      preferred_goals,
    });

    const [latitude, longitude] = coordinates;

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("Invalid coordinates:", { latitude, longitude });
      return new NextResponse("Invalid coordinates", { status: 400 });
    }

    console.log("Coordinates:", { latitude, longitude });

    // Check if the event belongs to the organization
    const event = await prisma.event.findUnique({
      where: { id },
      select: { organization_id: true }
    });

    if (!event || event.organization_id !== token.organizationID) {
      console.error("Event not found or access denied");
      return new NextResponse("Event not found or access denied", { status: 404 });
    }

// Fetch trait IDs
const traitIds = await prisma.trait.findMany({
  where: { name: { in: preferred_traits } },
  select: { id: true },
});
console.log("Trait IDs:", traitIds);

// Fetch goal IDs
const goalIds = await prisma.goal.findMany({
  where: { name: { in: preferred_goals } },
  select: { id: true },
});
console.log("Goal IDs:", goalIds);

// Update the event details
await prisma.event.update({
  where: { id },
  data: {
    name,
    description,
    start_time,
    end_time,
    tags,
    address,
    city,
    recurring,
    online,
    token_bounty,
    number_of_spots,
    latitude,
    longitude,
    preferredTraits: {
      // Disconnect all existing traits before connecting new ones
      set: [], 
      connect: traitIds.map((trait) => ({ id: trait.id })),
    },
    preferredGoals: {
      // Disconnect all existing goals before connecting new ones
      set: [], 
      connect: goalIds.map((goal) => ({ id: goal.id })),
    },
    preferredAvailability: {
      deleteMany: {}, // Clear existing entries
      create: [
        ...Object.keys(morning_availability).map(day => ({
          dayOfWeek: day,
          morningAvailable: morning_availability[day],
          eveningAvailable: evening_availability[day],
        }))
      ]
    }
  }
});

// Fetch the updated event details including related entities
const updatedEvent = await prisma.event.findUnique({
  where: { id },
  include: {
    preferredTraits: true,
    preferredGoals: true,
    preferredAvailability: true,
  },
});

console.log("Updated Event:", updatedEvent);

    console.log("Updated Event:", updatedEvent);

    return new NextResponse(JSON.stringify(updatedEvent), { status: 200 });

  } catch (error) {
    console.error("Update failed:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}