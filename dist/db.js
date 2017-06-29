'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _delogger = require('delogger');

var _delogger2 = _interopRequireDefault(_delogger);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by lunik on 28/06/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var DB = function (_EventEmitter) {
  _inherits(DB, _EventEmitter);

  function DB(path) {
    _classCallCheck(this, DB);

    var _this = _possibleConstructorReturn(this, (DB.__proto__ || Object.getPrototypeOf(DB)).call(this));

    _this.path = path;
    _this.log = new _delogger2.default('Database');
    _this.data = {};
    _this.currentTransaction = 0;
    _this.lastSaveTransaction = 0;
    _this.saveTimeout = 5000;
    _this.init();
    setInterval(function () {
      return _this.save();
    }, _this.saveTimeout);
    return _this;
  }

  _createClass(DB, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      _fs2.default.access(this.path, _fs2.default.constants.F_OK, function (err) {
        if (err) {
          // Creation de la DB
          _fs2.default.writeFile(_this2.path, '{}', function (err) {
            if (err) {
              _this2.log.error(err);
            }
            _this2.data = {};
            _this2.currentTransaction++;
            _this2.emit('ready');
          });
        } else {
          // Chargement de la DB
          _fs2.default.readFile(_this2.path, function (err, data) {
            if (err) {
              _this2.log.error(err);
            }
            try {
              _this2.data = JSON.parse(data);
              _this2.currentTransaction++;
              _this2.emit('ready');
            } catch (err) {
              _this2.log.error(err);
            }
          });
        }
      });
    }
  }, {
    key: 'get',
    value: function get(uri, cb) {
      var elements = uri.split('/').filter(Boolean);
      var current = this.data;

      for (var i = 0; i < elements.length; i++) {
        if (current.hasOwnProperty(elements[i])) {
          current = current[elements[i]];
        } else {
          cb({
            code: 404,
            message: uri + ' doesn\'t exist. Use PUT to create the element.'
          }, null);
          return;
        }
      }
      cb(null, { code: 200, data: current });
    }
  }, {
    key: 'put',
    value: function put(uri, data, cb) {
      var elements = uri.split('/').filter(Boolean);
      var current = this.data;

      for (var i = 0; i < elements.length; i++) {
        if (current.hasOwnProperty(elements[i])) {
          current = current[elements[i]];
          if (i === elements.length - 1) {
            cb({
              code: 409,
              message: uri + ' already exist. Use POST to modify the element.'
            });
            return;
          }
        } else {
          var element = i === elements.length - 1 ? data : {};
          current = current[elements[i]] = element;
        }
      }
      this.currentTransaction++;
      cb(null, { code: 201 });
    }
  }, {
    key: 'post',
    value: function post(uri, data, cb) {
      var elements = uri.split('/').filter(Boolean);
      var current = this.data;

      for (var i = 0; i < elements.length; i++) {
        if (current.hasOwnProperty(elements[i])) {
          if (i === elements.length - 1) {
            current[elements[i]] = data;
          } else {
            current = current[elements[i]];
          }
        } else {
          cb({
            code: 405,
            message: uri + ' doesn\'t exist. Use PUT first to create the element.'
          });
          return;
        }
      }
      this.currentTransaction++;
      cb(null, { code: 200 });
    }
  }, {
    key: 'delete',
    value: function _delete(uri, cb) {
      var elements = uri.split('/').filter(Boolean);
      var current = this.data;

      for (var i = 0; i < elements.length; i++) {
        if (current.hasOwnProperty(elements[i])) {
          if (i === elements.length - 1) {
            delete current[elements[i]];
          } else {
            current = current[elements[i]];
          }
        } else {
          cb({
            code: 404,
            message: uri + ' doesn\'t exist.'
          });
          return;
        }
      }
      this.currentTransaction++;
      cb(null, { code: 200 });
    }
  }, {
    key: 'save',
    value: function save() {
      var _this3 = this;

      if (this.currentTransaction > this.lastSaveTransaction) {
        this.lastSaveTransaction = this.currentTransaction;
        _fs2.default.writeFile(this.path, JSON.stringify(this.data), function (err) {
          if (err) {
            _this3.log.error(err);
          }
        });
      }
    }
  }]);

  return DB;
}(_events2.default);

exports.default = DB;