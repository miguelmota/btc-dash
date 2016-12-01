const ws = require(`nodejs-websocket`);

const client = ws.connect(`wss://ws.blockchain.info/inv`, () => {
  client.send(`{"op":"unconfirmed_sub"}`);
  client.on(`error` => {});
});

module.exports = {
  client
};
