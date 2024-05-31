import { checkLatestTweets } from "./twitter";
import { checkLatestYtCommunityPosts, checkLatestYtVideos } from "./youtube";

checkLatestYtVideos();
setInterval(checkLatestYtVideos, 10 * 1000);

checkLatestYtCommunityPosts();
setInterval(checkLatestYtCommunityPosts, 5 * 60 * 1000);

checkLatestTweets();
setInterval(checkLatestTweets, 10 * 1000);
