export class Child {
    constructor (name, pronoun, preferences) {
      this.name = name;
      this.pronoun = pronoun;
      this.preferences = preferences;
    }
  
    toJson() {
      return JSON.stringify(this);
    }
}
  
export class GPTPrompt {
    constructor (children, contentType, numMins, ageRange, plotArchetypes, generateKeywords, otherInfo, language) {
        if (!children.every((child) => child instanceof Child)) {
        throw new Error("Invalid input: child must be an instance of Child");
        }

        this.children = children;
        this.contentType = contentType;
        this.numMins = numMins;
        this.ageRange = ageRange;
        this.plotArchetypes = plotArchetypes;
        this.generateKeywords = generateKeywords;
        this.otherInfo = otherInfo;
        this.language = language;
    }

    toJson() {
        return JSON.stringify(this);
    }
}
