const request = require(`request`);
const moment = require(`moment`);
const _ = require(`lodash`);

const ws = require(`./ws`).client;

// TODO: maybe use
//https://api.coinmarketcap.com/v1/datapoints/ethereum/

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

        const data = _(_.toArray(body))
        .filter(x => {
          return _.isObject(x);
        })
        .map(x => {
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

  static onBTCTransaction(callback) {
    ws.on(`text`, (data) => {
      const d = JSON.parse(data);
      const hash = d.x.hash;

      const inputs = d.x.inputs.map(x => {
        return {addr: x.prev_out.addr, value: x.prev_out.value};
      });

      const outputs = d.x.out.map(x => {
        return {addr: x.addr, value: x.value};
      });

      const totalInputs = d.x.inputs.reduce((acc, x) => {
        return acc + x.prev_out.value;
      }, 0) / 1e8;

      const totalOutputs = d.x.out.reduce((acc, x) => {
        return acc + x.value;
      }, 0) / 1e8;

      callback({hash, inputs, outputs, totalInputs, totalOutputs});
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
