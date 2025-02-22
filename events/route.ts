import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Availability } from "@/components/layout/availabilityfield";

interface AvailabilityData {
  morningAvailability: Availability;
  eveningAvailability: Availability;
}

// Define the fields that can be searched by.
const SEARCH_FIELDS = {
  name: "String",
  description: "String",
  start_time: "DateTime", // Format: "YYYY-MM-DD"
  end_time: "DateTime", // Format: "YYYY-MM-DD"
  organization_id: "String",
  organization: "String",
  tags: "String[]",
  address: "String",
  city: "String",
  token_bounty: "Int",
};

// Define the fields that can be sorted by.
const SORT_FIELDS = [
  "start_time",
  "end_time",
  "name",
  // "distance",     // TODO: Implement distance sorting
  "token_bounty",
];

// Define the sort modes.
const SORT_MODES = ["asc", "desc"];

// Define the default values for the search and sort parameters.
const DEFAULT = {
  sortField: "start_time",
  sortMode: "asc",
  searchMode: null,
  timeAll: false,
};

/**
 * Endpoint for getting events: GET /api/events
 *
 * request parameters (optional):
 * - eventID: an event ID within the database
 * - searchMode: field to search for events. see SEARCH_FIELDS
 * - search: search term to use, not case sensitive
 * - all: boolean to include all events, regardless of time
 * - sortBy: field to use for sorting. see SORT_FIELDS
 * - sortOrder: order to sort by. see SORT_MODES
 *
 * Default behavior for invalid parameters: see DEFAULT
 *
 * @param {Request} request - The incoming request
 */
export async function GET(request: Request) {
  try {
    // Parse the URL to get the parameters for eventID and searchMode.
    const url = new URL(request.url);
    const eventID = url.searchParams.get("eventID");
    let searchMode = url.searchParams.get("searchMode");
    searchMode = searchMode && searchMode in SEARCH_FIELDS ? searchMode : DEFAULT.searchMode;
    const searchTerm = url.searchParams.get("search") || '';

    // Check if the all parameter is present, otherwise use the default.
    const allTime = url.searchParams.get("all") === "true" ? true : DEFAULT.timeAll;

    // Check if the sortBy parameter is present, otherwise use the default.
    let sortField = url.searchParams.get("sortField");
    sortField = sortField && SORT_FIELDS.includes(sortField) ? sortField : DEFAULT.sortField;

    let sortMode = url.searchParams.get("sortMode");
    sortMode = sortMode && SORT_MODES.includes(sortMode) ? sortMode : DEFAULT.sortMode;

    // Get the current time or set to epoch time if allTime is true.
    const currentTime = !allTime ? new Date() : new Date(0);

    // Initialize the events variable.
    let events;

    if (eventID) {
      // If eventID is present, get event by ID and include related data.
      events = await prisma.event.findUnique({
        where: { id: eventID },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          event_volunteers: {
            include: {
              volunteer: {
                select: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          preferredTraits: { select: { name: true } },
          preferredGoals: { select: { name: true } },
          preferredAvailability: true,
          event_applications: {
            where: { status: 'PENDING' },
            include: {
              volunteer: {
                select: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (events) {
        events = processEvent(events);
      }
    } else if (searchMode && searchTerm) {
      // If searchMode and searchTerm are present, search for events.
      const { searchQuery, timeQuery } = parseQuery(searchMode, searchTerm);
      events = await prisma.event.findMany({
        where: { ...searchQuery, ...timeQuery },
        orderBy: { [sortField]: sortMode },
        include: {
          organization: { select: { name: true } },
          event_volunteers: true,
          event_applications: {
            where: { status: { not: 'REJECTED' } }, // Filter out rejected applications
            include: { volunteer: { include: { user: true } } },
          },
          preferredTraits: { select: { name: true } },
          preferredGoals: { select: { name: true } },
          preferredAvailability: true,
        },
      });

      events = events.map(event => processEvent(event));
    } else {
      // Default: get all upcoming events.
      events = await prisma.event.findMany({
        where: { start_time: { gte: currentTime } },
        orderBy: { [sortField]: sortMode },
        include: {
          organization: { select: { name: true } },
          event_volunteers: true,
          event_applications: {
            where: { status: { not: 'REJECTED' } }, // Filter out rejected applications
            include: { volunteer: { include: { user: true } } },
          },
          preferredTraits: { select: { name: true } },
          preferredGoals: { select: { name: true } },
          preferredAvailability: true,
        },
      });

      events = events.map(event => processEvent(event));
    }

    // Return the events.
    return new Response(JSON.stringify(events), { status: 200 });
  } catch (error) {
    // If there is an error getting the events, return an error response.
    console.error(error);
    return new Response("Server error getting events!", { status: 500 });
  }
}

/**
 * Parses the searchMode and searchTerm to create the Prisma query.
 *
 * @param searchMode The field to search for events. see SEARCH_FIELDS
 * @param searchTerm The string to use to search.
 * @returns Formatted query for Prisma.
 */
function parseQuery(searchMode: string | null, searchTerm: string) {
  // Initialize the searchQuery and determine its type or if it is empty.
  let searchQuery = {};
  if (searchMode && SEARCH_FIELDS[searchMode as keyof typeof SEARCH_FIELDS] === "String") {
    searchQuery = {
      [searchMode]: {
        contains: searchTerm,
        mode: "insensitive",
      },
    };
  } else if (searchMode && SEARCH_FIELDS[searchMode as keyof typeof SEARCH_FIELDS] === "String[]") {
    searchQuery = {
      [searchMode]: {
        hasSome: searchTerm.split(","),
      },
    };
  } else if (searchMode && SEARCH_FIELDS[searchMode as keyof typeof SEARCH_FIELDS] === "Int") {
    searchQuery = {
      [searchMode]: parseInt(searchTerm),
    };
  } else {
    searchQuery = {};
  }

  // Initialize the timeQuery and determine its type.
  let timeQuery = {};
  if (searchMode && SEARCH_FIELDS[searchMode as keyof typeof SEARCH_FIELDS] === "DateTime") {
    timeQuery = {
      [searchMode]: {
        gte: new Date(searchTerm + "T00:00:00.000Z"),
        lte: new Date(searchTerm + "T23:59:59.999Z"),
      },
    };
  } else {
    timeQuery = {
      start_time: {
        gte: new Date(),
      },
    };
  }

  // Return the searchQuery and timeQuery.
  return {
    searchQuery,
    timeQuery,
  };
}

/**
 * Process event to transform preferred availability into structured format.
 *
 * @param event The event object.
 * @returns The processed event object.
 */
function processEvent(event: any) {
  const initialPreferredAvailability = {
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
  };

  const preferredAvailability = event.preferredAvailability.reduce((acc: any, curr: any) => {
    const day = curr.dayOfWeek.toLowerCase() as keyof typeof acc.morningAvailability;
    acc.morningAvailability[day] = curr.morningAvailable;
    acc.eveningAvailability[day] = curr.eveningAvailable;
    return acc;
  }, initialPreferredAvailability);

  return {
    ...event,
    preferredAvailability,
  };
}
