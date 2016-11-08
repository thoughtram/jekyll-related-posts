const _    = require('lodash');

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
    return this.sortByMatchingTagsAndDate(fileMetaData.yamlProperties.tags)
                        .filter(fMetaData => fMetaData !== fileMetaData)
                        .slice(0, 6);
  }

  advance (fn) {
    this.metaDataList.forEach(fn);
  }

  process (fn) {
    this.advance(fileMetaData => {
      let relatedPosts = this.getRelatedPosts(fileMetaData);
      fn(fileMetaData, relatedPosts);
    });
  }
}
