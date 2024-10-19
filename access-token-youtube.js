import { google } from "googleapis";
import { readFileSync, writeFile } from "fs";
import { createInterface } from "readline";
import "dotenv/config";

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const getAccessTokenYoutube = () => {
  try {
    const access_token_file_content = JSON.parse(
      readFileSync("./access_token/youtube-access-token.json")
    );

    if (access_token_file_content.access_token) {
      return access_token_file_content.access_token;
    }
  } catch (error) {}

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this URL: ", authUrl);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the auth-code from that page here: ", (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);

      // Save the token for later use
      writeFile("./access_token/youtube-access-token.json", JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to youtube-access-token.json");
      });

      oauth2Client.setCredentials(token);
      console.log("Access token:", token.access_token);
    });
  });
};
