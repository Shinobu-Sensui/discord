import io from "socket.io-client";
import bot from "./discordAuthenticator.js";
import cmd from "./commands.js";
import ColorMessage from "./features/colorMessage.js";
import { gptweb } from "gpti";
import { config } from "dotenv"
config()

let currentchannel;

const help = `  Commandes Disponibles :
  
  .c [mot] : Recherche dans le dictionnaire.
  Exemple : .c mot

  info + [mot] : Affiche les informations sur un mot spécifique.
  Exemple : info mot
  
  .letters + [mot] : Affiche les lettres uniques d'un mot.
  Exemple : .letters mot
  
  .sy[nombre] + [syllabe] : Recherche de mots en fonction d'une syllabe.
  Exemple : .sy5 er
  
  .photo + [mots clés] : Génère une photo en fonction des mots clés.
  Exemple : .photo montagnes paysage
  
  sai + [phrase] : Permet de discuter et demander des informations au chatbot.
  Exemple : sai comment vas-tu ?`;

const colormessage = new ColorMessage();
const defKey = process.env.DEF_KEY
const defSocket = io.connect("https://defs.opnm.net:443", {
  reconnection: true,
  auth: { token: defKey },
});
let timebot = Date.now();

defSocket.on("connect", () => console.log("(Re)connecté au serveur de defs"));

const channelIDs = [
  "1174680235501961299",
  "1174680280016101416",
  "1174680319429967914",
  "1174680367538647100",
  "1174680418004504626",
  "1171837502668165290",
  "928841166751957012",
];

defSocket.on("def", (w, t, d, channelID) => {
  const channel = bot.channels.cache.get(currentchannel);

  try {
    // Vérifier si l'ID du canal actuel est dans la liste des IDs autorisés
    if (channel && channelIDs.includes(currentchannel)) {
      if (t === "Error 404") {
        channel.send(
          colormessage.msg_yellow(
            `Définition introuvable pour ${w}${
              d ? `, vouliez-vous dire "${d}" ?` : ""
            }`
          )
        );
      } else if (t === "Error 401") {
        channel.send(colormessage.msg_red("Mauvaise requête"));
      } else {
        const definitionsString = d
          .map((def) => JSON.stringify(def).replace(/"/g, ""))
          .join("\n");

        channel.send(
          colormessage.msg_green(
            `Définition ${t} - ${w.toUpperCase()}\n\n${definitionsString}`
          )
        );
      }
    }
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors du traitement des définitions :",
      error
    );
    // Gérer l'erreur de manière appropriée, par exemple, en envoyant un message de log ou en continuant l'exécution du code
  }
});

bot.on("messageCreate", async (channel) => {
  const messages = channel.content.toLowerCase().split(" ");
  const channelID = (currentchannel = channel.channelId);
  const cmds = new cmd();
  const commands = await cmds.commands(messages);
  const firstMessage = messages[0].slice(1);
  const cmdOut = messages.slice(1).join(" ");
  const symbols = [".", "/"];
  const isSpecificChannelAndStartsWithSymbol =
    [
      "1174680235501961299",
      "1174680280016101416",
      "1174680319429967914",
      "1174680367538647100",
      "1174680418004504626",
      "1171837502668165290",
      "928841166751957012",
    ].includes(channelID) && symbols.includes(messages[0][0]);

  const sendMessageSegments = async (message) => {
    const segments = cmds.decouperMessage(message);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const result = colormessage.msg_green(segment);
      channel.channel.send(result);
    }
  };

  if (messages[0].startsWith("sai") && messages[1]) {
    gptweb(
      {
        prompt: cmdOut,
        markdown: false,
      },
      (err, data) => {
        if (err != null) {
          console.log(err);
        } else {
          // Arrêter le "typing" et envoyer la réponse réelle après un délai
          channel.channel.sendTyping();
          setTimeout(async () => {
            await sendMessageSegments(data.gpt);
          }, 1000); // ajustez le délai selon vos besoins
        }
      }
    );
  }

  if (isSpecificChannelAndStartsWithSymbol) {
    if (firstMessage === "time") {
      channel.reply(colormessage.msg_green(cmds.time(timebot)));
    }
    if (firstMessage === "server")
      channel.reply(colormessage.msg_yellow(cmds.computerInfo));
    if (commands) channel.reply(colormessage.msg_blue(commands));
    if (firstMessage === "help" || firstMessage === "aide")
      channel.reply(colormessage.msg_yellow(help));

    cmds.def(defSocket, messages);
  }
});
