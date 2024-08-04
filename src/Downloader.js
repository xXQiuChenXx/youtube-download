import { filterChars } from "./utils";

const path = require("path");
const ytdl = require("@distube/ytdl-core");
const { wait } = require("./utils");

class Downloader {
  constructor({ cookies = [] }) {
    this.header = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
    };
    if (cookies.length) {
      this.agent = ytdl.createAgent(cookies);
    }
  }

  async getInfo({ videoURL, options }) {
    return await ytdl.getInfo(videoURL, {
      agent: this.agent,
      ...options,
    });
  }
  async downloadVideo({ videoURL, videoTitle, playlist, quality = "highest" }) {
    return new Promise((resolve, reject) => {
      const videoName = filterChars(videoTitle);
      const filePath = path.join(
        __dirname,
        `../downloads/${playlist ? `${playlist}/` : ""}${videoName}.mp4`
      );
      const videoStream = ytdl(videoURL, {
        requestOptions: this.header,
        quality,
        agent: this.agent,
        filter: "videoandaudio",
      });

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
        resolve({ error: err, success: false });
      });

      output.on("error", (err) => {
        console.error("Error during file write:", err);
        resolve({ error: err, success: false });
      });

      output.on("finish", () => {
        console.log(`Downloaded ${videoName}.mp3`);
        resolve({ filePath, success: true });
      });
    });
  }
  async downloadAudio({ videoURL, videoTitle, playlist, quality = "highest" }) {
    return new Promise((resolve, reject) => {
      const videoName = filterChars(videoTitle);
      const filePath = path.join(
        __dirname,
        `../downloads/${playlist ? `${playlist}/` : ""}${videoName}.mp3`
      );
      const videoStream = ytdl(videoURL, {
        requestOptions: this.header,
        quality,
        agent: this.agent,
        filter: "audioonly",
      });

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
        resolve({ error: err, success: false });
      });

      output.on("error", (err) => {
        console.error("Error during file write:", err);
        resolve({ error: err, success: false });
      });

      output.on("finish", () => {
        console.log(`Downloaded ${videoName}.mp3`);
        resolve({ filePath, success: true });
      });
    });
  }

  async downloadPlaylist({ title, videos, type }) {
    const playlist = filterChars(title);
    const folder = path.join(__dirname, "./downloads/" + playlist);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    for (const video of videos) {
      const videoInfo = {
        videoURL: `https://www.youtube.com/watch?v=${video.id}`,
        videoName: video.title,
        playlist,
      };
      if (type === "video") await this.downloadVideo(videoInfo);
      if (type === "audio") await this.downloadAudio(videoInfo);
      await wait(3000)
    }
  }
}

export default Downloader;
