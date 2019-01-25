// Patch over React.memo. See https://github.com/airbnb/enzyme/issues/1875.n
const react = require("react");
module.exports = { ...react, memo: (x) => x };
