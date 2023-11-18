import io from "socket.io-client";
import bot from "./discordAuthenticator.js";
import cmd from "./commands.js";
import ColorMessage from "./features/colorMessage.js";
import { Hercai } from "hercai";

const herc = new Hercai();
const help = `  Commandes Disponibles :
  
  .c [mot] : Recherche dans le dictionnaire.
  Exemple : .c mot
  
  .a : Recherche des adverbes.
  Exemple : .a
  
  .g : Recherche des gentilés.
  Exemple : .g
  
  .f : Recherche des fleurs.
  Exemple : .f
  
  max + [taille] : Affiche tous les mots en fonction d'une page.
  Exemple : max 10
  
  sub[nombre] + [syllabe] : Recherche de mots hardcore par syllabe.
  Exemple : sub5 + er
  
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
const defSocket = io.connect("https://defs.opnm.net:443", {
  reconnection: true,
  auth: { token: "QxVBlbf6P0JgWh9QflzCQcLcooX8yDj2054OaIfEztPo0fRXXs" },
});
let timebot = Date.now();

defSocket.on("connect", () => console.log("(Re)connecté au serveur de defs"));

defSocket.on("def", (w, t, d) => {
  const channel = bot.channels.cache.get("1171837502668165290");

  try {
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
  const channelID = channel.channelId;
  const cmds = new cmd();
  const commands = await cmds.commands(messages);
  const firstMessage = messages[0].slice(1);
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

  const sendMessageSegments = (message) => {
    const segments = cmds.decouperMessage(message);
    console.log(segments);
    segments.forEach((segment) => {
      const result = colormessage.msg_yellow(segment);
      channel.channel.send(result);
    });
  };

  if (messages[0].startsWith("sai") && messages[1]) {
    try {
      /* Question Example For TypeScript */
      channel.channel.sendTyping();
      herc
        .question({ model: "v3-beta", content: messages.slice(1) })
        .then((response) => {
          console.log(response);
          sendMessageSegments(response.reply);
        })
        .catch((error) => {
          console.error("Erreur lors de la requête à hercai :", error);
          // Gérez l'erreur de manière appropriée, par exemple, en envoyant un message de log ou en continuant l'exécution du code
        });
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de l'utilisation de hercai :",
        error
      );
      // Gérez l'erreur de manière appropriée, par exemple, en envoyant un message de log ou en continuant l'exécution du code
    }
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
    if (firstMessage === "photo") {
      try {
        herc
          .drawImage({ model: "v3", prompt: messages.slice(1) })
          .then((response) => {
            channel.reply(response.url);
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la requête à hercai pour dessiner une image :",
              error
            );
            // Gérez l'erreur de manière appropriée, par exemple, en envoyant un message de log ou en continuant l'exécution du code
          });
      } catch (error) {
        console.error(
          "Une erreur s'est produite lors de l'utilisation de hercai pour dessiner une image :",
          error
        );
        // Gérez l'erreur de manière appropriée, par exemple, en envoyant un message de log ou en continuant l'exécution du code
      }
    }

    cmds.def(defSocket, messages);
  }
});
