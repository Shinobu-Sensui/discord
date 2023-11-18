import lists from "./lists.js";
import os from "./features/computerInfo.js";
import ColorMessage from "./features/colorMessage.js";

const dictionnaires = await new lists().fetch;
let occ;
try {
  occ = await fetch("https://khayyer.io/data/dicoOcc.json");
  const syllables = await occ.json();
} catch (error) {
  throw error;
}
const colormessage = new ColorMessage();

export default class Commands extends lists {
  constructor() {
    super();
    this.dictionnaires = dictionnaires;
    this.computerInfo = os;
    this.syllables = syllables;
    this.cmds = {
      gentiles: ["g", "gentile", "gentiles", "gens"],
      adverbes: ["a", "adv", "adverbes", "adverbe"],
      longs: ["l", "long", "longs"],
      fleurs: ["f", "fleur", "fleurs"],
      verbes: ["v", "verbe", "verbes"],
      words: ["c", "dico", "dictionnaire"],
    };
  }

  detectSearchCmd(message) {
    for (let i in this.cmds) if (this.cmds[i].includes(message)) return i;
    return false;
  }

  detectSpecifyCmd(message) {
    const symbolMatched = message[0][0] === "-";
    if (symbolMatched) {
      const cmd = message.slice(1);
      for (let i in this.cmds) if (this.cmds[i].includes(cmd)) return i;
      return false;
    }
  }
  decouperMessage(message) {
    const longueurLimite = 1900;
    const segments = [];

    while (message.length > 0) {
      segments.push(message.substring(0, longueurLimite));
      message = message.substring(longueurLimite);
    }

    return segments;
  }

  async commands(messages) {
    const firstMessage = messages[0].slice(1);
    console.log(firstMessage);
    if (!messages[0] || !messages[1]) return;
    const otherMessage = messages.slice(1);
    const cmdIsValide = this.detectSearchCmd(firstMessage);
    const response = this.sub(
      this.syllables,
      this.dictionnaires["words"],
      messages,
      firstMessage
    );
    if (response) return response;
    //const response = this.sub()
    console.log(cmdIsValide, firstMessage, otherMessage);

    if (cmdIsValide) {
      console.log(firstMessage, otherMessage);
      return this.search(
        this.dictionnaires[cmdIsValide],
        otherMessage.join(" ")
      );
    } else if (firstMessage === "size" && messages[2]) {
      const cmdSpecifyIsValide = this.detectSpecifyCmd(messages[1]);
      if (cmdSpecifyIsValide) {
        return this.findLengthElement(
          this.dictionnaires[cmdSpecifyIsValide],
          messages[2]
        );
      }
    } else if (firstMessage === "letters") {
      return this.wordExplodeLetters(messages[1].toLowerCase());
    } else if (firstMessage === "info") {
      console.log(messages[1]);
      return await this.infoWord(this.dictionnaires, messages[1]);
    } else if (firstMessage === "max") {
      return this.extractLetters(this.dictionnaires["words"], messages[1]);
    }
  }
}
