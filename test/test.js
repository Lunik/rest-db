/**
 * Created by lunik on 28/06/2017.
 */

import request from 'request'
import Database from '../src/server'
var assert = require('chai').assert

var db = new Database('./test', 'maDatabase')

var PORT = process.env.PORT || 8080
db.listen(PORT)

describe('REST API', () => {
  describe('GET', () => {
    it('existing data', (done) => {
      request.get(`http://localhost:${PORT}/item1`, (err, response, body) => {
        assert(!err)
        assert.equal(JSON.parse(body), db.api.db.data.item1)
        done()
      })
    })
    it('not existing data', (done) => {
      request.get(`http://localhost:${PORT}/item3`, (err, response, body) => {
        assert(!err)
        assert.equal(response.statusCode, 404)
        done()
      })
    })
  })

  describe('PUT', () => {
    it('no existing data', (done) => {
      request.put({
        url: `http://localhost:${PORT}/item4`,
        form: {
          data: 'ok'
        }
      }, (err, response, body) => {
        assert(!err)
        assert.equal('ok', db.api.db.data.item4.data)
        done()
      })
    })
    it('existing data', (done) => {
      request.put({
        url: `http://localhost:${PORT}/item4`,
        form: {
          data: 'ok'
        }
    }, (err, response, body) => {
        assert(!err)
        assert.equal(response.statusCode, 409)
        done()
      })
    })
  })

  describe('POST', () => {
    it('no existing data', (done) => {
      request.post({
        url: `http://localhost:${PORT}/item5`,
        form: {
          data: 'ok'
        }
      }, (err, response, body) => {
        assert(!err)
        assert.equal(response.statusCode, 405)
        done()
      })
    })
    it('existing data', (done) => {
      request.put({
        url: `http://localhost:${PORT}/item5`,
        form: {
          data: 'ok'
        }
      }, (err, response, body) => {
        assert(!err)
        assert.equal('ok', db.api.db.data.item5.data)

        request.post({
          url: `http://localhost:${PORT}/item5`,
          form: {
            data: 'plop'
          }
        }, (err, response, body) => {
          assert(!err)
          assert.equal('plop', db.api.db.data.item5.data)
          done()
        })
      })
    })
  })

  describe('DELETE', () => {
    it('no existing data', (done) => {
      request.delete({
        url: `http://localhost:${PORT}/item6`,
        form: {
          data: 'ok'
        }
      }, (err, response, body) => {
        assert(!err)
        assert.equal(response.statusCode, 404)
        done()
      })
    })
    it('existing data', (done) => {
      request.put({
        url: `http://localhost:${PORT}/item6`,
        form: {
          data: 'ok'
        }
      }, (err, response, body) => {
        assert(!err)
        assert.equal('ok', db.api.db.data.item6.data)

        request.delete({
          url: `http://localhost:${PORT}/item6`,
          form: {
            data: 'plop'
          }
        }, (err, response, body) => {
          assert(!err)
          assert.isUndefined(db.api.db.data.item6)
          done()
        })
      })
    })
  })
})
