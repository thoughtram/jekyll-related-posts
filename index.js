#! /usr/bin/env node
const yaml = require('js-yaml');
const fs   = require('fs');
const path = require( 'path' );
const _    = require('lodash');

const postHead = /---((.|\n)*?)---/;

if (process.argv.length < 3) {
  console.log('Programm needs to be invoked with directory');
  process.exit(1);
}

let directory = process.argv[2];

function getMetaDataForFile (filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let match = postHead.exec(content);
    let headContent = match[1]
    return {
      filePath: filePath,
      yamlProperties: yaml.safeLoad(headContent),
      headContent: headContent,
      content: content
    };

  } catch (e) {
    console.log(`There was a problem reading post metadata for: ${filePath}`);
    console.log(e);
  }
}

function getMetaDataForFiles (dirPath) {
  return new Promise((res, rej) => {
    fs.readdir( dirPath, ( err, files ) => {
          if( err ) {
              rej(err);
          } else {
            res(files.map(file => getMetaDataForFile(path.join(dirPath, file))))
          }
      });
  });
}

function sortByMatchingTagsAndDate (metaDataList, tags) {
    return  _.orderBy(metaDataList,
            [
              fileMetaData => _.intersection(fileMetaData.yamlProperties.tags, tags),
              fileMetaData => new Date(fileMetaData.yamlProperties.date)
            ],
            ['desc', 'desc']);
}

function getRelatedPosts (fileMetaData, metaDataList) {
  return sortByMatchingTagsAndDate(metaDataList, fileMetaData.yamlProperties.tags)
                      .filter(fMetaData => fMetaData !== fileMetaData)
                      .slice(0, 6);
}

function writeFile (fileMetaData) {
  let newHeadContent = yaml.safeDump(fileMetaData.yamlProperties);
  let newArticleContent = fileMetaData.content.replace(fileMetaData.headContent, `\n${newHeadContent}\n`);
  fs.writeFileSync(fileMetaData.filePath, newArticleContent);
}

getMetaDataForFiles(directory)
  .then(metaDataList => {
    metaDataList.forEach(fileMetaData => {
      let relatedPosts = getRelatedPosts(fileMetaData, metaDataList);
      fileMetaData.yamlProperties.related_posts = relatedPosts.map(fileMetaData => fileMetaData.yamlProperties.title);
      writeFile(fileMetaData)
    });
  })
