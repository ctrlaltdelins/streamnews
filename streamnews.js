#!/usr/bin/env node
var conf = require('./conf');
var clc = require('cli-color');
var request = require('request');
var Datastore = require('nedb');
var db = {};
db.articles = new Datastore();

console.log(clc.bold(' stream')+clc.bgWhite.black.bold('NEWS '));

request({
  uri: "https://eventregistry.org/json/minuteStreamArticles",
  rejectUnauthorized: false,
  useQuerystring: true,
  qs: {
      lang: ["eng","fra"],
      apiKey: conf.api_key
  }
}, (error, response, body) => {
  if (error) { console.log(error); }
  //if (JSON.parse(body.error)) { console.warn(JSON.parse(body.error)); }
  let articles = JSON.parse(body).recentActivity.articles.activity;
  articles.sort((a, b) => {
    if (a.dateTime < b.dateTime) { return -1; }
    if (a.dateTime > b.dateTime) { return 1; }
    return 0;
  });
  displayArticles(articles);
});

function displayArticles (articles) {
  articles.map((article) => {
    if (article) {
      //console.log(clc.green(article.time) + ' | ' + clc.blue(article.source.title) + ' | ' + article.title);
    }
    console.log(article);
  });
}