const _       = require('lodash');
const request = require('request');
const Rx = require('@reactivex/rxjs');

const castsApi = 'http://casts-api-production.herokuapp.com/videos';
//const castsApi = 'http://localhost:3000/videos';


module.exports = class CastsAnalyzer {

  constructor () {
    this.cache = new Map();
  }

  getRelatedVideos (fileMetaData) {
    let tags = fileMetaData.yamlProperties.tags && fileMetaData.yamlProperties.tags.join(',');

    if (this.cache.has(tags)) {
      console.log(`serving from cache for: ${tags}`);
      return Rx.Observable.of(this.cache.get(tags));
    }

    return new Rx.Observable(obs => {
      console.log(`requesting for: ${tags}`);
      request(`${castsApi}?tags=${tags}&per_page=6`, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          let data = JSON.parse(body)
          if (data) {
            let videos = data.data.map(video => video.id).slice(0, 6);
            this.cache.set(tags, videos)
            obs.next(videos);
            obs.complete();
          }
        }
        else {
          obs.error(error);
        }
      });
    });
  }
}
