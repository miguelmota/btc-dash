const ws = require(`nodejs-websocket`);

const client = ws.connect(`wss://ws.blockchain.info/inv`, () => {
  client.send(`{"op":"unconfirmed_sub"}`);
});

module.exports = {
  client
};
