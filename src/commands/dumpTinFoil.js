/* eslint-disable */
const fetch = require('cross-fetch');
const fs = require('fs/promises');
const path = require('path');

(async () => {
  const response = await fetch('https://tinfoil.media/Title/ApiJson/?rating_content=&language=&category=&region=us&rating=0&_=1636485007712').then(r => r.json()).catch(() => false);

  if (!response) {
    console.error('Unable to fetch tinfoil data');
    process.exit(0); // Don't throw a critical error since script is used in CI
  }

  const { data } = response;
  const titleIds = {};

  data.forEach((d) => {
    const matches = />(.+)</.exec(d.name);
    if (matches && matches.length >= 2) {
      titleIds[d.id.toUpperCase()] = matches[1]
    }
  })

  await fs.writeFile(path.join(__dirname, '..', 'assets', 'tinfoildb.json'), JSON.stringify(titleIds), 'utf-8');
})();
