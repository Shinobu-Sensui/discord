import utils from './features/utils.js'

export default class Lists extends utils {
  constructor() {
    super();
    this.serverName = `https://khayyer.io/data/`;
    this.listNames = ["adverbes", "fleurs", "gentiles", "verbe", "words"];
    this.fetch = this.fetchMultipleLists();
  }

  async fetchList(listName) {
    const dicoURL = `${this.serverName}/listes/${listName}.json`;
    try {
      const response = await fetch(dicoURL);
      if (!response.ok) return;
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`Une erreur s'est produite : ${error.message}`);
      throw error;
    }
  }

  async fetchMultipleLists() {
    const promises = this.listNames.map((listName) => this.fetchList(listName));
    try {
      const results = await Promise.all(promises);
      this.results = results.reduce((acc, val, index) => {
        acc[this.listNames[index]] = val;
        return acc
      }, {});

      return this.results;
    } catch (error) {
      console.error(
        `Une erreur s'est produite lors de la récupération de plusieurs listes : ${error.message}`
      );
      throw error;
    }
  }
}
