const express = require('express')
const app = express()
const port = 3000

const config = require('./config/key');

const { User } = require("./models/User");
const bodyParser = require('body-parser')

const mongoose = require('mongoose')
mongoose
    .connect(config.mongoURI) 
    .then(() => console.log('MongoDB Connceted...'))
    .catch(err => console.log(err))

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World! 안녕하세요, 새해 복 많이 받으세요 Backend start'))

app.post('/register', (req, res) => {
    //회원가입 시 필요 정보 client에서 가져오면 데이터베이스에 넣어주기.
    // 이를 위해선 User.js 를 가져와야함
    
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    }) //mongoDB method
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))