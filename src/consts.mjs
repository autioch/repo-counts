const FORMAT = {
  JSON: 'json',
  CSV: 'csv',
  HTML: 'html'
};

const PERIOD = {
  MONTH: 'month',
  YEAR: 'year'
};

const LABEL_YEAR = 'labelYear';
const LABEL_MONTH = 'labelMonth';

const PERIOD_LABELS = {
  [PERIOD.YEAR]: LABEL_YEAR,
  [PERIOD.MONTH]: LABEL_MONTH
};

export {
  FORMAT,
  PERIOD,
  LABEL_YEAR,
  LABEL_MONTH,
  PERIOD_LABELS
};
