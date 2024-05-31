import Parser from "rss-parser";
import { getLatestIds, setLatestId } from "./utils/db";
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

export async function checkLatestYtVideos() {
  const latestIds = getLatestIds();

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
    setLatestId("youtubeVideo", id);
  }
}

function parseRelativeTime(timeString: string) {
  // Create a mapping of time units to their equivalent in milliseconds
  const timeUnits = {
    second: 1000,
    seconds: 1000,
    minute: 1000 * 60,
    minutes: 1000 * 60,
    hour: 1000 * 60 * 60,
    hours: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    days: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    weeks: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 30,
    months: 1000 * 60 * 60 * 24 * 30,
    year: 1000 * 60 * 60 * 24 * 365,
    years: 1000 * 60 * 60 * 24 * 365,
  };

  // Regular expression to match the input string
  const regex =
    /(\d+)\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago/;
  const match = timeString.match(regex);

  if (!match) {
    throw new Error("Invalid time string format");
  }

  // Extract the number and unit from the match
  const number = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  // Calculate the milliseconds to subtract based on the unit
  const millisecondsToSubtract = number * (timeUnits as any)[unit];

  // Create a new date object for the current date and time
  const currentDate = new Date();

  // Subtract the calculated milliseconds from the current date
  const pastDate = new Date(currentDate.getTime() - millisecondsToSubtract);

  // Return the calculated date
  return pastDate;
}

export async function checkLatestYtCommunityPosts() {
  const latestIds = getLatestIds();

  const url = `https://www.youtube.com/channel/${CHANNEL_ID}/community`;
  const res = await fetch(url);
  const html = await res.text();
  const initialData = JSON.parse(
    "{" + html.split("var ytInitialData = {")[1].split("};")[0] + "}",
  );
  const latest = initialData.contents.twoColumnBrowseResultsRenderer.tabs.find(
    (tab: any) => tab.tabRenderer.title === "Community",
  ).tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer
    .contents[0].backstagePostThreadRenderer.post.backstagePostRenderer;
  const id = latest.postId;
  if (latestIds.youtubePost !== id) {
    const url = `https://youtube.com/post/${id}`;
    const text = latest.contentText.runs[0].text;
    let description = text;
    if (description.length > 4095)
      description = description.substring(0, 4095).concat("…");
    const image =
      "postMultiImageRenderer" in latest.backstageAttachment
        ? latest.backstageAttachment.postMultiImageRenderer.images[0]
            .backstageImageRenderer.image
        : latest.backstageAttachment.backstageImageRenderer.image;
    const imageUrl = image.thumbnails.sort(
      (a: any, b: any) => b.width * b.height - a.width * a.height,
    )[0].url;
    const relativeTime = latest.publishedTimeText.runs[0].text;
    await sendMessage({
      content: "MrBeast made a new community post!",
      embeds: [
        {
          description: text,
          url,
          author: {
            name: "MrBeast",
            url: `https://youtube.com/channel/${CHANNEL_ID}`,
            iconUrl:
              "https://yt3.googleusercontent.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s176-c-k-c0x00ffffff-no-rj",
          },
          imageUrl,
          color: "#ff0000",
          timestamp: parseRelativeTime(relativeTime).toISOString(),
        },
      ],
    });
    setLatestId("youtubePost", id);
  }
}
