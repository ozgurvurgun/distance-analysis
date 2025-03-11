export class Bootstrapper {
    constructor(reactionTimeData, iteration = 5000) {
      this.reactionTimeData = reactionTimeData;
      this.iteration = iteration;
      this.bootstrapResults = { congruent: [], incongruent: [] };
    }
  
    getRandomElement(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
  
    runBootstrap() {
      for (let i = 0; i < this.iteration; i++) {
        let bootstrappedSampleCongruent = [];
        let bootstrappedSampleIncongruent = [];
  
        for (let distance = 1; distance <= 8; distance++) {
          let candidates = this.reactionTimeData.filter((item) => item.distance === distance);
  
          if (candidates.length > 0) {
            let randomChoice = this.getRandomElement(candidates);
  
            bootstrappedSampleCongruent.push({
              distance,
              pair: randomChoice.pair.split(" && ")[0],
              value: randomChoice.congruent_RT_AVERAGE,
            });
  
            bootstrappedSampleIncongruent.push({
              distance,
              pair: randomChoice.pair.split(" && ")[1],
              value: randomChoice.incongruent_RT_AVERAGE,
            });
          }
        }
  
        this.bootstrapResults.congruent.push(bootstrappedSampleCongruent);
        this.bootstrapResults.incongruent.push(bootstrappedSampleIncongruent);
      }
    }
  
    getResults() {
      return this.bootstrapResults;
    }
  }
  