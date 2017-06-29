'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by lunik on 28/06/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var API = function (_EventEmitter) {
  _inherits(API, _EventEmitter);

  function API(path, name) {
    _classCallCheck(this, API);

    var _this = _possibleConstructorReturn(this, (API.__proto__ || Object.getPrototypeOf(API)).call(this));

    _this.path = path;
    _this.db = new _db2.default(_this.path);

    _this.ready = false;

    _this.db.on('ready', function () {
      _this.ready = true;
      _this.emit('ready');
    });
    return _this;
  }

  _createClass(API, [{
    key: 'database',
    value: function database(req, res) {
      var _this2 = this;

      var uri = req.url;
      var data = req.body;

      if (this.ready) {
        switch (req.method) {
          case 'GET':
            this.db.get(uri, function (err, data) {
              return _this2.response(res, err, data);
            });
            break;
          case 'PUT':
            this.db.put(uri, data, function (err, data) {
              return _this2.response(res, err, data);
            });
            break;
          case 'POST':
            this.db.post(uri, data, function (err, data) {
              return _this2.response(res, err, data);
            });
            break;
          case 'DELETE':
            this.db.delete(uri, function (err, data) {
              return _this2.response(res, err, data);
            });
            break;
          default:
            this.response(res, {
              code: 405,
              message: 'Method not allowed.'
            });
        }
      } else {
        this.response(res, {
          code: 202,
          message: 'Database not ready.'
        });
      }
    }
  }, {
    key: 'response',
    value: function response(res, err, data) {
      if (err) {
        res.status(err.code);
        res.end(err.message);
      } else {
        res.status(data.code);
        res.end(JSON.stringify(data.data));
      }
    }
  }]);

  return API;
}(_events2.default);

exports.default = API;