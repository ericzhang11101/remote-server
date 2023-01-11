import http from 'http'
import { Server } from 'socket.io'
import mysql from 'mysql'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser' 
import SqlString from 'sqlstring'
import * as dotenv from 'dotenv' 

import socketHandler  from './utils/socketHandler.js'

const port = process.env.PORT || 3000
dotenv.config()

// initialize express
const app = express();
app.use(cors())
app.use(bodyParser.json())

// initialize socket io
const server = http.createServer(app); // use express and socketio on same server/port
const io = new Server(server, {
    cors: {origin: "*"}
});
socketHandler(io)

// initialze mysql 
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

db.connect((err) => {
    if (err) {
        console.error('failed to connect to db')
        console.error(err)
    }
    else {
        console.log('connected to aws')
    }
})

app.get('/', (req, res) => {
    res.send('working !')
})

app.post('/getNickname', async (req, res) => {
    console.log('get nickname')
    const id = req.body.key;
    if (id){
        const sql  = `
            SELECT Nickname 
            FROM sys.UserKey 
            WHERE DeviceKey = "${SqlString.escape(id)}"`

        const data = await new Promise((resolve, reject) => {
            db.query(sql, async (err, sqlData) => {
                if (err){
                    console.error(err)
                    reject()
                }
                else {
                    resolve(sqlData)
                }
            })  
        })
    
        console.log('data: ') 
        console.log(data)

        if (data.length){
            console.log('a')
            res.send(JSON.stringify({
                deviceName: data[0].Nickname
            }))
        }
        else {
            console.log('b')

            res.send(JSON.stringify({
                success: false
            }))
        }
    }
    else {
        console.log('c')

        res.send(JSON.stringify({
            success: false,
            error: "Missing required param 'id'"
        }))
    }
    
})

app.post('/setNickname', async (req, res) => {
    console.log('set nickname')

    console.log(req.body)
    const id = req.body.key
    const name = req.body.name

    if (id && name){
        const sql = `
            INSERT INTO sys.UserKey (DeviceKey, Nickname)
            VALUES (${SqlString.escape(id)}, ${SqlString.escape(name)})
        `

        db.query(sql, async (err, response) => {
            if (err){
                res.send(err)
            }
            else {
                res.send(JSON.stringify({
                    success: true
                }))
            }
        })  

    }
})

server.listen(port, () => {
    console.log('socket.io listening on *:' + port);
});