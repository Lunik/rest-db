/**
 * Created by lunik on 28/06/2017.
 */

import DB from './db'
import EventEmitter from 'events'

export default class API extends EventEmitter {
  constructor (path, name) {
    super()
    this.path = path
    this.db = new DB(this.path)

    this.ready = false

    this.db.on('ready', () => {
      this.ready = true
      this.emit('ready')
    })
  }

  database (req, res) {
    const uri = req.url
    const data = req.body

    if (this.ready) {
      switch (req.method) {
        case 'GET':
          this.db.get(uri, (err, data) => this.response(res, err, data))
          break
        case 'PUT':
          this.db.put(uri, data, (err, data) => this.response(res, err, data))
          break
        case 'POST':
          this.db.post(uri, data, (err, data) => this.response(res, err, data))
          break
        case 'DELETE':
          this.db.delete(uri, (err, data) => this.response(res, err, data))
          break
        default:
          this.response(res, {
            code: 405,
            message: 'Method not allowed.'
          })
      }
    } else {
      this.response(res, {
        code: 202,
        message: 'Database not ready.'
      })
    }
  }
  response (res, err, data) {
    if (err) {
      res.status(err.code)
      res.end(err.message)
    } else {
      res.status(data.code)
      res.end(JSON.stringify(data.data))
    }
  }
}
