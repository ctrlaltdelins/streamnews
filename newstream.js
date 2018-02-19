#!/usr/bin/env node
var argv = require('optimist').argv;
var package = require('./package.json');
var colors = require('colors');
var request = require('request');
var FeedParser = require('feedparser');

function Feed (name, url) {
  this.name = name;
  this.url = url;
}

var Reader = function () {

  var add = function () {
    var name = process.argv[3],
        url = process.argv[4];
    var src = new Feed(name, url);
    console.log('Added'.green);
  };

  var del = function () {
    console.log('Deleted'.red);
  };

  var list = function () {
    console.log('Listed'.cyan);
  };

  var help = function () {
    console.log("\n"+'NEWSTREAM v'+package.version+' HELP:'+"\n");
    console.log('$ newstream                                      // stream the news');
    console.log('$ newstream -a (--add)     "<name>" "<rss_url>"  // add source');
    console.log('$ newstream -d (--delete)  "<name>"              // remove source');
    console.log('$ newstream -l (--list)                          // list sources');
    console.log('$ newstream -h (--help)                          // DUH!');
  };

  var stream = function () {

    console.log(`
    `+(' ____ __ ____ _     _   ____ ______ _____ _____ __   ___').blue+`
    `+('|    |  |  __| | _ | |/  __ \\    __| \\ __| __  |  \\ /  |').cyan+`
    `+('|  | |  | |__| |/ \\| || \\___/|  | |)  |__  |_| |   |   |').green+`
    `+('|   \\   |  __|       | \\__  \\|  |    / __|  _  | |   | |').yellow+`
    `+('|  | |  | |__|   |   |/ __\\  |  | |\\ \\|__  | | | |\\_/| |').red+`
    `+('|__|____|____|__/ \\__|\\_____/|__|_| \\_\\__|_| |_|_|   |_|').magenta+(` v`+package.version).gray+`
    `);

  };

  return {
    add: add,
    delete: del,
    list: list,
    help: help,
    stream: stream
  };

}();

if ( argv.add || argv.a ) { Reader.add(); }
else if ( argv.delete || argv.d ) { Reader.delete(); }
else if ( argv.list || argv.l ) { Reader.list(); }
else if ( argv.help || argv.h ) { Reader.help(); }
else { Reader.stream(); }