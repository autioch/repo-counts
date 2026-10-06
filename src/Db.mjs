const inverseKeys = ([key, value]) => [value, key];

const getMaxId = (max, id) => Math.max(max, id);

class Column extends Map {
  constructor(entries = []) {
    super(entries);

    // Continue numbering after restored ids, so new labels never reuse one.
    this.nextId = [...this.values()].reduce(getMaxId, 0);
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

  // TODO Currently unused.
  getInverseMap() {
    return new Map(Array.from(this, inverseKeys));
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
