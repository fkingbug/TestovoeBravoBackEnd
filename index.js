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
  const { body } = req

  try {
    const user = db.users.find(user => user.password === body.password && user.email === body.email)
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

server.post('/registration', function (req, res, next) {
  const { body } = req
  const orderCheck = db.orders.find(order => order.name === body.name)
  if (!orderCheck) {
    const newOrder = { name: body.name, workers: [body.workers] }
    fs.readFile('./db.json', (err, data) => {
      if (err) throw err
      const db = JSON.parse(data)
      const updatedDb = { ...db, orders: [...db.orders, newOrder] }
      console.log(updatedDb)

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

  // const id = new Date().getTime()

  // const newUser = { ...req.body, id }

  // fs.readFile('./db.json', (err, data) => {
  //   if (err) throw err
  //   const db = JSON.parse(data)
  //   const updatedDb = { ...db, orders: [...db.users, newUser] }
  //   console.log(updatedDb)

  //   fs.writeFile('./db.json', JSON.stringify(updatedDb), error => {
  //     if (error) {
  //       console.log('An error has occurred ', error)
  //       return
  //     }
  //     console.log('Data written successfully to disk')
  //   })

  //   res.send({ data: newUser, success: true })
  // })
})

server.listen(4444, err => {
  if (err) {
    return console.log(err)
  }
  console.log('server OK')
})
