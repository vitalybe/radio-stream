/* eslint strict: 0, no-console: 0 */
'use strict';

const path = require('path');
const express = require('express');
const webpack = require('webpack');

const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Listening at http://localhost:${PORT}`);
});
