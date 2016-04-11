/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(9).polyfill();

	var config = __webpack_require__(1);
	var Product = __webpack_require__(3);
	var Products = __webpack_require__(5);

	var products = Products({
	  path: config.data_path
	});

	phantom.cookiesEnabled = true;
	phantom.javascriptEnabled = true;

	var StockCrawler = __webpack_require__(7);
	var crawler = new StockCrawler(config);

	// 1. Get all items
	var items = products.list().map(function (filepath) {
	  return Product({
	    filepath: filepath
	  });
	});

	items.forEach(function (p) {
	  return p.read();
	});

	// 2. iterate through all items using a recursive function

	var fetch_from_web = function fetch_from_web(items) {
	  var product = items.shift();

	  var item = {
	    data: product.to_object()
	  };

	  crawler.navigate_to_item(item, function (balance) {
	    console.log('Item: ' + item.data.item_id + ', Balance => ', balance);
	    product.set('balance', balance);
	    product.write().then(function () {
	      clearTimeout(terminate);
	      var terminate = setTimeout(function () {
	        var d = new Date();
	        console.log(d.toTimeString() + ': exit phantom');
	        phantom.exit();
	      }, 10000);

	      if (items.length) {
	        fetch_from_web(items);
	      }
	    }).catch(function (err) {
	      console.error(err);
	    });
	  });
	};

	fetch_from_web(items);

	setTimeout(function () {
	  console.log('Phantom timed out after 40 seconds.');
	  phantom.exit();
	}, 40000);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	var isNode = typeof phantom === 'undefined';

	// execute function immediately into variable
	var current_dir = function () {
	  if (isNode) {
	    return __dirname;
	  } else {
	    var fs = __webpack_require__(4);
	    return fs.absolute('.');
	  }
	}();

	var join = function join(paths) {
	  if (isNode) {
	    var path = __webpack_require__(2);
	    return path.join.apply(null, paths);
	  } else {
	    return paths.join('/');
	  }
	};

	module.exports = {
	  'host': 'http://webshop.eelab.se/',
	  'product_url': 'Product?product=',
	  'login_url': 'http://webshop.eelab.se/login.aspx',
	  'username': '100415-CARÖ',
	  'password': 'P6jgH5',
	  'podio': {
	    'client_id': 'eel-crawler',
	    'client_secret': 'iJ7F0wP5rxRyHNLpM0PUxzaB2NSUvyK5MR3XtF5o8AJLxnbQAluMq7ehPJZSzFq8',
	    'products': {
	      'app_id': '14448457',
	      'app_token': 'c19c9d5d424f418c82b0729a91f894ad',
	      'fields': {
	        'item_number': 111827783
	      }
	    },
	    'balances': {
	      'app_id': '14636276',
	      'app_token': 'ccbb96d9bad44b99b6588de6db8877b8',
	      'fields': {
	        'item_number': 112232656,
	        'timestamp': 112463335,
	        'balance': 112232658
	      }
	    }
	  },
	  'phantomjs': {
	    'log_path': current_dir
	  },
	  'data_path': join([current_dir, 'data/'])
	};
	/* WEBPACK VAR INJECTION */}.call(exports, ""))

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var fs = __webpack_require__(4);

	var Product = function Product(options) {

	  var path = void 0;
	  var filepath = void 0;
	  var podio = options.podio || undefined;

	  var data = {
	    'item_id': options.item_id || undefined,
	    'item_number': options.item_number || undefined,
	    'balance': options.balance || undefined
	  };

	  var fields = options.fields || undefined;

	  var isNode = typeof phantom === 'undefined';

	  if (options.path) {
	    path = options.path;
	  } else if (options.filepath) {
	    filepath = options.filepath;
	    data.item_id = get_item_id_from_filepath(filepath);
	  } else {
	    throw new Error('No path or filepath set');
	  }

	  function get_filename() {
	    if (!filepath) {
	      filepath = path + data.item_id + '.json';
	    }

	    return filepath;
	  }

	  function get_item_id_from_filepath(path) {
	    return parseInt(path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.')));
	  }
	  /*
	   * read item from Podio
	   */
	  function fetch() {
	    return new Promise(function (resolve, reject) {
	      var url = '/item/' + data.item_id + '/value/' + fields.item_number + '/v2';
	      podio.request('GET', url, undefined).then(function (response) {
	        data.item_number = response.values;
	        data.balance = data.balance || 0;
	        resolve();
	        ;
	      }).catch(function (error) {
	        reject(Error(error));
	      });
	    });
	  }

	  /*
	   * read item from file
	   */
	  function read() {
	    var filename = get_filename();
	    var file_content = void 0;
	    if (isNode) {
	      file_content = fs.readFileSync(filename, {
	        encoding: 'utf8'
	      });
	    } else {
	      file_content = fs.read(filename);
	    }

	    file_content = JSON.parse(file_content);

	    data.item_number = file_content.item_number;
	    data.balance = file_content.balance;
	  }

	  /*
	   * write item to file
	   */
	  function write() {
	    return new Promise(function (resolve, reject) {
	      try {
	        if (isNode) {
	          fs.writeFileSync(get_filename(), JSON.stringify(to_object()), 'utf8');
	        } else {
	          fs.write(get_filename(), JSON.stringify(to_object()), 'w');
	        }

	        resolve();
	      } catch (err) {
	        reject(Error(err));
	      }
	    });
	  }

	  function remove() {
	    return new Promise(function (resolve, reject) {
	      var filename = get_filename();
	      fs.unlink(filename, function (err) {
	        if (err && err.code !== 'ENOENT') {
	          // don't trigger for missing files
	          reject(Error(err));
	        } else {
	          resolve('The file was deleted');
	        }
	      });
	    });
	  }

	  function set(key, value) {
	    if (key in data) {
	      data[key] = value;
	    } else {
	      throw new Error('There is no ' + key + ' in the product data.');
	    }
	  }

	  function to_object() {
	    return data;
	  }

	  return {
	    'fetch': fetch,
	    'get_filename': get_filename,
	    'isNode': isNode,
	    'read': read,
	    'remove': remove,
	    'set': set,
	    'to_object': to_object,
	    'write': write
	  };
	};

	module.exports = Product;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var fs = __webpack_require__(4);

	var Balance = __webpack_require__(6);

	var Products = function Products(options) {

	  var path = options.path;
	  var balances_config = options.balances_config || undefined;
	  var podio = options.podio || undefined;

	  var products = [];
	  var isNode = typeof phantom === 'undefined';

	  var list = function list() {
	    var files = void 0;
	    if (isNode) {
	      files = fs.readdirSync(path);
	    } else {
	      files = fs.list(path);
	    }

	    return files.map(function (file) {
	      return path + file;
	    }).filter(function (file) {
	      return file.substr(-5) === '.json' && isFile(file);
	    });
	  };

	  /*
	   * Adds either an array of products or one product to existing array
	   */
	  var add = function add(args) {
	    if (Array.isArray(args)) {
	      products = args;
	    } else {
	      products.push(args);
	    }
	  };

	  var save = function save() {
	    // 1. Create array of balance objects
	    products.map(function (product) {
	      var data = product.to_object();
	      console.log(data);
	      return Balance({
	        podio: podio,
	        id: data.item_id,
	        app_id: balances_config.app_id,
	        balance: data.balance,
	        fields: balances_config.fields
	      });
	    })
	    // 2. Iterate through array of balance objects and call save on each
	    .forEach(function (balance) {
	      balance.save();
	    });
	  };

	  var isFile = function isFile(file) {
	    if (isNode) {
	      return fs.statSync(file).isFile();
	    } else {
	      return fs.isFile(file);
	    }
	  };

	  return {
	    list: list,
	    add: add,
	    save: save
	  };
	};

	module.exports = Products;

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	var Balance = function Balance(options) {

	  var podio = void 0;
	  var id = void 0;
	  var app_id = void 0;
	  var balance = void 0;
	  var fields = void 0;

	  if (options.podio) {
	    podio = options.podio;
	  } else {
	    throw new Error('No podio object set');
	  }

	  if (options.app_id) {
	    app_id = options.app_id;
	  } else {
	    throw new Error('No app_id set');
	  }

	  if (options.id) {
	    id = options.id;
	  } else {
	    throw new Error('No id set');
	  }

	  if (options.balance || options.balance === 0) {
	    balance = options.balance;
	  } else {
	    throw new Error('No balance set');
	  }

	  if (options.fields) {
	    fields = options.fields;
	  } else {
	    throw new Error('No fields set');
	  }

	  /*
	   * Save balance to new balance item in Podio
	   */
	  var save = function save() {
	    console.log('Balance with item_id ' + id + ' will be saved.');
	    var timestamp = new Date().toISOString(),
	        start_date = timestamp.substr(0, 10),
	        start_time = timestamp.substr(11, 5);

	    var data = {};

	    // TODO break out into mapping function
	    data[fields.item_number] = id;
	    data[fields.balance] = balance;
	    data[fields.timestamp] = {
	      start_date: start_date,
	      start_time: start_time
	    };

	    podio.request('POST', '/item/app/' + app_id + '/', {
	      fields: data
	    }).then(function (responseData) {
	      console.log('item create success', responseData);
	    }, function (e) {
	      console.error('Error:', e.body.error);
	      console.error('Error description:', e.description);
	      console.error('HTTP status:', e.status);
	      console.error('Requested URL:', e.url);
	    });
	  };

	  return {
	    save: save
	  };
	};

	module.exports = Balance;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*
	 * Login function
	 * Product page function
	 */

	var StockCrawler = function StockCrawler(config) {
	  var item = void 0;
	  var cb = void 0;
	  var login_attempt = false;
	  var webPage = __webpack_require__(8);
	  var page = webPage.create();

	  page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
	  page.settings.javascriptEnabled = true;
	  page.settings.loadImages = false; //Script is much faster with this field set to false

	  page.onLoadFinished = function () {
	    console.log('LOAD finished');
	    console.log('LOGGED IN ' + login_attempt);
	    if (login_attempt) {
	      login_attempt = false;
	      navigate_to_item(item);
	    }
	  };

	  var login = function login(current_item) {
	    console.log('LOGIN');
	    item = current_item;
	    login_attempt = true;
	    page.evaluate(function (username, password) {
	      document.getElementById('username').value = username;
	      document.getElementById('password').value = password;
	      document.getElementById('submit').click();
	    }, config.username, config.password);
	  };

	  var navigate_to_item = function navigate_to_item(item, callback) {
	    cb = callback || cb;
	    var url = config.host + config.product_url + item.data.item_number;
	    page.open(url, function (status) {
	      console.log('OPENED: ' + url);
	      console.log('GOT: ' + page.url);
	      if (page.url.indexOf(config.login_url) == 0) {
	        login(item);
	      } else {
	        console.log('GET DATA');
	        get_balance();
	      }
	    });
	  };

	  var get_balance = function get_balance() {
	    var balance = page.evaluate(function () {
	      var html = document.getElementById('detailsBalance').innerHTML;
	      balance = parseInt(html.substr(html.lastIndexOf('>') + 1)) || 0;
	      return balance;
	    });

	    cb(balance);
	  };

	  return {
	    navigate_to_item: navigate_to_item
	  };
	};

	module.exports = StockCrawler;

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("webpage");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("es6-promise");

/***/ }
/******/ ]);