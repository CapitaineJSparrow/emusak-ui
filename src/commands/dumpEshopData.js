/* eslint-disable */
const fetch = require('cross-fetch');
const fs = require('fs/promises');
const path = require('path');

(async () => {
  const response = await fetch('https://github.com/blawar/titledb/blob/master/US.en.json?raw=true').then(r => r.json()).catch(() => false);

  if (!response) {
    console.error('Unable to fetch tinfoil data');
    process.exit(0); // Don't throw a critical error since script is used in CI
  }

  let data = response;
  const titleIds = {};
  const ids = Object.keys(data);

  ids.forEach(i => {
    const { id, name, iconUrl, screenshots } = data[i];

    if (id && name && iconUrl) {
      titleIds[id.toUpperCase()] = { id, name, iconUrl, screenshots };
    }
  })

  await fs.writeFile(path.join(__dirname, '..', 'assets', 'US.en.json'), JSON.stringify(titleIds), 'utf-8');
})();
