const API_URL =
  process.env.DOWNFORACROSS_API_URL ?? "downforacross-com.onrender.com";
const SITE_URL =
  process.env.CROSSWITHFRIENDS_SITE_URL ?? "crosswithfriends.com";

export interface PuzzleInfo {
  pid: number;
  content: {
    info: {
      title: string;
      author: string;
      description?: string;
    };
  };
}

interface PuzzleListResponse {
  puzzles?: unknown[];
}

function isPuzzleInfo(x: unknown): x is PuzzleInfo {
  return (
    typeof x === "object" &&
    x !== null &&
    "pid" in x &&
    typeof (x as PuzzleInfo).pid === "number" &&
    "content" in x &&
    typeof (x as PuzzleInfo).content === "object"
  );
}

/**
 * Fetches the first puzzle matching the search term. Throws on network/API error.
 */
export async function getFirstMatchingPuzzle(
  searchTerm = "",
  standardSize = "true",
  miniSize = "true"
): Promise<PuzzleInfo | null> {
  const url = `https://${API_URL}/api/puzzle_list?page=0&pageSize=1&filter[nameOrTitleFilter]=${encodeURIComponent(searchTerm)}&filter[sizeFilter][Mini]=${miniSize}&filter[sizeFilter][Standard]=${standardSize}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = (await response.json()) as PuzzleListResponse;
  if (!json || !Array.isArray(json.puzzles) || json.puzzles.length === 0) {
    return null;
  }

  const first = json.puzzles[0];
  if (!isPuzzleInfo(first)) {
    throw new Error("Unexpected API response shape");
  }
  return first;
}

export async function makeGame(puzzleJSON: PuzzleInfo): Promise<string> {
  const gameID = await getGID();
  const puzzleID = puzzleJSON.pid;

  const response = await fetch(`https://${API_URL}/api/game`, {
    method: "POST",
    body: JSON.stringify({
      gid: gameID,
      pid: puzzleID,
    }),
    headers: {
      "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return `https://${SITE_URL}/beta/game/${gameID}`;
}

interface GidResponse {
  gid?: number;
}

async function getGID(): Promise<number> {
  const response = await fetch(`https://${API_URL}/api/counters/gid`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = (await response.json()) as GidResponse;
  if (json?.gid == null || typeof json.gid !== "number") {
    throw new Error("Unexpected GID response shape");
  }
  return json.gid;
}
