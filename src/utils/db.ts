import { exists } from "node:fs/promises";

interface Database {
  youtube: {
    latestVideoId: string;
  };
}

async function initDatabase() {
  if (!(await exists("./db.json"))) {
    await Bun.write(
      "./db.json",
      JSON.stringify({
        youtube: { latestVideoId: "" },
      } satisfies Database),
    );
  }
}

initDatabase();

const dbFile = Bun.file("./db.json");
const db: Database = await dbFile.json();

export async function getLatestVideoIds() {
  return {
    youtubeVideo: db.youtube.latestVideoId,
  };
}

export async function setLatestVideoId(type: "youtubeVideo", id: string) {
  switch (type) {
    case "youtubeVideo":
      db.youtube.latestVideoId = id;
      break;
    default:
      break;
  }
}

setInterval(async () => {
  await Bun.write(dbFile, JSON.stringify(db));
}, 10_000);
