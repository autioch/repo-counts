function optionsToCli(options) {
  return Object
    .entries(options)
    .reduce((arr, [key, val]) => {
      const value = val === undefined ? '' : `=${val}`; // eslint-disable-line no-undefined

      return arr.concat(`--${key}${value}`);
    }, [])
    .join(' ');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  optionsToCli,
  clone
};
