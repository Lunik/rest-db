/**
 * Created by lunik on 28/06/2017.
 */

import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import Delogger from 'delogger'
import API from './api'

export default class Database {
  constructor (path, name) {
    this.path = `${path}/${name}.db`
    this.log = new Delogger('Database')

    this.app = express()
    this.app.use(compression())
    this.app.use(cookieParser())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: true
    }))
    this.app.use(morgan('combined'))

    this.api = new API(this.path)
    this.api.on('ready', () => this.log.info('API is ready.'))
    this.app.use((req, res, next) => this.api.database(req, res, next))
  }

  listen (port, host) {
    this.app.listen(port, host, () => {
      this.log.info(`Listening on ${port}`)
    })
  }
}
