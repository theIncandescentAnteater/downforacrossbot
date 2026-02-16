export const PUBLISHER_IDS = [
  "nyt",
  "lat",
  "usa",
  "wsj",
  "newsday",
  "universal",
  "new yorker",
] as const;

export type PublisherId = (typeof PUBLISHER_IDS)[number];

export const PUBLISHERS: { id: PublisherId; label: string }[] =
  PUBLISHER_IDS.map((id) => ({ id, label: id }));

/** Page 1 button ids (plus "pg2" for "other"). */
export const PAGE1_IDS: PublisherId[] = ["nyt", "lat", "usa"];

/** Page 2 button ids (plus "pg1" for "back"). */
export const PAGE2_IDS: PublisherId[] = [
  "wsj",
  "newsday",
  "universal",
  "new yorker",
];

export function getPuzzleNameFormat(
  publisherId: PublisherId,
  date: Date
): string {
  const d = String(date.getDate());
  const dd = d.padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const monthShort = date.toLocaleString("en-US", { month: "short" });
  const yyyy = date.getFullYear();
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = weekdays[date.getDay()];
  const weekdayShort = weekdaysShort[date.getDay()];

  switch (publisherId) {
    case "nyt":
      return `NY Times, ${weekday}, ${month} ${d}, ${yyyy}`;
    case "lat":
      return `LA Times, ${weekdayShort}, ${monthShort} ${d}, ${yyyy}`;
    case "usa":
      return `USA Today ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    case "wsj":
      return `WSJ ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    case "newsday":
      return `Newsday ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    case "universal":
      return `Universal Crossword ${weekday}`;
    case "new yorker":
      return `New Yorker ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    default:
      return "";
  }
}
