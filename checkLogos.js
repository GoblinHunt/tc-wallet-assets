const fs = require('fs');
const axios = require('axios').default;
const { glob } = require('glob');

const checkUrls = async () => {
  let ret = 0;
  return glob("{*/cw20/contracts.json,*/cw721/contracts.json,*/native/tokens.json}").then(async (files) => {
    for (const file of files) {
      const content = fs.readFileSync(file);
      const json = JSON.parse(content);
      const logos = new Set();

      Object.values(json).forEach(item => {
        if (item.logo && item.logo !== "") {
          logos.add(item.logo);
        }
      });

      for (const logoUrl of logos) {
        try {
          const response = await axios.get(logoUrl, { responseType: 'stream', timeout: 10000 });
          const contentType = response.headers['content-type'];
          if (response.status < 400 && (contentType.startsWith('image/'))) {
            console.log(`${file} - ${logoUrl}: OK`);
          } else {
            console.error(`${file} - ${logoUrl}: FAIL (Not an image)`);
            ret = 1;
          }
        } catch (error) {
          console.error(`${file} - ${logoUrl}: FAIL (Request failed)`);
          ret = 1;
        }
      }
    }

    process.exit(ret);
  }).catch((e) => {
    console.log('Error', e);
    process.exit(1);
  });
};

checkUrls().then(
  console.log('done')
);
