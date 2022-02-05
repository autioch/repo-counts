class Column extends Map {
  constructor() {
    super();

    this.nextId = 0;
  }

  toJSON() {
    return [...this.entries()];
  }

  getId(label) {
    const id = this.get(label);

    if (id) {
      return id;
    }

    this.nextId++;
    this.set(label, this.nextId);

    return this.nextId;
  }
}

export default class Db {
  constructor(fs) {
    this.fs = fs;

    // for tests
    this.authors = new Column();
    this.dates = new Column();
  }

  async restore() {
    this.authors = new Column(await this.fs.readJson('authors'));
    this.dates = new Column(await this.fs.readJson('dates'));
  }

  async persist() {
    await this.fs.writeJson('authors', this.authors);
    await this.fs.writeJson('dates', this.dates);
  }
}
