import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const CLIENT_ID = "YOUR_DISCORD_CLIENT_ID";
const CLIENT_SECRET = "YOUR_DISCORD_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:3000/callback";

/* LOGIN */
app.get("/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify`;
  res.redirect(url);
});

/* CALLBACK */
app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json();

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const user = await userRes.json();

    const discordTag = `${user.username}#${user.discriminator}`;

    res.redirect(
      `http://localhost:5500/index.html?discord=${discordTag}&id=${user.id}&avatar=${user.avatar}`
    );

  } catch (err) {
    res.send("Login failed");
  }
});

/* START */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
