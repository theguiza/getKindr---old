// Interfaces
interface AvailabilityData {
  morningAvailability: { [day: string]: boolean };
  eveningAvailability: { [day: string]: boolean };
}
interface Availability {
  dayOfWeek: string;
  morningAvailable: boolean;
  eveningAvailable: boolean;
}

interface Trait {
  id: number;
  name: string;
}

interface Goal {
  id: number;
  name: string;
}

interface VolunteerFactors {
  latitude: number | null;
  longitude: number | null;
  preferredDist: number | null;
  availability: AvailabilityData;
  traits: Trait[];
  goals: Goal[];
  rating: number | null;
}

interface EventPreferences {
  latitude: number;
  longitude: number;
  preferredAvailability: AvailabilityData;
  preferredTraits: Trait[];
  preferredGoals: Goal[];
}

const WEIGHTS = {
  location: 0.15,
  availability: 0.15,
  traits: 0.2,
  goals: 0.25,
  rating: 0.25
}

export function calculateMatchScore(
  volunteerFactors: VolunteerFactors,
  eventPreferences: EventPreferences
): number {
  // Calculate raw scores
  const rawAvailabilityScore = calculateAvailabilityScore(
    volunteerFactors.availability,
    eventPreferences.preferredAvailability
  );

  const rawGoalsScore = calculateGoalsScore(
    volunteerFactors.goals,
    eventPreferences.preferredGoals
  );

  const rawTraitsScore = calculateTraitsScore(
    volunteerFactors.traits,
    eventPreferences.preferredTraits
  );

  const rawLocationScore = calculateLocationScore(
    volunteerFactors.latitude,
    volunteerFactors.longitude,
    volunteerFactors.preferredDist,
    eventPreferences.latitude,
    eventPreferences.longitude
  );

  const rawRatingScore = calculateRatingScore(volunteerFactors.rating);

  // Normalize and apply weights
  const weightedAvailabilityScore = rawAvailabilityScore * WEIGHTS.availability;
  const weightedGoalsScore = rawGoalsScore * WEIGHTS.goals;
  const weightedTraitsScore = rawTraitsScore * WEIGHTS.traits;
  const weightedLocationScore = rawLocationScore * WEIGHTS.location;
  const weightedRatingScore = rawRatingScore * WEIGHTS.rating;

  // Aggregate the weighted scores
  const matchScore =
    weightedAvailabilityScore +
    weightedGoalsScore +
    weightedTraitsScore +
    weightedLocationScore +
    weightedRatingScore;

  return matchScore;
}

function calculateAvailabilityScore(
  volunteerAvailability: AvailabilityData,
  preferredAvailability: AvailabilityData
): number {
  const days = Object.keys(preferredAvailability.morningAvailability);

  let matchCount = 0;
  let totalPreferences = 0;

  days.forEach((day) => {
    if (preferredAvailability.morningAvailability[day] === true) {
      totalPreferences += 1;
      if (
        volunteerAvailability.morningAvailability[day] === true
      ) {
        matchCount += 1;
      }
    }
    if (preferredAvailability.eveningAvailability[day] === true) {
      totalPreferences += 1;
      if (
        volunteerAvailability.eveningAvailability[day] === true
      ) {
        matchCount += 1;
      }
    }
  });

  // If no preferences have been set, volunteer receives a full score for this factor
  if (totalPreferences === 0) {
    return 1;
  }

  return matchCount / totalPreferences; // Score as a fraction of total preferences
}

function calculateGoalsScore(
  volunteerGoals: Goal[],
  preferredGoals: Goal[]
): number {
  if (preferredGoals.length === 0) {
    return 1; // If no preferences have been set, volunteer receives a full score for this factor
  }

  let matchCount = 0;
  preferredGoals.forEach((preferredGoal) => {
    if (volunteerGoals.some((goal) => goal.id === preferredGoal.id)) {
      matchCount += 1;
    }
  });

  return matchCount / preferredGoals.length; // Score as a fraction of total preferred goals
}

function calculateTraitsScore(
  volunteerTraits: Trait[],
  preferredTraits: Trait[]
): number {
  if (preferredTraits.length === 0) {
    return 1; // If no preferences have been set, volunteer receives a full score for this factor
  }

  let matchCount = 0;
  preferredTraits.forEach((preferredTrait) => {
    if (volunteerTraits.some((trait) => trait.id === preferredTrait.id)) {
      matchCount += 1;
    }
  });

  return matchCount / preferredTraits.length; // Score as a fraction of total preferred traits
}

function calculateLocationScore(
  volunteerLat: number | null,
  volunteerLong: number | null,
  preferredDist: number | null,
  eventLat: number,
  eventLong: number
): number {
  if (volunteerLat === null || volunteerLong === null || preferredDist === null) {
    return 0;
  }

  const distance = getDistanceFromLatLonInKm(
    volunteerLat,
    volunteerLong,
    eventLat,
    eventLong
  );

  if (distance <= preferredDist) {
    return 1; // Perfect score if within preferred distance
  }

  // Progressive score reduction for each unit distance beyond the preferred distance
  const maxPenalty = 1;
  const penalty = Math.min(maxPenalty, (distance - preferredDist) / preferredDist);
  return 1 - penalty; // Reduced score based on distance
}

function calculateRatingScore(rating: number | null): number {
  if (rating === null) {
    return 0;
  }
  return rating; // Proportional to the maximum rating
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export type { AvailabilityData, Availability, Trait, Goal, VolunteerFactors, EventPreferences};