#!/usr/bin/env node
var conf = require('./conf');
var sources = require('./sources');
if (sources.length==0) {console.log('No sources found.');}
var request = require('request');

sources.sort((a, b) => {
  if (a.name.toUpperCase() < b.name.toUpperCase()) {
    return -1;
  }
  if (a.name.toUpperCase() > b.name.toUpperCase()) {
    return 1;
  }
  return 0;
});

sources.map((source) => {
  console.log(source.name);
});