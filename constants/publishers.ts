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
