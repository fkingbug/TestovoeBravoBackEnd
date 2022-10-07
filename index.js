const express = require('express')
const cors = require('cors')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const db = require('./db.json')
const checkAuth = require('./utils/checkAuth.js')
const fs = require('fs')

const server = jsonServer.create()

server.use(express.json())
server.use(cors())

server.post('/auth', (req, res) => {
  try {
    const { body } = req

    const user = db.users.find(user => user.password === body.password && user.email === body.email)
    if (!user) {
      return res.status(400).json('неверный логин или пароль')
    }
    const token = jwt.sign(
      {
        email: req.body.email,
      },
      'AWWKPpFh'
    )
    res.send({
      succes: true,
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    })
  }
})

server.get('/auth/me', checkAuth, (req, res) => {
  try {
    const user = db.users.find(user => user.email === req.email)
    if (!user) {
      return res.status(400).json('неверный логин или пароль')
    }
    res.json({
      user,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    })
  }
})

server.get('/workers', (req, res) => {
  res.send(db.workers)
})
server.get('/tableORders', (req, res) => {
  const sortOrder = db.orders.sort((a, b) => b.workers.length - a.workers.length)
  res.send(sortOrder)
})

server.post('/order', function (req, res, next) {
  const { body } = req

  const dropOrder = db.orders.find(
    order =>
      order.name === body.name && order.workers.find(workersORder => workersORder === body.workers)
  )
  if (dropOrder) {
    return res.status(500).send({
      succes: false,
    })
  }

  const orderCheck = db.orders.find(order => order.name === body.name)
  if (!orderCheck) {
    console.log('ТАкое имя есть')
    const newOrder = { name: body.name, workers: [body.workers] }
    fs.readFile('./db.json', (err, data) => {
      if (err) throw err
      const db = JSON.parse(data)
      const updatedDb = { ...db, orders: [...db.orders, newOrder] }

      fs.writeFile('./db.json', JSON.stringify(updatedDb), error => {
        if (error) {
          console.log('An error has occurred ', error)
          return
        }
        console.log('Data written successfully to disk')
      })
      return res.send({ data: orderCheck, success: true })
    })
  } else {
    const orderAdd = db.orders.map(order =>
      order.name === body.name ? { ...order, workers: [...order.workers, body.workers] } : order
    )

    console.log('orderAdd', orderAdd)
    // orderAdd.workers = [...orderAdd.workers, body.workers]
    // console.log('newADD', orderAdd)

    fs.readFile('./db.json', (err, data) => {
      if (err) throw err
      const db = JSON.parse(data)
      const updatedDb = { ...db, orders: [...orderAdd] }

      fs.writeFile('./db.json', JSON.stringify(updatedDb), error => {
        if (error) {
          console.log('An error has occurred ', error)
          return
        }
        console.log('Data written successfully to disk')
      })
      res.send({ data: orderCheck, success: true })
    })
  }
})

// const orderAdd = db.orders.find(order => order.name === body.name)
// orderCheck.workers = [...orderAdd.workers , body.workers]

// const newOrder = { name: body.name, workers: [body.workers] }
// fs.readFile('./db.json', (err, data) => {
//   if (err) throw err
//   const db2 = JSON.parse(data)
//   const updatedDb2 = { ...db2, orders: [...db.orders, orderAdd] }

//   fs.writeFile('./db.json', JSON.stringify(updatedDb2), error => {
//     if (error) {
//       console.log('An error has occurred ', error)
//       return
//     }
//     console.log('Data written successfully to disk')
//   })
//   res.send({ data: orderCheck, success: true })
// }

server.listen(4444, err => {
  if (err) {
    return console.log(err)
  }
  console.log('server OK')
})
