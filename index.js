const moment = require(`moment`);
const _ = require(`lodash`);
const commafy = require(`commafy`);

const Api = require(`./lib/Api`);
const Gui = require(`./lib/Gui`);

function main() {
  const gui = new Gui();

  const start =  moment().subtract(360, `day`).unix();
  const end = moment().unix();

  const formatStats = (x) => {
      const stats = `Price $${commafy(x.priceUsd)} | 24H Volume $${commafy(x[`24HVolumeUsd`])} | Market Cap $${commafy(x.marketCapUsd)} | Available Supply ${commafy(x.availableSupply)} | 1HΔ ${x.percentChange1H}% | 24HΔ ${x.percentChange24H}% | 7DΔ ${x.percentChange7D}%`;

    return stats;
  };

  const renderFetch = () => {
    Api.getBTCPrices({
      start,
      end
    })
    .then(({x, y}) => {
      return Api.getBTCTicker()
      .then(data => {
        gui.renderChart({
          data: {x, y},
          position: [0, 0, 5, 7],
          label: `BTC Price Index`,
          title: formatStats(data)
        });
      })
      .catch(error => {});
    })
    .catch(error => {});

    Api.getETHPrices({
      start,
      end
    })
    .then(({x, y}) => {
      return Api.getETHTicker()
      .then(data => {
        gui.renderChart({
          data: {x, y},
          position: [5, 0, 5, 7],
          label: `ETH Price Index`,
          title: formatStats(data)
        });
      })
      .catch(error => {});
    })
    .catch(error => {});
  };

  renderFetch();

  const btcLogger = gui.renderLog({
    position: [0, 7, 10, 3],
    label: `BTC Transactions`
  });

  Api.onBTCTransaction(x => {
    const btcTransactedGuess = _.get(x, [`outputs`, 1], _.get(x, [`outputs`, 0], ``)).value;
    btcLogger.log(`${x.hash} ${btcTransactedGuess}`);
  });

  const interval = setInterval(() => {
    renderFetch();
  }, 15e4);
}

main();
