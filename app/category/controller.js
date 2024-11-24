const Categories = require('./model');


const store = async (req, res, next) => {
    try{
        let payload = req.body;
        let category = new Categories(payload)
        await category.save();
        return res.json(category);
    
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
        const category = await Categories.find()
        .skip(parseInt(skip))
        .limit(parseInt(limit));
        res.json(category);
    } catch (error) {
        next(error);
    }
}

const update = async (req, res) => {
    try{
        let payload = req.body;
        let { id } = req.params;
        
        let category = await Categories.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        return res.json(category);
        
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
        const category = await Categories.findByIdAndDelete(id);
        
        if (!category) {
            return res.status(404).json({ message: 'Kategori not found' });
        }
        res.status(200).json({ message: 'Kategori deleted successfully' });
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