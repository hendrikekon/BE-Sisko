const CartItem = require('../cart-item/model');
const DeliveryAddress = require('../DeliveryAddress/model');
const Order = require('../order/model');
const { Types } =require('mongoose');
const Orderitem = require('../order-item/model');

const store = async (req, res, next) => {
    try {
        let { delivery_fee, delivery_address } = req.body;
        
        // Find items in the cart for the user and populate product, color, and size
        let items = await CartItem.find({ user: req.user._id })
            .populate({
                path: 'product',
                populate: {
                    path: 'colors.sizes',
                    model: 'Product' // Ensure you populate colors and sizes if needed
                }
            });
        
        if (!items || items.length === 0) {
            return res.status(400).json({
                error: 1,
                message: 'You cannot create an order because you have no items in the cart'
            });
        }

        // Find the delivery address by ID
        let address = await DeliveryAddress.findById(delivery_address);
        
        // Create a new order
        let order = new Order({
            _id: new Types.ObjectId(),
            status: 'waiting payment',
            delivery_fee: delivery_fee,
            delivery_address: {
                provinsi: address.provinsi,
                kabupaten: address.kabupaten,
                kecamatan: address.kecamatan,
                kelurahan: address.kelurahan,
                detail: address.detail
            },
            user: req.user._id
        });

        // Create order items with product, color, and size details
        let orderItems = await Orderitem.insertMany(items.map(item => {
            const color = item.product.colors.find(c => c._id.toString() === item.colorId.toString());
            const size = color.sizes.find(s => s._id.toString() === item.sizeId.toString());

            return {
                name: item.product.name,
                qty: item.qty,
                price: size.price,  // Use price specific to selected size
                image_url: color.image,  // Use image specific to selected color
                color: color.color,      // Store color detail
                size: size.size,         // Store size detail
                order: order._id,
                product: item.product._id,
                colorId: color._id,
                sizeId: size._id
            };
        }));

        // Attach order items to the order
        order.order_items.push(...orderItems);
        await order.save();

        // Clear the user's cart after order is placed
        await CartItem.deleteMany({ user: req.user._id });

        // Return the order response
        res.json(order);
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
        let{skip = 0, limit=10} = req.query;
        
        let count = await Order.find({user: req.user._id}).countDocuments();
        const orders = await Order.find({user: req.user._id})
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate('order_items')
        .sort('-createdAt')
        return res.json({
            data: orders.map(order => order.toJSON({virtuals: true})),
            count
        });
    } catch (error) {
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


module.exports = {
    index,
    store,
}