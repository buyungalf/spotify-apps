import { Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";

const router = Router();

router.get("/top-artists", async (req, res) => {
  if (!req.session.access_token) {
    return res.redirect("/login");
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(req.session.access_token);

  try {
    const topArtists = await spotifyApi.getMyTopArtists({ limit: 12 });
    res.render("top-artists", {
      user: req.session.user,
      artists: topArtists.body.items,
    });
  } catch (err) {
    console.error("Failed to fetch top artists:", err);
    res.redirect("/");
  }
});

export default router;
