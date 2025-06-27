import { Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    access_token: string;
    refresh_token: string;
  }
}
const router = Router();

router.get("/dashboard", async (req, res) => {
  if (!req.session.access_token) {
    return res.redirect("/login");
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(req.session.access_token);

  try {
    const topTracks = await spotifyApi.getMyTopTracks({ limit: 12 });
    const user = req.session.user;

    res.render("dashboard", {
      user,
      tracks: topTracks.body.items,
    });
  } catch (err) {
    console.error("Failed to get top tracks:", err);
    res.redirect("/login");
  }
});

export default router;
