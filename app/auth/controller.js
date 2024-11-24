const User = require('../user/model')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const {getToken} = require('../../utils');


const register = async(req, res, next) => {
    try{

        const payload = req.body;
        let user = new User(payload);
        await user.save();
        return res.json({
            message: 'User registered successfully',
            user
        });

    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const localStrategy = async (email, password, done) =>{
    
    try{
        let user = await User
        .findOne({email})
        .select('-__v -createdAt -updatedAt -cart_items -token');
        
        if(!user) return done(null, false, { message: 'Incorrect email or password' });
        // if(bcrypt.compareSync(password, user.password)){
        //     ({password, ...userWithoutPassword} = user.toJSON());
        //     return done(null, userWithoutPassword);
        // }
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (passwordMatch) {
            const { password, ...userWithoutPassword } = user.toJSON();
            return done(null, userWithoutPassword);
        } else {
            return done(null, false, { message: 'Incorrect email or password' });
        }
    }catch(err){
        done(err, null);
    }
    done();
}

const login  = async (req, res, next) => {
    passport.authenticate('local', async function(err, user, info){
        if(err) return next(err);
        if(!user) return res.status(400).json({error: 1, message: info.message || 'Email or Password is incorrect'});
        
        try {
            let signed = jwt.sign(user, config.secretkey);
            await User.findByIdAndUpdate(user._id, {$push: {token: signed}});

            return res.status(200).json({
                message: 'Login successful',
                user,
                token: signed
            });
        } catch (error) {
            return next(err);
        }
        
    })(req, res, next);
}

const logout = async (req, res, next) => {
    let token = getToken(req);
    
    if(!token){
        return res.status(400).json({
            error: 1, 
            message: 'Token not provided!!!'
        });
    }

    let user = await User.findOneAndUpdate({token: {$in: [token]}}, {$pull: {token: token}}, {useFindAndModify: false});

    if (!user) {
        return res.status(400).json({
            error: 1,
            message: 'No User Found!!!'
        });
    }

    return res.status(200).json({
        error: 0, 
        message: 'User Logged Out Successfully'
    })
}

const me = (req, res, next) => {

    if(!req.user){
        res.json({
            err: 1,
            message: `You're not login or token expired`
        })
    }
    res.json(req.user);
}



module.exports = {
    register,
    localStrategy,
    login,
    logout,
    me
}