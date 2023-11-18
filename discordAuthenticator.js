import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const token = "MTE3Mjg5MTI3NjI3OTAzMzg4Ng.GmhJxX.WK7VBT3nt2XQh3D6_T7wV0Wc5oh1O6Ff6Ooxqw"
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
