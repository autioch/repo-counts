import Converter from './Converter.mjs';
import Db from './Db.mjs';
import Fs from './Fs.mjs';
import Repo from './Repo.mjs';

export default async function run(config) { // eslint-disable-line max-statements
  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const { repos, chronicle, detail, period, formats, output, dry } = config;
  const validRepos = repos.filter(Fs.isDirGitRepository);

  console.log(`Run for ${validRepos.length} repos`);
  const fs = new Fs(output, dry);
  const db = new Db(fs);
  const repoList = validRepos.map((repo) => new Repo(repo, db));

  await fs.ensureDir();
  await db.restore();

  const callbackFn = chronicle ? (detail ? 'ChronicleDetail' : 'Chronicle') : (detail ? 'CurrentDetail' : 'Current'); // eslint-disable-line no-extra-parens, no-nested-ternary
  const data = [];

  for (let i = 0; i < repoList.length; i++) {
    const repo = repoList[i];

    data.push([repo.dirBase, await repo[`get${callbackFn}Data`](period)]);
  }

  const fileName = `repo-history${detail ? '_detail' : ''}${chronicle ? `_chronicle_${period}` : ''}`;

  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    const converted = Converter.convert(config, format, Object.fromEntries(data));

    await fs.writeOutput(format, fileName, converted);
  }

  await fs.copyStyles();
  await db.persist();
}
