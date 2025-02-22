import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("Received profile update request");

  try {
    const {
      location,
      latitude,
      longitude,
      bio,
      preferredName,
      preferredDist,
      morningAvailability,
      eveningAvailability,
      traits,
      goals,
      userEmail, // user's current email
    } = await req.json();

    console.log("Profile update request data: ", {
      location,
      latitude,
      longitude,
      bio,
      preferredName,
      preferredDist,
      morningAvailability,
      eveningAvailability,
      traits,
      goals,
      userEmail,
    });

    console.log('Attempting to fetch user from database...');
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`Profile update failed: User not found for email ${userEmail}`);
      return NextResponse.json({
        status: 404,
        message: "User not found.",
      });
    }

    console.log('User found: ', user);

    // Fetch trait IDs
    const traitIds = await prisma.trait.findMany({
      where: { name: { in: traits } },
      select: { id: true },
    });

    // Fetch goal IDs
    const goalIds = await prisma.goal.findMany({
      where: { name: { in: goals } },
      select: { id: true },
    });

    console.log('Fetched trait IDs: ', traitIds);
    console.log('Fetched goal IDs: ', goalIds);

    // Update volunteer profile
    const updatedVolunteer = await prisma.$transaction(async (prisma) => {
      const volunteer = await prisma.volunteer.update({
        where: { userId: user.id },
        data: {
          bio: bio,
          location: location,
          preferredName: preferredName,
          preferredDist: preferredDist,
          latitude: latitude,
          longitude: longitude,
          traits: {
            set: traitIds.map((trait) => ({ id: trait.id })),
          },
          goals: {
            set: goalIds.map((goal) => ({ id: goal.id })),
          },
        },
      });

      console.log('Volunteer profile updated in database: ', volunteer);

      console.log('Deleting existing availability for volunteer...');
      await prisma.availability.deleteMany({
        where: { volunteerId: volunteer.id },
      });

      console.log('Creating new availability records...');
      await prisma.availability.createMany({
        data: Object.keys(morningAvailability).map((day) => ({
          dayOfWeek: day,
          morningAvailable: morningAvailability[day],
          eveningAvailable: eveningAvailability[day],
          volunteerId: volunteer.id,
        })),
      });

      return volunteer;
    });

    console.log("Updated volunteer profile: ", updatedVolunteer);

    if (!updatedVolunteer) {
      console.error("Volunteer profile update failed.");
      return NextResponse.json({
        status: 500,
        message: "An unexpected error occurred. Please try again.",
      });
    }
    console.log("Volunteer profile updated successfully.");

    return NextResponse.json({
      status: 200,
      message: "Volunteer profile updated successfully.",
    });
  } catch (e) {
    console.error("Volunteer profile update failed:", e);
    return NextResponse.json({
      status: 500,
      message: "An unexpected error occurred. Please try again.",
    });
  }
}