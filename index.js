#! /usr/bin/env node

const Rx = require('@reactivex/rxjs');
const YamlFs = require('yaml-fs').YamlFs;
const Analyzer = require('./analyzer.js');
const CastsAnalyzer = require('./castsAnalyzer.js');

let yamlFs = new YamlFs();

if (process.argv.length < 3) {
  console.log('Programm needs to be invoked with directory');
  process.exit(1);
}

let directory = process.argv[2];

yamlFs.getMetaDataForFiles(directory)
  .then(metaDataList => {

    let analyzer = new Analyzer(metaDataList);
    let castsAnalzyer = new CastsAnalyzer();

    Rx.Observable
      .from(metaDataList)
      .flatMap(fileMetaData => {
        return Rx.Observable.forkJoin(
          castsAnalzyer.getRelatedVideos(fileMetaData),
          analyzer.getRelatedPosts(fileMetaData)
        ).map(related => {
          [relatedVideos, relatedPosts] = related;
          fileMetaData.yamlProperties.related_posts = relatedPosts;

          if (!fileMetaData.yamlProperties.no_related_videos) {
            fileMetaData.yamlProperties.related_videos = relatedVideos;
          }
          return fileMetaData;
        })
      }, 4).subscribe(fileMetaData => {
        yamlFs.writeFile(fileMetaData);
      });
  });
