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
    const historicalPriceEndpoint = `http://api.coindesk.com/v1/bpi/historical/close.json`;


    return new Promise((resolve, reject) => {
      request({
        url: historicalPriceEndpoint,
        json: true,
        qs: {
          start: moment.unix(start).format(`YYYY-MM-DD`),
          end: moment.unix(end).format(`YYYY-MM-DD`),
          index: `USD`
        }
      }, (error, response, body) => {
        if (error || !body) {
          return reject(error);
        }

        const data = _.get(body, [`bpi`], {});

        const x = _.keys(data)
        .map(x => {
          return moment(x, `YYYY-MM-DD`).unix();
        });

        const y = _.values(data);

        resolve({x, y});
      });
    });
  }

  static getBTCTicker() {
    const tickerEndpoint = `https://api.coinmarketcap.com/v1/ticker/bitcoin`;

    return new Promise((resolve, reject) => {
      request({
        url: tickerEndpoint,
        json: true
      }, (error, response, body) => {
        if (error || !body) {
          return reject(error);
        }

        const data = _.mapKeys(
          _.get(body, [0], {}), (v, k) => _.camelCase(k)
        );

        resolve(data);
      });
    });
  }

  static onBTCTransaction(callback) {
    ws.on(`text`, (data) => {
      const d = JSON.parse(data);
      const hash = d.x.hash;

      const inputs = _.get(d, [`x`, `inputs`], [])
      .map(x => {
        return {addr: x.prev_out.addr, value: x.prev_out.value / 1e8};
      });

      const outputs = _.get(d, [`x`, `out`], [])
      .map(x => {
        return {addr: x.addr, value: x.value / 1e8};
      });

      const totalInputs = _.get(d, [`x`, `inputs`], [])
      .reduce((acc, x) => {
        return acc + x.prev_out.value;
      }, 0) / 1e8;

      const totalOutputs = _.get(d, [`x`, `out`], [])
      .reduce((acc, x) => {
        return acc + x.value;
      }, 0) / 1e8;

      const fee = (totalInputs - totalOutputs);

      callback({
        hash,
        inputs,
        outputs,
        totalInputs,
        totalOutputs,
        fee
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

        const data = _.toArray(body.data)
        .filter(x => {
          const time = moment(x.time).unix();
          return time <= end && time >= start;
        });

        const x = _.map(data, 'time')
        .map(x => {
          return moment(x).unix();
        });

        const y = _.map(data, 'usd');

        resolve({x, y});
      });
    });
  }

  static getETHTicker() {
    const tickerEndpoint = `https://api.coinmarketcap.com/v1/ticker/ethereum`;

    return new Promise((resolve, reject) => {
      request({
        url: tickerEndpoint,
        json: true
      }, (error, response, body) => {
        if (error || !body) {
          return reject(error);
        }

        const data = _.mapKeys(
          _.get(body, [0], {}), (v, k) => _.camelCase(k)
        );

        resolve(data);
      });
    });
  }
}

module.exports = Api;
