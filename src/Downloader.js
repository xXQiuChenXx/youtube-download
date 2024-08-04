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
}

export default Downloader;
