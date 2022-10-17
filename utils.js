const { adsPrefix } = require('./config.json');

const adsApi = {
  status: adsPrefix + '/status',
  start: adsPrefix + '/api/v1/browser/start',
  stop: adsPrefix + '/api/v1/browser/stop',
  active: adsPrefix + '/api/v1/browser/active',
}


module.exports = {
  adsApi: adsApi
};