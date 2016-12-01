const request = require('request');
const moment = require(`moment`);
const _ = require(`lodash`);

const Api = require(`./lib/Api`);
const Gui = require(`./lib/Gui`);

function init() {
  const gui = new Gui();
  const timeOptions = [1, 7, 30, 90, 365];
  const timeOption = 4;

  const start =  moment().subtract(timeOptions[timeOption], `day`).unix();
  const end = moment().unix();

  const renderFetch = () => {
    Api.getBTCPrices({
      start,
      end
    })
    .then(({x, y}) => {
      return Api.getBTCCurrentPrice()
      .then(price => {
        gui.renderChart({data: {x, y}, position: [0, 0, 5, 10], label: `BTC`, title: `Current ${price}`});
      });
    });

    Api.getETHPrices({
      start,
      end
    })
    .then(({x, y}) => {
      const price = _.last(y);
      gui.renderChart({data: {x, y}, position: [5, 0, 5, 10], label: `ETH`, title: `Current ${price}`});
    });
  };

  renderFetch();

  setInterval(() => {
    renderFetch();
  }, 10);
}

init();
