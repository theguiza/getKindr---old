import prisma from "@/lib/prisma";
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This function will create an event in the database.
 * @param {Request} request - The incoming request
 * Request Params: name, description, start_time, end_time, tags, address, city, recurring, online, token_bounty, number_of_spots, coordinates, morning_availability, evening_availability, preferred_traits, preferred_goals
 * @returns {Response} - The response to the incoming request
 * @endpoint POST /api/events/create
 */
export async function POST(request: NextRequest) {
  // Get the token from the request.
  const token = await getToken({ req: request });

  console.log("Token fetched:", token);

  // If the token is missing, return an error response.
  if (!token) {
    console.error("No valid session found");
    return new Response("No valid session found", {
      status: 401,
    });
  } else if (token.accountType === "ORGANIZATION") {
    // If the account is an organization, create the event.
    let createdEvent;

    // Try to create the event.
    try {
      // Get all the new organization info from the request.
      const {
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
        preferred_traits,
        preferred_goals,
        morning_availability,
        evening_availability,
      } = await request.json();

      console.log("Request data:", {
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

      // Get the organization ID from the token.
      const organization_id = token.organizationID ? token.organizationID as string : null;

      console.log("Organization ID:", organization_id);

      // Extract the latitude and longitude from the coordinates.
      const [latitude, longitude] = coordinates;

      console.log("Coordinates:", { latitude, longitude });

      // If any of the required fields are missing, return an error response.
      if (
        !name ||
        !start_time ||
        !end_time ||
        !organization_id ||
        !address ||
        !city ||
        !token_bounty ||
        !number_of_spots ||
        !latitude ||
        !longitude
      ) {
        console.error("Missing required fields");
        return new Response("Missing required fields", {
          status: 400,
        });
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

      // Create the event along with availability
      createdEvent = await prisma.$transaction(async (prisma) => {
        const event = await prisma.event.create({
          data: {
            name,
            description,
            start_time,
            end_time,
            address,
            city,
            recurring,
            online,
            token_bounty,
            number_of_spots,
            latitude,
            longitude,
            status: "UPCOMING", // Default initial status
            tags,
            organization: {
              connect: { id: organization_id },
            },
            preferredGoals: {
              connect: goalIds.map((goal) => ({ id: goal.id })),
            },
            preferredTraits: {
              connect: traitIds.map((trait) => ({ id: trait.id })),
            },
          },
        });

        console.log("Event created in database:", event);

        console.log("Creating availability records...");
        await prisma.eventPreferredAvailability.createMany({
          data: Object.keys(morning_availability).map((day) => ({
            dayOfWeek: day,
            morningAvailable: morning_availability[day],
            eveningAvailable: evening_availability[day],
            eventId: event.id,
          })),
        });

        return event;
      });
    } catch (error) {
      // If there is an error creating the event, return an error response.
      console.error("Error adding events:", error);
      return new Response("Error adding events: " + error, {
        status: 500,
      });
    }

    console.log("Event created successfully:", createdEvent);
    // Return the created event,
    return new Response(JSON.stringify(createdEvent), {
      status: 200,
    });
  } else {
    // If the account is not an organization, return an error response.
    console.error("Account is not an organization!");
    return new Response("Account is not an organization!", {
      status: 401,
    });
  }
}