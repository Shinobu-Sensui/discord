import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const token = "MTE3Mjg5MTI3NjI3OTAzMzg4Ng.GLW4_b.hazE5i6IWvT7-LXV-VwyZtdY1MvV2JpUk7BZqs"
// MTE3NTE4ODIzNDIwNTE0NzI2Ng.GkXYfY.uITc-mTyXkKu4DyIuQ-WpXaEaTelYSJeTFEScA


// lorsque le bot est prêt
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: `perfect system`, type: ActivityType.Playing }],
    status: "perfect ststem",
  });
});

// le bot se connecte
client.login(token);

export default client;
