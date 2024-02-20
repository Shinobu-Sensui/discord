import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import { config } from "dotenv";
config()


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const token = process.env.DISC_KEY 
console.log(token)

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
