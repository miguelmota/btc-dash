const blessed = require('blessed');
const contrib = require(`blessed-contrib`);
const moment = require(`moment`);
const _ = require(`lodash`);

class Gui {
  constructor() {
    this.screen = blessed.screen();
    this.grid = new contrib.grid({
      rows: 10,
      cols: 10,
      screen: this.screen
    });
  }

  renderChart(props) {
    const {x, y} = props.data;
    const p = props.position;
    const {title, label} = props;

    const line = this.grid.set(p[0], p[1], p[2], p[3], contrib.line, {
      width: `100%`,
      height: 30,
      left: 2,
      top: 2,
      yPadding: 5,
      xPadding: 5,
      showLegend: true,
      numXLabels: 30,
      numYLabels: 50,
      minY: _.min(y),
      maxY: _.max(y),
      legend: {
        width: 140
      },
      label,
      wholeNumbersOnly: false,
      style: {
        line: [0, 255, 0],
        text: [0, 255, 0],
        baseline: [0, 255, 255]
      }
    });

    const data = [
      {
        title,
        x: x.map(x => moment.unix(x).format(`MM/DD/YY`)),
        y,
        style: {
          line: `yellow`
        }
      }
    ];

    line.setData(data)

    this.screen.key([`escape`, `q`, `C-c`], (ch, key) => {
      return process.exit(0);
    });

    this.screen.render()
  }

  renderLog(props) {
    const p = props.position;
    const {label} = props;

    const log = this.grid.set(p[0], p[1], p[2], p[3], contrib.log, {
      fg: `green`,
      selectedFg: `green`,
      label
    });

    return log;
  }
}

module.exports = Gui;
