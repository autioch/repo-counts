const colors = [
  '#5CBAE6', '#B6D957', '#E9707B', '#FAC364', '#98AAFB',
  '#80B877', '#D998CB', '#F2D249', '#93B9C6', '#CCC5A8'
];

let lastIndex = 0;

export function nextColor() {
  const next = lastIndex % colors.length;

  lastIndex = lastIndex + 1;

  return colors[next];
}

const assignedLabels = {};

export function setColors(labels) {
  return labels.reduce((obj, label) => {
    if (!assignedLabels[label]) {
      assignedLabels[label] = nextColor();
    }

    obj[label] = assignedLabels[label];

    return obj;
  }, {});
}

export function getColor(label) {
  if (!assignedLabels[label]) {
    assignedLabels[label] = nextColor();
  }

  return assignedLabels[label];
}
