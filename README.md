[![npm](https://img.shields.io/npm/v/streamnews.svg?style=flat-square)](https://www.npmjs.com/package/streamnews)
[![licence](https://img.shields.io/npm/l/streamnews.svg?style=flat-square)](https://github.com/ctrlaltdev/streamnews/blob/master/LICENCE.md)
[![GitHub tag](https://img.shields.io/github/tag/ctrlaltdev/streamnews.svg?style=flat-square)](https://github.com/ctrlaltdev/streamnews/tags)
[![GitHub release](https://img.shields.io/github/release/ctrlaltdev/streamnews.svg?style=flat-square)](https://github.com/ctrlaltdev/streamnews/releases)
[![I love badges](https://img.shields.io/badge/I%20love-badges-FF00FF.svg?style=flat-square)](https://shields.io)

### streamnews
Stream news in a terminal.

Installation: `npm install -g streamnews` or `yarn global install streamnews`

* Get your API KEY at https://eventregistry.org
* Customize conf.json: `sudo vi PATHTOYOURGLOBALNODE_MODULESDIR/streamnews/conf.json`
* Type `streamnews`

And voilà.

If you want to filter by languages (english by default), change filters to true in conf.json, and remove the languages you don't want - /!\ you can't retrieve articles in more than 3 languages with the free eventregistry account.