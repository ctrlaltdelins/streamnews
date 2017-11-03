#!/usr/bin/env node
var conf = require('./conf');
var clc = require('cli-color');
var request = require('request');
var Datastore = require('nedb');
var db = {};
db.sources = new Datastore();
db.articles = new Datastore();
var sha1 = require('sha1');
var latest = {id: null, index: 0, publishedAt: ''};

function requestSources(filters="") {
  return new Promise((resolve, reject) => {
    request({
      uri: "https://newsapi.org/v1/sources"+filters,
      method: "GET",
      timeout: 10000,
      followRedirect: false
    },(error, response, body) => {
      if(!error){
        var src = JSON.parse(body).sources;
        resolve(src);
      }else{
        reject(error);
      }
    });
  });
}

function requestArticles(source) {
  return new Promise((resolve, reject) => {
    request({
      uri: "https://newsapi.org/v1/articles?source="+source+"&sortBy=latest"+"&apiKey="+conf.api_key,
      method: "GET",
      timeout: 10000,
      followRedirect: false
    },(error, response, body) => {
      if(!error){
        resolve(JSON.parse(body).articles);
      }else{
        reject(error);
      }
    });
  });
}

function getSources () {
  return new Promise((resolve, reject) => {

    var collection = [];
    if(!conf.filterSources){
      console.log("Getting all the sources...");
      let promise = requestSources().then((sources) => {
        sources.map((source) => {
          db.sources.insert(source, (err, success) => { if(err) {console.log(err);} });
        });
      }).catch((error) => { reject(error); });
      collection.push(promise);
    }else{
      console.log("Getting sources based on filters in conf.json...");
      conf.filters.languages.map((lang) => {
        conf.filters.countries.map((country) => {
          conf.filters.categories.map((category) => {
            let promise = requestSources("?language="+lang+"&country="+country+"&category="+category).then((sources)=>{
              sources.map((source) => {
                db.sources.insert(source, (err, success) => { if(err) {console.log(err);} });
              });
            }).catch((error) => { reject(error); });
            collection.push(promise);
          });
        });
      });
    }

    Promise.all(collection).then(() => {
      resolve();
    }).catch((error) => { reject(error); });

  });
}

function retrieveArticles (sources) {
  var collection = [];
  var articles = [];
  sources.map((source) => {
    let promise = requestArticles(source.id).then((artls) => {
      if (artls) {
        artls.map((article) => {
          if (article.author && article.publishedAt && article.title && article.url) {
            let uparticle = {
              _id: sha1(article.publishedAt.substring(0, 19) + article.title + source.name),
              author: article.author,
              source: source.name,
              title: article.title,
              description: article.description,
              url: article.url,
              publishedAt: article.publishedAt.substring(0, 19)
            };
            articles.push(uparticle);
          }
        });
      }
    }).catch((error) => { console.warn(error); });
    collection.push(promise);
  });

  Promise.all(collection).then(() => {
    articles.sort((a, b) => {
      if (a.publishedAt < b.publishedAt) { return -1; }
      if (a.publishedAt > b.publishedAt) { return 1; }
      return 0;
    });
    let latestindex = latest.index;
    articles.map((article) => {
      latestindex++;
      article.index = latestindex;
      db.articles.insert(article, (err, success) => { });
    });
    
  }).then(() => {
    displayArticles();
  }).catch((error) => { console.warn(error); });
}

function displayArticles () {
  db.articles.find({}).sort({ publishedAt: -1 }).limit(50).exec(function (err, dataset) {
    dataset.reverse().map((data) => {
      if (data._id != latest.id && data.index > latest.index) {
        let sourceName = data.source;
        for(i = 0, k = 22 - data.source.length; i < k; i++) {
          sourceName += ' ';
        }
        console.log(clc.cyan(data.publishedAt) + " | " + clc.green(sourceName) + " | " + data.title);
        latest = {
          id: data._id,
          index: data.index,
          publishedAt: data.publishedAt
        };
      }
    });
  });

}

getSources().then(() => {
  console.log('Sources retrieved.');
  console.log(clc.whiteBright.bold('stream') + clc.bgWhiteBright.black.bold('NEWS'));
  setInterval(() => {
    db.sources.find({}).exec(function (err, dataset) {
      retrieveArticles(dataset);
    });
  }, 5000);
}).catch((error) => { console.warn(error); });