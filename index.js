require('dotenv').config()
const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const path = require("path");
const YouTube = require("youtube-sr").default;
const { process_video } = require("./ffmpeg");
const { filterChars, wait } = require("./utils");
const { searchYouTubeVideos } = require("./youtube-search");

const agent = ytdl.createAgent(
  JSON.parse(fs.readFileSync(path.join(__dirname, "./cookies.json")))
);

async function download({ videoURL, videoName, playlist }) {
  const videoStream = ytdl(videoURL, {
    requestOptions: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
    },
    agent,
    filter: "audioonly",
  });

  videoName = filterChars(videoName);

  const filePath = path.join(
    __dirname,
    `./downloads/${playlist ? `${playlist}/` : ""}${videoName}.mp3`
  );

  const output = fs.createWriteStream(filePath);

  videoStream.on("progress", (chunkLength, downloaded, total) => {
    const percent = ((downloaded / total) * 100).toFixed(2);
    const downloadedMB = (downloaded / 1024 / 1024).toFixed(2);
    const totalMB = (total / 1024 / 1024).toFixed(2);
    console.log(
      `Progress: ${percent}% (${downloadedMB}MB of ${totalMB}MB), ChunkSize: ${chunkLength}`
    );
  });

  videoStream.pipe(output);

  videoStream.on("error", (err) => {
    console.error("Error during download:", err);
  });

  output.on("error", (err) => {
    console.error("Error during file write:", err);
  });

  output.on("finish", () => {
    console.log(`Downloaded ${videoName}.mp3`);
  });

  await wait(3 * 1000);
  return { filePath };
}

async function start() {
  // const videoURL = "https://www.youtube.com/watch?v=nlYskBsMbmE";
  // const videoURL = "https://www.youtube.com/watch?v=A5pn4-xOgOw";
  const videoURL = " NTMusicTrends";
  // const videoURL = "https://www.youtube.com/watch?v=nlYskBsMbmE&list=RDnlYskBsMbmE&start_radio=1";
  // const videoURL = "https://www.youtube.com/playlist?list=PLiC7eSfbbxXh2ka0ubC-y1ozKSCtkouUd";
  // const videoURL = "https://www.youtube.com/shorts/7st0X7aAXDQ"

  if (videoURL.startsWith("https://www.youtube.com/playlist")) {
    const playlist = await YouTube.getPlaylist(videoURL);
    const folder = filterChars(playlist.title);
    const absPath = path.join(__dirname, "./downloads/" + folder);
    if (!fs.existsSync(absPath)) fs.mkdirSync(absPath);
    for (const video of playlist.videos.slice(0, 5)) {
      await download({
        videoURL: `https://www.youtube.com/watch?v=${video.id}`,
        videoName: video.title,
        playlist: folder,
      });
    }
    return;
  }

  if (!videoURL.startsWith("http")) {
    const videos = await searchYouTubeVideos(videoURL);
    for (const video of videos) {
      const videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.id.videoId}`, { agent });
      if(videoInfo.videoDetails.lengthSeconds <= 60) continue;
      await download({
        videoURL: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        videoName: video.snippet.title,
      });
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
