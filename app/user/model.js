const mongoose = require("mongoose");
const { Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require("bcrypt");

let userSchema = new Schema({
    
    full_name: {
        type: String,
        required: [true, 'Nama harus diisi'],
        minlength: [3, 'Panjang nama minimal 3 karakter'],
        maxlength: [255, 'Panjang nama maksimal 255 karakter'],
    },
    customer_id: {
        type: Number,
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        maxlength: [255, 'Panjang Email maksimal 255 karakter']

    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        maxlength: [255, 'Panjang password maksimal 255 karakter']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    token: [String] //array

}, {timestamps: true});

// Validasi Email
userSchema.path('email').validate(function(value) {
    const EMAIL_RE = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;
    return EMAIL_RE.test(value);
}, attr => `${attr.value} harus merupakan email yang valid!`);

//cek Email sudah terdaftar atau belum
userSchema.path('email').validate(async function(value) {
    try{
        //lakukan pencarian ke collection User berdasarkan Email
        const count = await this.model('User').countDocuments({email: value})
        // jika email tidak ada akan mengembalikan true
        // jika email sudah ada akan mengembalikan false
        return !count;
    }catch(err){
        throw err;
    }
}, attr => `${attr.value} Sudah terdaftar`)

//hash Password
const HASH_ROUND = 10;
userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
});

// auto increment
userSchema.plugin(AutoIncrement, {inc_field: 'customer_id'});


module.exports = model('User', userSchema);