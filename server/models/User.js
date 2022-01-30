// User schema 만들기
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10 // salt를 이용해서 비밀번호를 암호화하는데 쓸 것이기 때문에 salt를 쓸 변수를 생성해주는 것이다.
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password : {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlenght: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: { //token의 유효기간
        type: Number
    }
})

userSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')){
        // 비밀번호를 암호화 시킨 후 next()로 다음 작업을 수행한다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err) // error 발생하면 다음 작업 수행
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    // plainPassword = 1234567 와 DB의 암호화된 비밀번호가 같은지 체크
    // 그러기 위해선 plainPassword도 암호화해서 DB 내용과 같은지 비교해야 한다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
            cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    //jsonwebtoken 이용해서 토큰 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
    
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // token decode 하기.
    jwt.verify(token, 'secretToken', function(err, decode) {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인
        user.findOne({"_id": decode, "token": token}, function(err, user) {
            if(err) return cb(err);
            cb(null, user)
        })
    })
}
const User = mongoose.model('User', userSchema)
module.exports = {User}