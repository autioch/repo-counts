const colors = [
  '#5CBAE6', '#B6D957', '#E9707B', '#FAC364', '#98AAFB',
  '#80B877', '#D998CB', '#F2D249', '#93B9C6', '#CCC5A8'
];

export function nextColor(index) {
  const next = index % colors.length;

  return colors[next];
}
