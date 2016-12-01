const moment = require(`moment`);
const _ = require(`lodash`);

const Api = require(`./lib/Api`);
const Gui = require(`./lib/Gui`);

function main() {
  const gui = new Gui();

  const start =  moment().subtract(360, `day`).unix();
  const end = moment().unix();

  const renderFetch = () => {
    Api.getBTCPrices({
      start,
      end
    })
    .then(({x, y}) => {
      return Api.getBTCCurrentPrice()
      .then(price => {
        gui.renderChart({
          data: {x, y},
          position: [0, 0, 5, 7],
          label: `BTC Price Index`,
          title: `Current $${price}`
        });
      });
    });

    Api.getETHPrices({
      start,
      end
    })
    .then(({x, y}) => {
      const price = _.last(y);
      gui.renderChart({
        data: {x, y},
        position: [5, 0, 5, 10],
        label: `ETH Price Index`,
        title: `Current $${price}`
      });
    });
  };

  renderFetch();

  const btcLogger = gui.renderLog({
    position: [0, 7, 5, 3],
    label: `BTC Transactions`
  });

  Api.onBTCTransaction(x => {
    btcLogger.log(`${x.hash.substr(0, 16)}... ${x.totalInputs - x.totalOutputs}`);
  });

  const interval = setInterval(() => {
    renderFetch();
  }, 1e4);
}

main();
