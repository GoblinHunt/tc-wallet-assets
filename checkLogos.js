const fs = require('fs');
const path = require('path');
const axios = require('axios');
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
          const response = await axios.head(logoUrl);
          if (response.status >= 400) {
            console.error(`${file} - ${logoUrl}: FAIL`);
            ret = 1;
          } else {
            console.log(`${file} - ${logoUrl}: OK`);
          }
        } catch (error) {
          console.error(`${file} - ${logoUrl}: FAIL`);
          ret = 1;
        }
      }
    }
    // Exiting with 0 (success) or 1 (failure) based on URL checks
    process.exit(ret);
  });
};

checkUrls();
