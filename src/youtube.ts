import Parser from "rss-parser";

const CHANNEL_ID = "UCX6OQ3DkcsbYNE6H8uQQuVA";
const rssParser = new Parser();

export async function checkLatestVideos() {
  const data = await rssParser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
  );
  const latest = data.items[0];
  const id = latest.id.split(":")[2];
  console.log(id);
}
