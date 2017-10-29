#!/usr/bin/env node
var conf = require('./conf');
var sources = require('./sources');
if (sources.length==0) {console.log('No sources found.');}
var clc = require('cli-color');
var request = require('request');

console.log(clc.whiteBright.bold('news')+clc.bgWhiteBright.black.bold('STREAM'));

function getArticles(source) {
  return new Promise((resolve, reject) => {
    request({
      uri: "https://newsapi.org/v1/articles?source="+source+"&sortBy=latest"+"&apiKey="+conf.api_key,
      method: "GET",
      timeout: 10000,
      followRedirect: false
    },(error, response, body) => {
      if(!error){
        var artl = JSON.parse(body).articles;
        resolve(artl);
      }else{
        reject(error);
      }
    });
  });
}

var articles = [];
var collection = [];

sources.map((source) => {
  let promise = getArticles(source.id).then((artls) => {
    artls.map((article) => {
      articles.push(article);
    });
  }).catch((error) => {});
  collection.push(promise);
});

Promise.all(collection).then(() => {
  articles.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return -1;
    }
    if (a.publishedAt > b.publishedAt) {
      return 1;
    }
    return 0;
  });
  articles.map((article) => {
    let time = article.publishedAt.substring(0,19);
    console.log(clc.cyan(time)+" / "+article.title);
  });
}).catch((error) => {});