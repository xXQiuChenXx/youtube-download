require("dotenv").config();
const fs = require("fs");
const path = require("path");
const YouTube = require("youtube-sr").default;
const prompt = require("prompt-sync")();
const { process_video } = require("./src/ffmpeg");
const { wait } = require("./src/utils");
const { searchYouTubeVideos } = require("./src/youtube-search");
const Downloader = require("./src/Downloader");

async function start() {
  const cookies = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./cookies.json"))
  );

  const YTDownload = new Downloader({ cookies });
  if (!fs.existsSync("./downloads")) fs.mkdirSync("./downloads");
  const videoURL = prompt("Youtube video link or channel name: ");
  console.log("Download Video Type:");
  console.log("1. MP3");
  console.log("2. MP4");
  let videoType = prompt("Enter your choice (1, or 2): ");
 
  let skipShorts = prompt(
    "Do you want to download Youtube Shorts? (yes or no): "
  );

  if (videoType === "1" || videoType === 1) videoType = "audio";
  else if (videoType === "2" || videoType === 2) videoType = "video";

  if (skipShorts === "yes" || skipShorts === "y") skipShorts = true;
  else skipShorts = false;

  // const videoURL = "https://www.youtube.com/watch?v=nlYskBsMbmE";
  // const videoURL = "https://www.youtube.com/watch?v=A5pn4-xOgOw";
  // const videoURL = " NTMusicTrends";
  // const videoURL = "https://www.youtube.com/watch?v=nlYskBsMbmE&list=RDnlYskBsMbmE&start_radio=1";
  // const videoURL = "https://www.youtube.com/playlist?list=PLiC7eSfbbxXh2ka0ubC-y1ozKSCtkouUd";
  // const videoURL = "https://www.youtube.com/shorts/7st0X7aAXDQ"

  if (videoURL.startsWith("https://www.youtube.com/playlist")) {
    const playlist = await YouTube.getPlaylist(videoURL);
    await YTDownload.downloadPlaylist({ ...playlist, type: videoType });
  } else if (!videoURL.startsWith("http")) {
    const videos = await searchYouTubeVideos(videoURL);
    for (const video of videos) {
      const videoInfo = await YTDownload.getInfo({
        videoURL: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      });
      if (videoInfo.videoDetails.lengthSeconds <= 60 && skipShorts) continue;
      if (videoType === "audio")
        await YTDownload.downloadAudio({
          videoURL: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          videoTitle: video.snippet.title,
        });
      if (videoType === "video") {
        await YTDownload.downloadVideo({
          videoURL: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          videoTitle: video.snippet.title,
        });
      }
      wait(3000);
    }
  } else {
    const videoInfo = await YTDownload.getInfo({ videoURL });
    // console.log(videoInfo.formats)

    let res;

    if (videoType === "audio")
      res = await YTDownload.downloadAudio({
        videoURL,
        videoTitle: videoInfo.videoDetails.title,
      });
    if (videoType === "video")
      res = await YTDownload.downloadVideo({
        videoURL,
        videoTitle: videoInfo.videoDetails.title,
      });
    const { filePath } = res;

    const chpslength = videoInfo.videoDetails?.chapters.length;

    if (chpslength && chpslength > 2 && false) {
      // The video have youtube chapters, separate them
      await process_video({
        chapters: videoInfo.videoDetails.chapters,
        filePath,
        duration: videoInfo.videoDetails.lengthSeconds * 1000,
      });
      await fs.unlinkSync(filePath);
    }
  }
}

start();
