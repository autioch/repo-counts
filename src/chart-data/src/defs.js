const month = {
  buildId(key) {
    return key.split('-').slice(0, 2).join('-');
  },
  lineInfoKey: 'date'
};

const quarter = {
  buildId(key) {
    const [yearPart, monthPart] = key.split('-');

    return `${yearPart}/${Math.ceil(monthPart / 3)}`;
  },
  lineInfoKey: 'date'
};

const year = {
  buildId(key) {
    return key.split('-')[0];// .slice(0, 2);
  },
  lineInfoKey: 'date'
};

const author = {
  buildId(key) {
    return key;
  },
  lineInfoKey: 'author'
};

const defs = {
  month,
  quarter,
  year,
  author
};

export default defs;
