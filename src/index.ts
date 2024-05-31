import { checkLatestYtVideos } from "./youtube";

checkLatestYtVideos();
setInterval(checkLatestYtVideos, 10 * 1000);
