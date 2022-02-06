import Converter from './Converter.mjs';
import Db from './Db.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';
import { isDirGitRepository } from './utils.mjs';

async function getValidRepos(repo) {
  const validRepos = [];

  for (let i = 0; i < repo.length; i++) {
    const isGitRepo = await isDirGitRepository(repo[i]);

    if (isGitRepo) {
      validRepos.push(repo[i]);
    } else {
      console.log(`Invalid git dir provided, skipping - ${repo[i]}`);
    }
  }

  return validRepos;
}

export default async function run(config) { // eslint-disable-line max-statements
  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const { repos, chronicle, detail, period, formats, output, dry } = config;
  const validRepos = await getValidRepos(repos);

  console.log(`Run for ${validRepos.length} repos`);
  const fs = new Fs(output, dry);
  const db = new Db(fs);
  const scanner = new Scanner(validRepos, db);

  await fs.ensureDir();
  await db.restore();

  const data = await scanner.scan(config);
  const fileName = `repo-history${detail ? '_detail' : ''}${chronicle ? `_chronicle_${period}` : ''}`;

  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    const converted = Converter.convert(config, format, data);

    await fs.writeOutput(format, fileName, converted);
  }

  await fs.copyStyles();
  await db.persist();
}
