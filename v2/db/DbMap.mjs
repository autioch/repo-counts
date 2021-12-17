export default class DbMap extends Map {

  constructor(){
    super();

    this.nextId = 0;
  }

  toJSON() {
    return [...this.entries()];
  }

  getId(label) {
    const id = this.get(label);

    if (id){
      return id;
    }

    this.nextId++;
    this.set(label, this.nextId);

    return this.nextId;
  }
}
