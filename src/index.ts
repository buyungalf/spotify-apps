import express from "express";
import path from "path";
import dotenv from "dotenv";
import SpotifyWebApi from "spotify-web-api-node";
import session from "express-session";
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    access_token: string;
    refresh_token: string;
  }
}

dotenv.config();

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));

// Setup session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Spotify config
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
});

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Spotify Stat App" });
});

app.get("/login", (req, res) => {
  const scopes = ["user-top-read", "user-read-email", "user-read-private"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state-key");
  res.redirect(authorizeURL);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    // Simpan token ke session
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

app.get("/dashboard", (req, res) => {
  if (!req.session.access_token) {
    return res.redirect("/login");
  }

  res.render("dashboard", {
    user: req.session.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
