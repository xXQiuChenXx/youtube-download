function filterChars(input) {
    const unsupportedCharacters = /[\\\/:*?"<>|]/g;
    return input.replace(unsupportedCharacters, "");
  }
  
  async function wait(time) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    }
    
  
  module.exports = {
    filterChars,
    wait
  };
  