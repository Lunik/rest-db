/**
 * Created by lunik on 28/06/2017.
 */

import fs from 'fs'
import Delogger from 'delogger'
import EventEmitter from 'events'

export default class DB extends EventEmitter {
  constructor (path) {
    super()
    this.path = path
    this.log = new Delogger('Database')
    this.data = {}
    this.currentTransaction = 0
    this.lastSaveTransaction = 0
    this.saveTimeout = 5000
    this.init()
    setInterval(() => this.save(), this.saveTimeout)
  }
  init () {
    fs.access(this.path, fs.constants.F_OK, (err) => {
      if (err) {
        // Creation de la DB
        fs.writeFile(this.path, '{}', (err) => {
          if (err) {
            this.log.error(err)
          }
          this.data = {}
          this.currentTransaction++
          this.emit('ready')
        })
      } else {
        // Chargement de la DB
        fs.readFile(this.path, (err, data) => {
          if (err) {
            this.log.error(err)
          }
          try {
            this.data = JSON.parse(data)
            this.currentTransaction++
            this.emit('ready')
          } catch (err) {
            this.log.error(err)
          }
        })
      }
    })
  }
  get (uri, cb) {
    const elements = uri.split('/').filter(Boolean)
    var current = this.data

    for (let i = 0; i < elements.length; i++) {
      if (current.hasOwnProperty(elements[i])) {
        current = current[elements[i]]
      } else {
        cb({
          code: 404,
          message: `${uri} doesn't exist. Use PUT to create the element.`
        }, null)
        return
      }
    }
    cb(null, {code: 200, data: current})
  }
  put (uri, data, cb) {
    const elements = uri.split('/').filter(Boolean)
    var current = this.data

    for (let i = 0; i < elements.length; i++) {
      if (current.hasOwnProperty(elements[i])) {
        current = current[elements[i]]
        if (i === elements.length - 1) {
          cb({
            code: 409,
            message: `${uri} already exist. Use POST to modify the element.`
          })
          return
        }
      } else {
        var element = i === elements.length - 1 ? data : {}
        current = current[elements[i]] = element
      }
    }
    this.currentTransaction++
    cb(null, {code: 201})
  }
  post (uri, data, cb) {
    const elements = uri.split('/').filter(Boolean)
    var current = this.data

    for (let i = 0; i < elements.length; i++) {
      if (current.hasOwnProperty(elements[i])) {
        if (i === elements.length - 1) {
          current[elements[i]] = data
        } else {
          current = current[elements[i]]
        }
      } else {
        cb({
          code: 405,
          message: `${uri} doesn't exist. Use PUT first to create the element.`
        })
        return
      }
    }
    this.currentTransaction++
    cb(null, {code: 200})
  }
  delete (uri, cb) {
    const elements = uri.split('/').filter(Boolean)
    var current = this.data

    for (let i = 0; i < elements.length; i++) {
      if (current.hasOwnProperty(elements[i])) {
        if (i === elements.length - 1) {
          delete current[elements[i]]
        } else {
          current = current[elements[i]]
        }
      } else {
        cb({
          code: 404,
          message: `${uri} doesn't exist.`
        })
        return
      }
    }
    this.currentTransaction++
    cb(null, {code: 200})
  }
  save () {
    if (this.currentTransaction > this.lastSaveTransaction) {
      this.lastSaveTransaction = this.currentTransaction
      fs.writeFile(this.path, JSON.stringify(this.data), (err) => {
        if (err) {
          this.log.error(err)
        }
      })
    }
  }
}
