import { getLatestIds, setLatestId } from "./utils/db";
import { sendMessage } from "./utils/discord";

const USER_ID = "2455740283";

export async function checkLatestTweets() {
  const latestIds = getLatestIds();

  const res = await fetch(
    `https://axern.space/api/get?platform=twitter&type=user&id=${USER_ID}`,
  );
  const { latest_tweet } = await res.json();

  if (latestIds.twitterTweet !== latest_tweet) {
    const res = await fetch(
      `https://twitter.nia-statistics.com/tweet/${latest_tweet}`,
    );
    const data = await res.json();
    const text = data.d.data.tweetResult.result.legacy.full_text
      .replace(/https:\/\/t\.co\/[A-Za-z0-9]+/g, (url: string) => {
        const fullUrl =
          data.d.data.tweetResult.result.legacy.entities.urls.find(
            (u: any) => u.url === url,
          )?.expanded_url;
        return fullUrl ?? url;
      })
      .replace(
        /@[A-Za-z0-9_]+/g,
        (mention: string) =>
          `[${mention}](https://twitter.com/${mention.slice(1)})`,
      );
    const createdAt = new Date(
      data.d.data.tweetResult.result.legacy.created_at,
    );
    await sendMessage({
      content: "MrBeast made a new tweet!",
      embeds: [
        {
          description: text,
          url: `https://twitter.com/${USER_ID}/status/${latest_tweet}`,
          author: {
            name: "MrBeast",
            url: "https://twitter.com/MrBeast",
            iconUrl:
              "https://pbs.twimg.com/profile_images/994592419705274369/RLplF55e_400x400.jpg",
          },
          color: "#1DA1F2",
          timestamp: createdAt.toISOString(),
        },
      ],
    });
    setLatestId("twitterTweet", latest_tweet);
  }
}
