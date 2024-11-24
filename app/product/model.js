const mongoose = require('mongoose');
const { model, Schema} = mongoose;

const sizeSchema = new Schema({
    size: { type: String, required: true }, // contoh: 'S', 'L', 'XL'
    price: { type: Number, required: true }, // Harga untuk Ukuran
    stock: { type: Number, required: true, default: 0 } // stock untuk ukuran
});

const colorSchema = new Schema({
    color: { type: String, required: true }, // contoh: 'merah', 'biru'
    image: { type: String, required: true }, // single image URL untuk warna
    sizes: [sizeSchema] // ukuran untuk setiap varian warna diambil dari sizeSchema
});

const productSchema = new Schema({
    name: { type: String, required: true }, // nama product
    description: { type: String }, // contoh: bahan pembuatan, berat, rilis tahun, dll
    category: { type: Schema.Types.ObjectId, ref: 'Category'}, // contoh: sepatu lari, bola, basket, futsal,dll
    brands: { type: Schema.Types.ObjectId, ref: 'Brand' }, // contoh: Nile, Adidas, dll
    colors: [colorSchema], // Diambil dari colorSchema
});


module.exports = model('Product', productSchema);
