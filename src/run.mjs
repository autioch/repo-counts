import Converter from './Converter.mjs';
import Db from './Db.mjs';
import Fs from './Fs.mjs';
import Repo from './Repo.mjs';

export default async function run(config) { // eslint-disable-line max-statements
  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const { repos, chronicle, detail, period, formats, output, dry, cache } = config;
  const validRepos = repos.filter(Repo.isDirGitRepository);

  console.log(`Run for ${validRepos.length} repos`);
  const fs = new Fs(output, dry);
  const db = new Db(fs);
  const repoList = validRepos.map((repo) => new Repo(repo, db));

  await fs.ensureDir();
  await db.restore();

  const modeString = `${chronicle ? 'Chronicle' : 'Current'}${detail ? 'Detail' : 'Simple'}`;
  const data = cache ? await fs.readJson(modeString + (chronicle ? period : '')) : [];

  if (!data.length) {
    for (const repo of repoList) {
      data.push([repo.dirBase, await repo[`get${modeString}`](period)]);
    }
  }

  for (const format of formats) {
    await fs.writeOutput(format, modeString + (chronicle ? period : ''), Converter.convert(config, format, data));
  }

  await fs.copyStyles();
  await db.persist();
}
