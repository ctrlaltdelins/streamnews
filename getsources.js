#!/usr/bin/env node
var conf = require('./conf');
var request = require('request');
var fs = require("fs");

function retrieveSources(filters="") {
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

var src = [];
function collectSources(array=[]){
  src = src.concat(array);
}

if(!conf.filterSources){
  console.log("Getting all the sources...");
  retrieveSources().then((sources) => {
    fs.writeFile("sources.json", JSON.stringify(sources), (err) => {
      if(!err){console.log(sources.length + ' sources retrieved.');}
      else{console.log('Error:',err);}
    });
  });

}else{
  console.log("Getting sources based on filters in conf.json...");
  var collection = [];

  conf.filters.languages.map((lang) => {
    conf.filters.countries.map((country) => {
      conf.filters.categories.map((category) => {
        let promise = retrieveSources("?language="+lang+"&country="+country+"&category="+category).then((sources)=>{
          collectSources(sources);
        });
        collection.push(promise);
      });
    });
  });

  Promise.all(collection).then(() => {
    fs.writeFile("sources.json", JSON.stringify(src), (err) => {
      if(!err){console.log(src.length + ' sources retrieved.');}
      else{console.log('Error:',err);}
    });
  });
}