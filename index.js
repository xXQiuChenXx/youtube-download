require("dotenv").config();
const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const path = require("path");
const YouTube = require("youtube-sr").default;
const prompt = require("prompt-sync")();
const { process_video } = require("./ffmpeg");
const { wait } = require("./src/utils");
const { searchYouTubeVideos } = require("./youtube-search");
const Downloader = require("./src/Downloader");

async function start() {
  const cookies = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./cookies.json"))
  );
  const YTDownload = new Downloader({ cookies });

  const videoURL = prompt("Youtube video link or channel name: ");
  console.log("Please choose a download format:");
  console.log("1. MP4");
  console.log("2. MP3");
  const choice = prompt("Enter your choice (1, 2, or 3): ");
  let skipShorts = prompt(
    "Do you want to download Youtube Shorts? (yes or no)"
  );

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
    await YTDownload.downloadPlaylist(playlist);
  } else if (!videoURL.startsWith("http")) {
    const videos = await searchYouTubeVideos(videoURL);
    for (const video of videos) {
      const videoInfo = await YTDownload.getInfo(
        `https://www.youtube.com/watch?v=${video.id.videoId}`
      );
      if (videoInfo.videoDetails.lengthSeconds <= 60 && skipShorts) continue;
      await YTDownload.downloadAudio({
        videoURL: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        videoName: video.snippet.title,
      });
      wait(3000);
    }
  } else {
    const videoInfo = await YTDownload.getInfo(videoURL);

    const { filePath } = await YTDownload.downloadAudio({
      videoURL,
      videoName: videoInfo.videoDetails.title,
    });

    const chpslength = videoInfo.videoDetails?.chapters.length;

    if (chpslength && chpslength > 2) {
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
