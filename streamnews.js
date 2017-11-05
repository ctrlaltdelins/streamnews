#!/usr/bin/env node
var conf = require('./conf');
var clc = require('cli-color');
var request = require('request');
var Datastore = require('nedb');
var db = {};
db.articles = new Datastore();
var qs = { apiKey: conf.api_key };
if (conf.filter) { qs.lang = conf.filters.lang; }
else { qs.lang = "eng"; }

console.log(clc.bold(' stream')+clc.bgWhite.black.bold('NEWS '));

function getArticles () {
  request({
    uri: "https://eventregistry.org/json/minuteStreamArticles",
    rejectUnauthorized: false,
    useQuerystring: true,
    qs: qs
  }, (error, response, body) => {
    if (error) { console.log(error); }
    body = JSON.parse(body);
    if (!body.error) {
      let articles = body.recentActivity.articles.activity;
      articles.sort((a, b) => {
        if (a.dateTime < b.dateTime) { return -1; }
        if (a.dateTime > b.dateTime) { return 1; }
        return 0;
      });
      displayArticles(articles);
    }
    else {
      console.warn(body.error);
    }
  });
}

function displayArticles (articles) {
  let collection = [];
  articles.map((article) => {
    if (article) {
      let promise = article;
      console.log(clc.green(article.time) + ' | ' + clc.blue(article.source.title) + ' | ' + article.title);
      qs.id = article.id;
      collection.push(article);
    }
  });

  Promise.all(collection).then(() => {
    setTimeout(() => { getArticles(); },50000);
  }).catch((error) => { reject(error); });
}

getArticles();