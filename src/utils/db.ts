import { exists } from "node:fs/promises";

interface Database {
  youtube: {
    latestVideoId: string;
    latestPostId: string;
  };
  twitter: {
    latestTweetId: string;
  };
}

async function initDatabase() {
  if (!(await exists("./db.json"))) {
    await Bun.write(
      "./db.json",
      JSON.stringify({
        youtube: { latestVideoId: "", latestPostId: "" },
        twitter: { latestTweetId: "" },
      } satisfies Database),
    );
  }
}

await initDatabase();

const dbFile = Bun.file("./db.json");
const db: Database = await dbFile.json();

export function getLatestIds() {
  return {
    youtubeVideo: db.youtube.latestVideoId,
    youtubePost: db.youtube.latestPostId,
    twitterTweet: db.twitter.latestTweetId,
  };
}

export function setLatestId(
  type: "youtubeVideo" | "youtubePost" | "twitterTweet",
  id: string,
) {
  switch (type) {
    case "youtubeVideo":
      db.youtube.latestVideoId = id;
      break;
    case "youtubePost":
      db.youtube.latestPostId = id;
      break;
    case "twitterTweet":
      db.twitter.latestTweetId = id;
      break;
    default:
      break;
  }
}

setInterval(async () => {
  await Bun.write(dbFile, JSON.stringify(db));
}, 10_000);
