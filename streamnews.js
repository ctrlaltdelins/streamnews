#!/usr/bin/env node
var conf = require('./conf');
var sources = require('./sources');
if (sources.length==0) {console.log('No sources found.');}
var request = require('request');

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
  getArticles(source.id).then((articles) => {
    articles.map((article) => {
      console.log(article.publishedAt, "/ "+source.name+" -", article.title);
    }); 
  }).catch((error) => {});
});