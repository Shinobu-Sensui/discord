import safeRegex from "safe-regex";
import ColorMessage from "./colorMessage.js";

const color = new ColorMessage();

export default class Utils {
  def(socket, messages) {
    const firstMessage = messages[0].slice(1);
    if (firstMessage === "d" || firstMessage === "def") {
      if (!messages[1]) return;
      console.log(messages, "cc");
      socket.emit("def", messages[1]);
    }
  }

  time(time) {
    const elapsedTime = Date.now() - time;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60)) % 24;
    const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
    return  `Temps écoulé : ${days} jours ${hours} heures ${minutes} minutes ${seconds} secondes`
  }

  definition(socket, msg) {
    socket
      .on("connect", () => console.log("(Re)connecté au serveur de defs"))
      .on("def", (w, t, d) => {
        if (t === "Error 404") {
          msg.channel.send(
            color.msg_red("Définition introuvable pour " + w),
            "ok"
          );
        } else if (t === "Error 401") {
          msg.channel.send(color.msg_red("Mauvaise requête"), "ok");
        } else {
          const dicoOrigin = `(${t}) pour le mot ${w} sont : `;
          msg.channel.send(color.msg_green(dicoOrigin + d[0]));
        }
      });
  }
  shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  sub = (syllables, dictionnaire, messages, firstMessage) => {
    console.log(messages, firstMessage);
    const getSubString = (word, subNumber) => {
      const wordSize = word.length - 1;
      for (let i = 0; i < wordSize; i++) {
        let n = word.slice(i, i + 2),
          s = word.slice(i, i + 3);
        if (syllables[n] <= subNumber || syllables[s] <= subNumber) return word;
      }
    };

    const findSubstrings = (subNumber) => {
      let result = [];
      const dicoLength = dictionnaire.length;

      for (let i = 0; i < dicoLength; i++) {
        let foundSubstring = getSubString(dictionnaire[i], subNumber);
        if (foundSubstring) {
          result.push(foundSubstring);
        }
      }
      return result;
    };

    if (
      firstMessage.slice(0, 3) === "sub" ||
      firstMessage.slice(0, 2) === "sy"
    ) {
      console.log("yes");
      if (!messages[1]) {
        return;
      }

      const searchTerm = messages[1]
        ? messages.slice(1).join(" ")
        : subNumber || null;

      let searchType, searchResults, searchLimit, message;

      if (firstMessage.slice(0, 3) === "sub") {
        searchType = "Sub";
        let substringTerm = parseInt(firstMessage.slice(3));
        searchResults = findSubstrings(substringTerm);
        console.log(searchResults);
        searchLimit = 60;
      } else if (firstMessage.slice(0, 2) === "sy") {
        searchType = "Syllabes";
        let syllableTerm = firstMessage.slice(2);
        searchResults = Object.keys(syllables)
          .filter((key) => syllables[key] == syllableTerm)
          .map((key) => key.toUpperCase());
        searchLimit = 200;
      }

      const filteredResults = searchResults.filter((result) =>
        result.toLowerCase().match(searchTerm)
      );

      this.shuffle(filteredResults);
      const limitedResults = filteredResults.slice(0, searchLimit);

      message =
        limitedResults.length === 0
          ? "Aucune correspondance trouvée."
          : `(${searchType} - ${searchTerm})\n${limitedResults
              .map((result) => result.toUpperCase())
              .join(" ")} (${filteredResults.length}).`;

      console.log(message);
      return message;
    }
    return false;
  };

  wordExplodeLetters = (word) => {
    const w = word.replace(/[w-zW-Z]/g, "");
    if (w.match(/^[a-zA-Z]+$/)) {
      const letters = [...new Set([...w])];
      const wordLength = letters.length;
      const pluriel = wordLength > 1 ? "s" : "";
      return `Le mot ${word} détruit ${wordLength} lettre${pluriel}, c'est-à-dire : ${letters
        .map((letter) => letter.toUpperCase())
        .join(" ")}.`;
    }
  };

  extractLetters = (array, page = parseInt(page)) => {
    const obj = {};
    console.log(page);
    if (!/^[1-9]\d*$/.test(page)) {
      return "La valeur de la page doit être un nombre entier positif.";
    }

    const extractLettersWord = (word) => {
      const w = word.replace(/[w-zW-Z]/g, "");
      if (w.match(/^[a-zA-Z]+$/)) {
        const letters = [...new Set([...w])];
        obj[word] = { size: letters.length, letters: letters.join(" ") };
      }
    };

    for (let i = 0; i < array.length; i++) extractLettersWord(array[i]);

    const sortedWords = Object.keys(obj).sort(
      (a, b) => obj[b].size - obj[a].size
    );

    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const slicedWords = sortedWords.slice(startIndex, endIndex);

    const result = slicedWords.reduce((acc, val) => {
      acc.push({ word: val, details: obj[val] });
      return acc;
    }, []);

    return result
      .map(
        (element) =>
          `${element.word.toUpperCase()} : Ken ${
            element.details.size
          } - Letters:  ${element.details.letters.toUpperCase()}`
      )
      .join("\n");
  };

  findLengthElement = (array, taille) => {
    let message,
      elements = [],
      elementsSliced = [];

    elements = this.shuffle(
      array.filter((element) => element.length == taille)
    );

    elementsSliced = elements.slice(0, 20);
    message = `${
      elementsSliced.length === 0
        ? `Aucun mot n\'a été trouvé pour la taille ${taille}.`
        : elementsSliced.length === 1
        ? `(${taille} - ${elements.length} mot)`
        : `(${taille} - ${elements.length} mots)`
    }`;

    if (elementsSliced.length === 0) return message;
    return `${message}\n${elementsSliced
      .map((element) => element.toUpperCase())
      .join("\n")}`;
  };

  search = (array, syllable, limit = 10) => {
    const regex = new RegExp(syllable);
    let message,
      elements = [],
      elementsSliced = [];

    try {
      if (safeRegex(regex)) {
        elements = this.shuffle(
          array.filter((element) => element.match(syllable))
        );
        elementsSliced = elements.slice(0, limit);
        const syllableUpper = syllable.toUpperCase();
        message = `${
          elementsSliced.length === 0
            ? `Aucun mot n\'a été trouvé pour la syllabe ${syllable}.`
            : elementsSliced.length === 1
            ? `(${syllableUpper} - ${elements.length} mot)\n`
            : `(${syllableUpper} - ${elements.length} mots)\n`
        }`;
      } else {
        message = `L'expression régulière insérée n'est pas adapatée. Réessayez avec une formulation valide.`;
      }
      if (elementsSliced.length === 0) return message;
      return `${message}${elementsSliced
        .map((element) => element.toUpperCase())
        .join("\n")}`;
    } catch (e) {
      console.error(e);
    }
  };

  cutter = (list) => {
    const o = [],
      len = list.length - 1;
    for (let i = 0; i < len; i++)
      o.push(list.slice(i, i + 2), list.slice(i, i + 3));
    return [...new Set(o)];
  };

  infoWord = async (dictionnaires, word) => {
    const dictionnaire = dictionnaires.words;
    const adverbes = dictionnaires.adverbes;
    const gentiles = dictionnaires.gentiles;
    const fleurs = dictionnaires.fleurs;
    const verbes = dictionnaires.verbe;
    const syllablesJSON = await fetch("https://khayyer.io/data/dicoOcc.json");
    const syllables = await syllablesJSON.json();

    let message;
    if (!dictionnaire.includes(word)) {
      message = `Le mot ${word} n'est pas répertorié dans le dictionnaire.`;
      return { message };
    }
    message = `succès`;

    const wordOrigin = [];
    if (adverbes.includes(word)) wordOrigin.push("adverbe");
    if (fleurs.includes(word)) wordOrigin.push("fleur");
    if (gentiles.includes(word)) wordOrigin.push("gentilé");
    if (verbes.includes(word)) wordOrigin.push("verbe");
    wordOrigin.length === 0 && wordOrigin.push(`Mot pas encore classé.`);

    const wordInElementSize = dictionnaire.filter((x) =>
      x.includes(word)
    ).length;
    const messageWordInElement =
      wordInElementSize === 1
        ? `Le mot ${word} est répertorié une seule fois comme un sous-mot dans le dictionnaire.`
        : wordInElementSize > 1
        ? `Le mot ${word} est répertorié ${wordInElementSize} fois comme un sous-mot dans le dictionnaire.`
        : "";

    const wordOcc = this.cutter(word)
      .reduce((acc, val) => {
        acc.push({ val: val, occ: syllables[val] });
        return acc;
      }, [])
      .sort((a, b) => a.occ - b.occ);
    const wordExplode = this.wordExplodeLetters(word);

    const res = {
      message,
      occClassement: wordOcc,
      messageWordInElement,
      wordOrigin,
      word,
      explodeLetters: wordExplode,
    };

    const msg = `Information du mot ${res.word.toUpperCase()}.\n\n${res.occClassement
      .map((element) => `${element.val.toUpperCase()} : ${element.occ}`)
      .join("\n")}\n\n${res.messageWordInElement}\n\n${res.explodeLetters}`;
    return msg;
  };
}
