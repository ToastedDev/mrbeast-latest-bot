import { getLatestIds, setLatestId } from "./utils/db";
import { sendMessage } from "./utils/discord";

export async function checkLatestTiktokAndInstagram() {
  const latestIds = getLatestIds();

  const res = await fetch("https://api.toasted.dev/mrbeast-latest");
  const data = await res.json();

  if (latestIds.tiktokVideo !== data.tiktok.id) {
    await sendMessage({
      content: "MrBeast posted a new video on TikTok!",
      embeds: [
        {
          title: data.tiktok.title,
          url: `https://www.tiktok.com/@mrbeast/video/${data.tiktok.id}`,
          author: {
            name: "MrBeast",
            url: "https://www.tiktok.com/@mrbeast",
            iconUrl:
              "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/7310051540889239595~c5_720x720.jpeg?lk3s=a5d48078&nonce=48586&refresh_token=df6c04f0869ee6c8bcc5bb62fcf1f505&x-expires=1717322400&x-signature=Cpo9se%2FT4TkZtRrzPn2jSfMSA%2BY%3D&shp=a5d48078&shcp=81f88b70",
          },
          imageUrl: data.tiktok.thumbnail,
          color: "#ec4899",
          timestamp: data.tiktok.publishedAt,
        },
      ],
    });
    setLatestId("tiktokVideo", data.tiktok.id);
  }

  // TODO: add instagram
}
