import { Router } from "express";
import SpotifyWebApi from "spotify-web-api-node";

const router = Router();

router.get("/statue-of-god", async (req, res) => {
  if (!req.session.access_token) return res.redirect("/login");

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(req.session.access_token);

  try {
    const topTracks = await spotifyApi.getMyTopTracks({ limit: 50 });
    const albumsMap = new Map<string, SpotifyApi.AlbumObjectSimplified>();

    topTracks.body.items.forEach((track) => {
      const album = track.album;
      if (!albumsMap.has(album.id)) {
        albumsMap.set(album.id, album);
      }
    });

    const topAlbums = Array.from(albumsMap.values());

    res.render("statue-of-god", {
      user: req.session.user,
      albums: topAlbums,
    });
  } catch (err) {
    console.error("Statue of god error:", err);
    res.redirect("/");
  }
});

export default router;
