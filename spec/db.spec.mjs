/* eslint-env mocha  */
import assert from 'assert';

import Db from '../src/Db.mjs';

const makeFs = (stored = {}) => {
  const written = {};

  return {
    written,
    readJson: async (fileName) => stored[fileName] || [], // eslint-disable-line require-await
    async writeJson(fileName, data) { // eslint-disable-line require-await
      written[fileName] = JSON.parse(JSON.stringify(data));
    }
  };
};

describe('Db', () => {
  it('restores persisted ids', async () => {
    const db = new Db(makeFs({
      authors: [ ['alice', 4], ['bob', 2] ]
    }));

    await db.restore();

    assert.deepEqual(db.authors.getId('bob'), 2);
    assert.deepEqual(db.authors.getId('alice'), 4);
  });

  it('continues numbering after restored ids', async () => {
    const db = new Db(makeFs({
      dates: [ ['2022-01-01', 1], ['2022-01-02', 7] ]
    }));

    await db.restore();

    assert.deepEqual(db.dates.getId('2022-01-03'), 8);
  });

  it('starts from 1 when nothing is stored', async () => {
    const db = new Db(makeFs());

    await db.restore();

    assert.deepEqual(db.authors.getId('alice'), 1);
    assert.deepEqual(db.authors.getId('bob'), 2);
  });

  it('persists restored and new ids together', async () => {
    const fs = makeFs({
      authors: [ ['alice', 1] ]
    });
    const db = new Db(fs);

    await db.restore();
    db.authors.getId('bob');
    await db.persist();

    assert.deepEqual(fs.written.authors, [ ['alice', 1], ['bob', 2] ]);
  });
});
