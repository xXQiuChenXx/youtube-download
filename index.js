require("dotenv").config();
const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const path = require("path");
const YouTube = require("youtube-sr").default;
const { process_video } = require("./ffmpeg");
const { wait } = require("./utils");
const { searchYouTubeVideos } = require("./youtube-search");
const Downloader = require("./src/Downloader");

async function start() {
  const cookies = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./cookies.json"))
  );
  const YTDownload = new Downloader({ cookies });
  // const videoURL = "https://www.youtube.com/watch?v=nlYskBsMbmE";
  // const videoURL = "https://www.youtube.com/watch?v=A5pn4-xOgOw";
  const videoURL = " NTMusicTrends";
  // const videoURL = "https://www.youtube.com/watch?v=nlYskBsMbmE&list=RDnlYskBsMbmE&start_radio=1";
  // const videoURL = "https://www.youtube.com/playlist?list=PLiC7eSfbbxXh2ka0ubC-y1ozKSCtkouUd";
  // const videoURL = "https://www.youtube.com/shorts/7st0X7aAXDQ"

  if (videoURL.startsWith("https://www.youtube.com/playlist")) {
    const playlist = await YouTube.getPlaylist(videoURL);
    return await YTDownload.downloadPlaylist(playlist);
  }

  if (!videoURL.startsWith("http")) {
    const videos = await searchYouTubeVideos(videoURL);
    for (const video of videos) {
      const videoInfo = await YTDownload.getInfo(
        `https://www.youtube.com/watch?v=${video.id.videoId}`
      );
      if (videoInfo.videoDetails.lengthSeconds <= 60) continue;
      await download({
        videoURL: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        videoName: video.snippet.title,
      });
      wait(3000);
    }
    return;
  }

  const videoInfo = await ytdl.getInfo(videoURL, { agent });

  const { filePath } = await download({
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

start();
