import express from "express";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import topArtists from "./routes/topArtists";

dotenv.config();

const app = express();
const PORT = 3000;

// view & public
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
  })
);

// routes
app.get("/", (req, res) => {
  res.render("index", { title: "Spotify Stat App" });
});
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(topArtists);

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
