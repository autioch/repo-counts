const dig2 = (num) => num.toString().padStart(2, '0');

export default class Commit {
  constructor(unixDate, hash) {
    const date = new Date(unixDate * 1000); // JS milisecons, unix seconds

    this.year = date.getFullYear();
    this.month = date.getMonth() + 1;
    this.day = date.getDate();
    this.hash = hash;
    this.monthLabel = [this.year, this.month].map(dig2).join('-');
    this.yearLabel = this.year.toString();
  }
}
