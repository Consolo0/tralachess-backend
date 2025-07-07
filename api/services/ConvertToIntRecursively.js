const convertToIntRecursive = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertToIntRecursive);
  } else if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertToIntRecursive(obj[key]);
    }
    return newObj;
  } else if (!isNaN(obj)) {
    return Number(obj);
  } else {
    return obj;
  }
};

module.exports = {
  convertToIntRecursive,
};