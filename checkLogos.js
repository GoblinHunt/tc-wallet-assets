const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const glob = require('glob');

const checkUrls = async () => {
  let ret = 0;
  glob("{*/cw20/contracts.json,*/cw721/contracts.json,*/native/tokens.json}", async (err, files) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    for (const file of files) {
      const content = fs.readFileSync(file);
      const json = JSON.parse(content);
      const logos = new Set();

      json.forEach(item => {
        if (item.logo && item.logo !== "") {
          logos.add(item.logo);
        }
      });

      for (const logoUrl of logos) {
        try {
          const response = await axios.get(logoUrl, { responseType: 'stream' });
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
  });
};

checkUrls();
