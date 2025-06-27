import { Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    access_token: string;
    refresh_token: string;
  }
}

dotenv.config();

const router = Router();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
});

router.get("/login", (req, res) => {
  const scopes = ["user-top-read", "user-read-email", "user-read-private"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state-key");
  res.redirect(authorizeURL);
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;

    spotifyApi.setAccessToken(access_token);
    const userData = await spotifyApi.getMe();
    req.session.user = userData.body;

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Auth error:", err);
    res.redirect("/");
  }
});

export default router;
