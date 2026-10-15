/**
 * Centralized Academic Intake Utility
 * 
 * Dynamically computes upcoming higher education intakes in China based
 * on the current system date (new Date()), without manual yearly code updates.
 * 
 * Standard Chinese academic intakes:
 * - Spring Intake: March (Month 3)
 * - Autumn Intake: September (Month 9)
 */

export type IntakeMonth = 3 | 9;
export type IntakeSeason = 'Spring' | 'Autumn';

export interface Intake {
  year: number;
  month: IntakeMonth;
  season: IntakeSeason;
  label: string; // e.g. "March 2027"
  fullLabel: string; // e.g. "Spring (March 2027)"
  date: Date;
  value: string;
}

export interface ProgramIntakeAvailability {
  march: boolean;
  september: boolean;
}

/**
 * Standardized intake label formatter
 * E.g.:
 * formatIntakeLabel({ month: 3, year: 2027 }) => "March 2027"
 * formatIntakeLabel({ month: 9, year: 2027 }) => "September 2027"
 */
export function formatIntakeLabel(input: {
  month: IntakeMonth | number;
  year: number;
  includeSeason?: boolean;
}): string {
  const monthName = input.month === 3 ? 'March' : input.month === 9 ? 'September' : `Month ${input.month}`;
  if (input.includeSeason) {
    const season = input.month === 3 ? 'Spring' : 'Autumn';
    return `${season} (${monthName} ${input.year})`;
  }
  return `${monthName} ${input.year}`;
}

/**
 * Computes chronological upcoming intakes relative to a reference date.
 * Default reference date is new Date() (browser/system time).
 */
export function getUpcomingIntakes(referenceDate: Date = new Date(), count = 2): Intake[] {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-12

  const candidates: Array<{ year: number; month: IntakeMonth }> = [];

  // Evaluate current year and the subsequent 3 years
  for (let yr = currentYear; yr <= currentYear + 3; yr++) {
    // March is upcoming if yr > currentYear OR (yr === currentYear && currentMonth <= 3)
    if (yr > currentYear || (yr === currentYear && currentMonth <= 3)) {
      candidates.push({ year: yr, month: 3 });
    }
    // September is upcoming if yr > currentYear OR (yr === currentYear && currentMonth <= 9)
    if (yr > currentYear || (yr === currentYear && currentMonth <= 9)) {
      candidates.push({ year: yr, month: 9 });
    }
  }

  // Sort chronologically
  candidates.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return candidates.slice(0, count).map(({ year, month }) => {
    const season: IntakeSeason = month === 3 ? 'Spring' : 'Autumn';
    const label = formatIntakeLabel({ month, year });
    const fullLabel = `${season} (${label})`;
    return {
      year,
      month,
      season,
      label,
      fullLabel,
      value: fullLabel,
      date: new Date(year, month - 1, 1),
    };
  });
}

/**
 * Filter intakes based on program-specific availability configuration
 */
export function filterIntakesByAvailability(
  intakes: Intake[],
  availability?: ProgramIntakeAvailability
): Intake[] {
  if (!availability) return intakes;
  return intakes.filter((intake) => {
    if (intake.month === 3 && !availability.march) return false;
    if (intake.month === 9 && !availability.september) return false;
    return true;
  });
}

/**
 * Get intake options for dropdown selects and radio groups.
 * Provides 3 upcoming intakes by default so students can plan ahead.
 */
export function getIntakeOptions(referenceDate: Date = new Date(), count = 3): Array<{
  value: string;
  label: string;
  fullLabel: string;
  shortLabel: string;
  year: number;
  month: IntakeMonth;
  season: IntakeSeason;
}> {
  const intakes = getUpcomingIntakes(referenceDate, count);
  return intakes.map((i) => ({
    value: i.fullLabel,
    label: `${i.season} (${i.label})`,
    fullLabel: i.fullLabel,
    shortLabel: i.label,
    year: i.year,
    month: i.month,
    season: i.season,
  }));
}

/**
 * Returns default intake string for initial form state
 */
export function getDefaultIntake(referenceDate: Date = new Date()): string {
  const upcoming = getUpcomingIntakes(referenceDate, 1);
  return upcoming[0]?.fullLabel || `Autumn (September ${referenceDate.getFullYear() + 1})`;
}

/**
 * Formats a clean header summary string for the current upcoming cycle
 * e.g. "March 2027 & September 2027 Intakes"
 */
export function getUpcomingIntakesHeadline(referenceDate: Date = new Date()): string {
  const upcoming = getUpcomingIntakes(referenceDate, 2);
  if (upcoming.length < 2) {
    return upcoming[0]?.label || `${referenceDate.getFullYear() + 1}`;
  }
  return `${upcoming[0].label} & ${upcoming[1].label} Intakes`;
}
