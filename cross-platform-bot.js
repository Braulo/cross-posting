import { readFileSync, statSync } from "fs";
import FormData from "form-data";
import { getAccessTokenTiktok } from "./access-token-tiktok.js";
import axios from "axios";
import { getAccessTokenYoutube } from "./access-token-youtube.js";

// Load the video file
const VIDEO_PATH = "./vid0.mp4"; // Change this to your video file
// const VIDEO_DATA = fs.createReadStream(VIDEO_PATH);
const VIDEO_DATA = readFileSync(VIDEO_PATH);
const VIDEO_SIZE = statSync(VIDEO_PATH).size;

const uploadToYouTube = async () => {
  const ACCESS_TOKEN = await getAccessTokenYoutube();

  const formData = new FormData();

  // The metadata (snippet and status) as a JSON object
  const metadata = {
    snippet: {
      title: "Your video title",
      description: "Your video description",
    },
    status: {
      privacyStatus: "public", // You can change this to 'public' or 'unlisted' if desired
    },
  };

  formData.append("snippet", JSON.stringify(metadata)); // Metadata must be JSON stringified
  formData.append("video", VIDEO_DATA); // Video binary data

  try {
    const response = await axios.post(
      "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart",
      formData,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`, // Include the access token
          "Content-Type": "multipart/form-data",
        },
      } // Correct header for multipart request
    );
    console.log("Uploaded to YouTube:", response.data);
  } catch (error) {
    console.error("Error uploading to YouTube:", error.response?.data || error.message);
  }
};

const uploadToTikTok = async () => {
  const ACCESS_TOKEN = await getAccessTokenTiktok();

  // Step 1: Initialize the post to get the upload URL
  const postInfo = {
    title: "Your video title", // Your video title
    privacy_level: "MUTUAL_FOLLOW_FRIENDS", // Set according to your privacy preferences
    disable_duet: false,
    disable_comment: true,
    disable_stitch: false,
    video_cover_timestamp_ms: 1000, // Optional: set the video cover timestamp in milliseconds
  };

  const sourceInfo = {
    source: "FILE_UPLOAD",
    video_size: VIDEO_SIZE, // Set the size of the video
    chunk_size: VIDEO_SIZE, // Assuming single chunk upload for simplicity
    total_chunk_count: 1, // Single chunk upload
  };

  try {
    // Initialize the post
    const initResponse = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        post_info: postInfo,
        source_info: sourceInfo,
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`, // Ensure the access token is valid and fresh
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    const { upload_url } = initResponse.data.data; // Get the upload URL
    console.log("Upload URL received:", upload_url);

    // Step 2: Upload the video to the received upload_url
    const formData = new FormData();
    formData.append("video", VIDEO_DATA); // Append video data to FormData

    const uploadResponse = await put(
      upload_url, // The URL to upload the video
      VIDEO_DATA, // The video file data
      {
        headers: {
          "Content-Type": "video/mp4", // Set appropriate content type based on your video format
          "Content-Length": VIDEO_SIZE, // Set the video size
          "Content-Range": `bytes 0-${VIDEO_SIZE - 1}/${VIDEO_SIZE}`, // For single chunk upload
        },
      }
    );

    console.log("Video uploaded successfully:", uploadResponse.data);
  } catch (error) {
    console.error("Error during TikTok video upload:", error.response?.data || error.message);
  }
};

(async () => {
  //   await uploadToFacebook();
  //   await uploadToInstagram();
  await uploadToYouTube();
  // await uploadToTikTok();
})();
