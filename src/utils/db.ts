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

async function getLatestVideoIds() {
  return {
    youtubeVideo: db.youtube.latestVideoId,
  };
}

setInterval(async () => {
  await Bun.write(dbFile, JSON.stringify(db));
}, 10_000);
