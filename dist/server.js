'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by lunik on 28/06/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _delogger = require('delogger');

var _delogger2 = _interopRequireDefault(_delogger);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Database = function () {
  function Database(path, name) {
    var _this = this;

    _classCallCheck(this, Database);

    this.path = path + '/' + name + '.db';
    this.log = new _delogger2.default('Database');

    this.app = (0, _express2.default)();
    this.app.use((0, _compression2.default)());
    this.app.use((0, _cookieParser2.default)());
    this.app.use(_bodyParser2.default.json());
    this.app.use(_bodyParser2.default.urlencoded({
      extended: true
    }));
    this.app.use((0, _morgan2.default)('combined'));

    this.api = new _api2.default(this.path);
    this.api.on('ready', function () {
      return _this.log.info('API is ready.');
    });
    this.app.use(function (req, res, next) {
      return _this.api.database(req, res, next);
    });
  }

  _createClass(Database, [{
    key: 'listen',
    value: function listen(port, host) {
      var _this2 = this;

      this.app.listen(port, host, function () {
        _this2.log.info('Listening on ' + port);
      });
    }
  }]);

  return Database;
}();

exports.default = Database;