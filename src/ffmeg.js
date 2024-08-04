const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { filterChars, wait } = require("./utils");
const path = require("path");

async function process_video({ chapters, filePath, duration }) {
  for (let i = 0; i < chapters.length; i++) {
    await ffmpeg(filePath)
      .setStartTime(chapters[i].start_time)
      .setDuration(
        (chapters[i + 1]?.start_time || duration) - chapters[i].start_time
      )
      .output(
        path.join(
          __dirname,
          `./downloads/${filterChars(chapters[i].title)}.mp3`
        )
      )
      .on("end", function (err) {
        if (!err) {
          console.log("conversion Done");
        }
      })
      .on("error", (err) => console.log("error: ", err))
      .run();
    await wait(5 * 1000);
  }
}

module.exports = {
  process_video,
};
