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

  if (latestIds.instagramPost !== data.instagram.id) {
    await sendMessage({
      content: `MrBeast posted a new ${data.instagram.isReel ? "reel" : "post"} on Instagram!`,
      embeds: [
        {
          title: data.instagram.title,
          url: `https://www.instagram.com/${data.instagram.isReel ? "reel" : "p"}/${data.instagram.id}`,
          author: {
            name: "MrBeast",
            url: "https://www.instagram.com/mrbeast",
            iconUrl:
              "https://instagram.fmnl25-5.fna.fbcdn.net/v/t51.2885-19/31077884_211593632905749_1394765701385814016_n.jpg?stp=dst-jpg_s320x320&_nc_ht=instagram.fmnl25-5.fna.fbcdn.net&_nc_cat=1&_nc_ohc=55a0MDL6ibcQ7kNvgEeB1X-&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBj8XRH63P-vYVLOUXarL6IDrbRqXtZ2xi0OsDLyjPBfA&oe=6660BBCF&_nc_sid=8b3546",
          },
          imageUrl: data.instagram.thumbnail,
          color: "#E1306C",
          timestamp: data.instagram.publishedAt,
        },
      ],
    });
    setLatestId("instagramPost", data.instagram.id);
  }
}
