const request = require('request');
const moment = require(`moment`);
const _ = require(`lodash`);

// TODO: use
//https://api.coinmarketcap.com/v1/datapoints/ethereum/
//https://blockchain.info/api/api_websocket

class Api {
  static getBTCCurrentPrice() {
    const currentPriceEndpoint = `http://api.coindesk.com/v1/bpi/currentprice/USD.json`;

    return new Promise((resolve, reject) => {
      request({
        url: currentPriceEndpoint,
        json: true
      }, (error, response, body) => {
        if (error || !body) {
          return reject(error);
        }

        resolve(_.get(body, [`bpi`, `USD`, `rate`], null));
      });
    });
  }

  static getBTCPrices({start, end}) {
    const historicalPriceEndpoint = `https://apiv2.bitcoinaverage.com/indices/global/history/BTCUSD`;

    return new Promise((resolve, reject) => {
      request({
        url: historicalPriceEndpoint,
        json: true,
        qs: {
          format: `json`,
          since: start
        }
      }, (error, response, body) => {
        if (error || !body) {
          return reject(error);
        }

        const data = _(_.toArray(body)).map(x => {
          x.time = moment(x.time).unix();
          return x;
        })
        .sortBy(`time`)
        .value();

        const x = _.map(data, `time`);
        const y = _.map(data, `average`);

        resolve({x, y});
      });
    });
  }

  static getETHPrices({start, end}) {
    const historicalPriceEndpoint = `https://etherchain.org/api/statistics/price`;

    return new Promise((resolve, reject) => {
      request({
        url: historicalPriceEndpoint,
        json: true
      }, (error, response, body) => {
        if (error || !body) {
          return reject(error);
        }

        const data = _.toArray(body.data).filter(x => {
          const time = moment(x.time).unix();
          return time <= end && time >= start;
        });

        const x = _.map(data, 'time').map(x => {
          return moment(x).unix();
        });

        const y = _.map(data, 'usd');

        resolve({x, y});
      });
    });
  }
}

module.exports = Api;
