const apiKey = process.env.API_KEY;

async function searchYouTubeVideos(channelId) {
  try {
    const ch_params = new URLSearchParams({
      key: apiKey,
      q: channelId,
      part: "snippet,id",
      order: "date",
      maxResults: 1,
      type: "channel",
    });

    const ch_url = new URL(
      `https://www.googleapis.com/youtube/v3/search?${ch_params.toString()}`
    );

    const response = await fetch(ch_url.toString());
    const ch_data = await response.json();
    console.log(ch_data);
    let videos = [];
    let token;

    for (let i = 0; i < 6; i++) {
      const params = new URLSearchParams({
        key: apiKey,
        channelId: ch_data.items[0].snippet.channelId,
        part: "snippet,id",
        order: "date",
        maxResults: 100,
        type: "video",
        pageToken: token,
      });
      const url = new URL(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
      );
      const res = await fetch(url.toString());
      const data = await res.json();
      token = data.nextPageToken;
      if (data.items) videos = videos.concat(data.items);
    }

    videos.slice(0, 10).forEach((item) => {
      console.log(`Title: ${item.snippet.title}`);
      console.log(`Video ID: ${item.id.videoId}`);
      console.log(`URL: https://www.youtube.com/watch?v=${item.id.videoId}`);
      console.log("---");
    });
    return videos;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

module.exports = {
  searchYouTubeVideos,
};
