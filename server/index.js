const express = require('express')
const app = express()
const port = 3000

const config = require('./config/key');

const { User } = require("./models/User");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');

const mongoose = require('mongoose')
mongoose
    .connect(config.mongoURI) 
    .then(() => console.log('MongoDB Connceted...'))
    .catch(err => console.log(err))

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post('/api/users/login', (req, res) => {
    // 1.요청된 email을 DATABASE에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess : false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        // 2. 있다면 비밀번호가 맞는지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) 
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
        // 3. 비밀번호까지 맞다면 해당 유저를 위한 token을 생성한다.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                //토큰을 저장한다. 어디에? (개발자 마음대로지만)쿠키 / 로컬 등에
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})
            })
        })

    })
})

app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해왔다는 얘기는 Authentication 이 true 라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, //role값의 설정에 따라 바꿀 수 있음
        isAuth: true,
        email: req.user.eamil,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})
app. get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, 
        { token: "" },
        (err, user) => {
            if(err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))