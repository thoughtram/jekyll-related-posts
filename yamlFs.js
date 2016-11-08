const fs   = require('fs');
const path = require( 'path' );
const yaml = require('js-yaml');
const YamlFileMetaData = require('./YamlFileMetaData.js');

const postHead = /---((.|\n)*?)---/;

module.exports = class YamlFs {

  getMetaDataForFile (filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let match = postHead.exec(content);
      let headContent = match[1]
      return new YamlFileMetaData(filePath,
                                  yaml.safeLoad(headContent),
                                  headContent,
                                  content);

    } catch (e) {
      console.log(`There was a problem reading post metadata for: ${filePath}`);
      console.log(e);
    }
  }

  getMetaDataForFiles (dirPath) {
    return new Promise((res, rej) => {
      fs.readdir( dirPath, ( err, files ) => {
            if( err ) {
                rej(err);
            } else {
              res(files.map(file => this.getMetaDataForFile(path.join(dirPath, file))))
            }
        });
    });
  }

  writeFile (fileMetaData) {
    let newHeadContent = yaml.safeDump(fileMetaData.yamlProperties);
    let newArticleContent = fileMetaData.content.replace(fileMetaData.headContent, `\n${newHeadContent}\n`);
    fs.writeFileSync(fileMetaData.filePath, newArticleContent);
  }
}
