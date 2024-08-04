const path = require("path");
const ytdl = require("@distube/ytdl-core");

class Downloader {
  constructor({ cookies = [] }) {
    this.header = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
    };
    if (cookies.length) {
      this.agent = ytdl.createAgent(cookies);
    }
    this.downloadPath = path.join(__dirname, "../downloads");
  }

  async downloadVideo() {}

  async downloadAudio() {}

  async downloadPlaylist({ title, videos }) {
    const folder = path.join(
      __dirname,
      "./downloads/" + filterChars(playlist.title)
    );
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    for (const video of videos) {
      await download({
        videoURL: `https://www.youtube.com/watch?v=${video.id}`,
        videoName: video.title,
        playlist: folder,
      });
    }
  }
}

export default Downloader;
