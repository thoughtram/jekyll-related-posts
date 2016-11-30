const _    = require('lodash');
const Rx = require('@reactivex/rxjs');

module.exports = class Analyzer {

  constructor (metaDataList) {
    this.metaDataList = metaDataList;
  }

  sortByMatchingTagsAndDate (tags) {
      return  _.orderBy(this.metaDataList,
              [
                fileMetaData => _.intersection(fileMetaData.yamlProperties.tags, tags),
                fileMetaData => new Date(fileMetaData.yamlProperties.date)
              ],
              ['desc', 'desc']);
  }

  getRelatedPosts (fileMetaData) {
    return new Rx.Observable(obs => {
      obs.next(this.sortByMatchingTagsAndDate(fileMetaData.yamlProperties.tags)
                          .filter(fMetaData => fMetaData !== fileMetaData)
                          .map(fileMetaData => fileMetaData.yamlProperties.title)
                          .slice(0, 6));
      obs.complete();
    });
  }
}
