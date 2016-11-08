#! /usr/bin/env node

const YamlFs = require('./yamlFs.js');
const Analyzer = require('./analyzer.js');

let yamlFs = new YamlFs();

if (process.argv.length < 3) {
  console.log('Programm needs to be invoked with directory');
  process.exit(1);
}

let directory = process.argv[2];

yamlFs.getMetaDataForFiles(directory)
  .then(metaDataList => {
    let analyzer = new Analyzer(metaDataList);
    analyzer.process((fileMetaData, relatedPostsMetaData) => {
      fileMetaData.yamlProperties.related_posts = relatedPostsMetaData.map(fileMetaData => fileMetaData.yamlProperties.title);
      yamlFs.writeFile(fileMetaData)
    });
  })
