const Product = require('../product/model');
const cartItem = require('../cart-item/model');

const update = async (req, res, next) => {
    try {
        const { items } = req.body;

        const productIds = items.map(item => item.product._id);
        const products = await Product.find({ _id: { $in: productIds } });

        const cartItems = items.map(item => {
            const product = products.find(prod => prod._id.toString() === item.product._id);

            const color = product.colors.find(color => color._id.toString() === item.colorId);
            const size = color.sizes.find(size => size._id.toString() === item.sizeId);

            return {
                product: product._id,
                colorId: color._id,
                sizeId: size._id,
                price: size.price,
                image_url: color.image,
                name: product.name,
                user: req.user._id,
                qty: item.qty
            };
        });

        await cartItem.deleteMany({ user: req.user._id });
        await cartItem.bulkWrite(cartItems.map(item => ({
            updateOne: {
                filter: {
                    user: req.user._id,
                    product: item.product,
                    colorId: item.colorId,
                    sizeId: item.sizeId
                },
                update: { $set: item },
                upsert: true
            }
        })));

        return res.json(cartItems);
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.status(400).json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }
};


const index = async (req, res, next) => {
    try {
        let items = await cartItem.find({user: req.user._id}).populate('product');

        return res.json(items);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    update,
    index
}