import Converter from './Converter.mjs';
import Db from './Db.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';

export default async function run(config) { // eslint-disable-line max-statements
  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const { repos, chronicle, detail, period, formats, output, dry } = config;
  const validRepos = repos.filter(Fs.isDirGitRepository);

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
