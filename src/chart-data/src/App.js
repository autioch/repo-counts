import React, { Component } from 'react';
import parseLineInfo from './parseLineInfo';
import data from './data.json';

const parsedLines = parseLineInfo(data);

/* TODO Convert groupsTemplate */
class App extends Component {
  render() {
    return (
      <div className="App">
        <div class="chart">{groupEls.join('\n')}</div>
      </div>
    );
  }
}

export default App;
