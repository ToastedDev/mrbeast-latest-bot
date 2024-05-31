import Parser from "rss-parser";
import { getLatestVideoIds, setLatestVideoId } from "./utils/db";
import { sendMessage } from "./utils/discord";

const CHANNEL_ID = "UCX6OQ3DkcsbYNE6H8uQQuVA";
const rssParser = new Parser();

const ISO8601Duration = (ISO: string) => {
  const units = {
    Y: 31536000,
    M: 2592000,
    D: 86400,
    H: 3600,
    // @ts-expect-error idk man
    M: 60,
    S: 1,
  };

  const unitsKeys = Object.keys(units);
  let newISO = ISO.replace("P", "").replace("T", "");
  let foundedKeys = [];
  let durationISO = [];

  for (let i = 0; i < newISO.length; i++) {
    if (unitsKeys.includes(newISO[i]) == true) {
      foundedKeys.push(newISO[i]);
      newISO = newISO.replace(newISO[i], " ");
    }
  }

  // @ts-expect-error idk man
  newISO = newISO.split(" ");
  // @ts-expect-error idk man
  newISO.pop();

  for (let i = 0; i < foundedKeys.length; i++) {
    durationISO[i] = Number(newISO[i]) * (units as any)[foundedKeys[i]];
  }

  let duration = durationISO.reduce((a, b) => a + b, 0);

  return duration;
};

export async function checkLatestVideos() {
  const latestIds = getLatestVideoIds();

  const data = await rssParser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
  );
  const latest = data.items[0];
  const id = latest.id.split(":")[2];
  if (latestIds.youtubeVideo !== id) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&fields=items(snippet/description,snippet/thumbnails,contentDetails/duration)&id=${id}&key=${process.env.YOUTUBE_API_KEY}`,
    );
    const ytData = await res.json();
    const isShort =
      ISO8601Duration(ytData.items[0].contentDetails.duration) <= 60;
    const url = `https://youtube.com/${isShort ? "shorts/" : "watch?v="}${id}`;
    const firstLineOfDescription =
      ytData.items[0].snippet.description.split("\n")[0];
    let description = firstLineOfDescription;
    if (description.length === 0) description = "*No description*";
    if (description.length > 4095)
      description = description.substring(0, 4095).concat("…");

    await sendMessage({
      content: `MrBeast published a new video on YouTube! ${url}`,
      embeds: [
        {
          title: latest.title,
          description,
          url,
          author: {
            name: "MrBeast",
            url: `https://youtube.com/channel/${CHANNEL_ID}`,
            iconUrl:
              "https://yt3.googleusercontent.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s176-c-k-c0x00ffffff-no-rj",
          },
          imageUrl:
            ytData.items[0].snippet.thumbnails.maxres?.url ??
            ytData.items[0].snippet.thumbnails.high?.url ??
            ytData.items[0].snippet.thumbnails.medium?.url ??
            ytData.items[0].snippet.thumbnails.default?.url,
          color: "#ff0000",
          timestamp: latest.isoDate,
        },
      ],
    });
    setLatestVideoId("youtubeVideo", id);
  }
}
