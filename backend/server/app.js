import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import fetchRoutes from './routes/user.routes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))



app.get('/api/v1/ping', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PING</title>
      </head>
      <body>
        <h1>Server is running 8000 </h1>
      </body>
    </html>
  `);
});

//Routes///
app.use("/api/v1",fetchRoutes)


export default app