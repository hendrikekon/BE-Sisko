const Brand = require('./model');


const store = async (req, res, next) => {
    try{
        let payload = req.body;
        let brand = new Brand(payload)
        await brand.save();
        return res.json(brand);
    
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
        const{skip = 0, limit=10} = req.query;
        const brand = await Brand.find()
        .skip(parseInt(skip))
        .limit(parseInt(limit));
        res.json(brand);
    } catch (error) {
        next(error);
    }
}

const update = async (req, res) => {
    try{
        let payload = req.body;
        let { id } = req.params;
        
        let brand = await Brand.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        return res.json(brand);
        
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

const destroy = async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await Brand.findByIdAndDelete(id);
        
        if (!brand) {
            return res.status(404).json({ message: 'Brands not found' });
        }
        res.status(200).json({ message: 'Brands deleted successfully' });
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