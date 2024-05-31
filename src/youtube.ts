import Parser from "rss-parser";
import { getLatestVideoIds, setLatestVideoId } from "./utils/db";

const CHANNEL_ID = "UCX6OQ3DkcsbYNE6H8uQQuVA";
const rssParser = new Parser();

export async function checkLatestVideos() {
  const latestIds = getLatestVideoIds();

  const data = await rssParser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
  );
  const latest = data.items[0];
  const id = latest.id.split(":")[2];
  if (latestIds.youtubeVideo !== id) {
    console.log("New video found!");
    console.log(latest);
    latestIds.youtubeVideo = id;
    setLatestVideoId("youtubeVideo", id);
  }
}
