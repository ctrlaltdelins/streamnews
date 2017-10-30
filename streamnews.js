#!/usr/bin/env node
var conf = require('./conf');
var sources = require('./sources');
if (sources.length==0) {console.log('No sources found.');}
var clc = require('cli-color');
var request = require('request');
var Datastore = require('nedb');
var db = new Datastore();
var sha1 = require('sha1');
var latest;

console.log(clc.whiteBright.bold('news')+clc.bgWhiteBright.black.bold('STREAM'));

function getArticles(source) {
  return new Promise((resolve, reject) => {
    request({
      uri: "https://newsapi.org/v1/articles?source="+source+"&sortBy=latest"+"&apiKey="+conf.api_key,
      method: "GET",
      timeout: 1000,
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

function continuousRetrieval () {
  setInterval(() => {
    var articles = [];
    var collection = [];
    
    sources.map((source) => {
      let promise = getArticles(source.id).then((artls) => {
        artls.map((article) => {
    
          let uparticle = {
            _id: sha1(article.publishedAt.substring(0,19)+article.title+source.name),
            author: article.author,
            source: source.name,
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt.substring(0,19)
          };
    
          articles.push(uparticle);
          db.insert(uparticle, (err) => {});
        });
      }).catch((error) => {});
      collection.push(promise);
    });
    
    Promise.all(collection).then(() => {
      db.find({}).sort({ publishedAt: -1 }).limit(10).exec(function (err, dataset) {
        dataset.map((data) => {
          if (latest.id != data._id && data.publishedAt > latest.publishedAt) {
            console.log(clc.cyan(data.publishedAt)+" / "+clc.green(data.source)+" / "+data.title);
            latest = {
              id: data._id,
              publishedAt: data.publishedAt
            };
          }
        });
      });
    }).catch((error) => {});
  
  },5000);
}

var articles = [];
var collection = [];

sources.map((source) => {
  let promise = getArticles(source.id).then((artls) => {
    artls.map((article) => {

      let uparticle = {
        _id: sha1(article.publishedAt.substring(0,19)+article.title+source.name),
        author: article.author,
        source: source.name,
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt.substring(0,19)
      };

      articles.push(uparticle);
      db.insert(uparticle, (err) => {});
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
    console.log(clc.cyan(article.publishedAt)+" / "+clc.green(article.source)+" / "+article.title);
    latest = {
      id: article._id,
      publishedAt: article.publishedAt
    };
  });
  continuousRetrieval();
}).catch((error) => {});