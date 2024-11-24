const mongoose = require('mongoose');
const {model, Schema} = mongoose;

const cartItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nama product harus diisi'],
        minlength: [5, 'Panjang nama product minimal 3 karakter']
    },
    qty: {
        type: Number,
        required: [true, 'Jumlah qty harus diisi'],
        min: [1, 'Jumlah qty minimal 1']
    },
    price: {
        type: Number,
        default: 0
    },
    image_url: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Produk harus dipilih']
    },
    colorId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    sizeId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

module.exports = model('CartItem', cartItemSchema);