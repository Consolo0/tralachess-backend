const fs = require("fs");
const path = require("path");

let defaultPfp = null;

const GetDefaultPfp = () => {
  if (defaultPfp){
    return defaultPfp;
  } 
  defaultPfp = fs.readFileSync(path.join(__dirname, "../assets/chess-default-pfp.png"));
  return defaultPfp;
};

module.exports = {GetDefaultPfp};