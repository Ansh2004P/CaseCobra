import axios from "axios";

export async function getAccessToken(context, events, done) {
  try {
    const res = await axios.post(
      `${process.env.KINDE_SITE_URL}/oauth2/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.KINDE_CLIENT_ID,
        client_secret: process.env.KINDE_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    context.vars.accessToken = res.data.access_token;
    console.log("✅ Token fetched:", context.vars.accessToken.slice(0, 20) + "...");
  } catch (err) {
    console.error("❌ Error fetching token:", err.response?.data || err.message);
  }
  done();
}
