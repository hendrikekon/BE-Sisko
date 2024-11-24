const DeliveryAddress = require('./model');
const Users = require('../user/model');
const {subject} = require('@casl/ability');
const { policyFor } = require('../../utils');

const store = async (req, res, next) => {
    try{
        let payload = req.body;
        let user = req.user;
        let address = new DeliveryAddress({...payload, user: user._id})
        await address.save();
        return res.json(address);
    
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        next(err);
    }
}


const index = async (req, res, next) => {
    try {
        let{skip = 0, limit=10} = req.query;
        
        let count = await DeliveryAddress.find({user: req.user._id}).countDocuments();
        const address = await DeliveryAddress.find({user: req.user._id})
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .sort('-createdAt')
        return res.json({
            data: address,
            count
        });
    } catch (error) {
        next(error);
    }
}

// const indexbyId = async (req, res) => {
//     const productId = req.params.id;
//     try {
//         const product = await Product.findById(productId)
//         .populate('category')
//         .populate('tags');;
//         if (product) {
//             return res.json(product);
//         } else {
//             res.status(404).send('Product not found');
//         }
//     } catch (error) {
//         res.status(500).send(error);
//     }
// }


const update = async (req, res, next) => {
    
    try {
        let {_id, ...payload} = req.body
        let { id } = req.params;
        let address = await DeliveryAddress.findById(id);
        let subjectAddress = subject('DeliveryAddress', {...address, user_id: address.user});
        let policy = policyFor(req.user);
        if (!policy.can('update', subjectAddress)) {
            return res.json({
                error: 1,
                message: 'You are not authorized to update this address'
            })
        }

        // Relasi User
        // if (payload.User) {
        //     let user = await Users.findOne({ name: { $regex: payload.User, $options: 'i' } });
        //     if (user) {
        //         payload = { ...payload, user: user._id };
        //     } else {
        //         delete payload.User;
        //     }
        // }
        address = await DeliveryAddress.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        return res.json(address);

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

const destroy = async (req, res) => {
    
    // const { id } = req.params;
    try {
        let { id } = req.params;
        let address = await DeliveryAddress.findById(id);
        let subjectAddress = subject('DeliveryAddress', {...address, user_id: address.user});
        let policy = policyFor(req.user);
        if (!policy.can('delete', subjectAddress)) {
            return res.json({
                error: 1,
                message: 'You are not authorized to delete this address'
            })
        }
        address = await DeliveryAddress.findByIdAndDelete(id);
        
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    index,
    store,
    update,
    destroy
}