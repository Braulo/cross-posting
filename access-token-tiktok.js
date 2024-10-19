import axios from "axios";
import { randomBytes } from "crypto";
import { createInterface } from "readline";
import "dotenv/config";
import { readFileSync, writeFile } from "fs";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

export const getAccessTokenTiktok = async () => {
  console.log("omegalul");
  try {
    const access_token_file_content = JSON.parse(
      readFileSync("./access_token/tiktok-access-token.json")
    );

    if (access_token_file_content.access_token) {
      return access_token_file_content.access_token;
    }
  } catch (error) {}

  const csrfState = randomBytes(16).toString("hex"); // CSRF token

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&scope=user.info.basic,video.upload,video.publish&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&state=${csrfState}`;

  console.log("Authorize this app by visiting this URL: ", authUrl);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the auth-code from TikTok here: ", async (code) => {
    rl.close();

    const { data } = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("ACCESS_TOKEN TIKTOK", data);

    writeFile("./access_token/tiktok-access-token.json", JSON.stringify(data), (err) => {
      if (err) return console.error(err);
      console.log("Token stored to tiktok-access-token.json");
    });

    return data;
  });
};
