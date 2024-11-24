const mongoose = require("mongoose");
 const {Schema, model} = mongoose;

 const orderItemSchema = new Schema({
    name: {
        type: String,
        minlength: [3, 'Panjang nama barang minimal 3 karakter'],
        required: [true, 'Nama barang harus diisi']
    },
    price: {
        type: Number,
        required: [true, 'Harga barang harus diisi']
    },
    qty:{
        type: Number,
        required: [true, 'Jumlah barang harus diisi'],
        min: [1, 'Kuantitas minimal 1']
    },
    product:{
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    order:{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }
 });

 module.exports = model('OrderItem', orderItemSchema);