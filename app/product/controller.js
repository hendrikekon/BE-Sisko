const path = require('path');
const fsp = require('fs').promises;
const fs = require('fs')
const Product = require('./model');
const config = require('../config');
const Category = require('../category/model');
const Brand = require('../brand/model');

// const fs = require('fs').promises; // Use fs.promises to access the promise-based methods

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        // Convert category and brand names to ObjectIds
        if (payload.category) {
            const category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } });
            if (category) {
                payload.category = category._id;
            } else {
                delete payload.category;
            }
        }

        if (payload.brands) {
            const brand = await Brand.findOne({ name: { $regex: payload.brands, $options: 'i' } });
            if (brand) {
                payload.brands = brand._id;
            } else {
                delete payload.brands;
            }
        }

        // Process files dynamically
        if (req.files && req.files.length > 0 && payload.colors) {
            payload.colors = JSON.parse(payload.colors);

            // Log the received files and colors to check if they match

            await Promise.all(req.files.map(async (file, index) => {
                if (file && payload.colors[index]) {  // Ensure both file and color entry exist
                    const originalExt = file.originalname.split('.').pop();
                    const filename = `${file.filename}.${originalExt}`;
                    const tmp_path = file.path;

                    const target_path = path.resolve(config.rootpath, `public/images/products/${filename}`);

                    // Move file to the target directory and delete the temporary file
                    await fsp.copyFile(tmp_path, target_path); // Use fs.promises.copyFile
                    await fsp.unlink(tmp_path);

                    // Associate the file with the corresponding color entry
                    payload.colors[index].image = filename;
                } else {
                    console.warn(`File or color entry is missing at index ${index}`);
                }
            }));
        } else {
            console.log("No files or colors received.");
        }

        // Save product to the database
        const product = new Product(payload);
        await product.save();

        return res.status(200).json(product);

    } catch (err) {
        console.error("Error processing product:", err);
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
        let { skip = 0, limit = 10, q = '', category = '', brands = '' } = req.query;

        let criteria = {};

        // for Search purpose. use product name if query parameter is provided
        if (q) {
            criteria.name = { $regex: q, $options: 'i' };
        }

        // Handle category filter only if category is not an empty string
        if (category && category.length) {
            let categoryResult = await Category.findOne({ name: { $regex: `${category}`, $options: 'i' } });

            if (categoryResult) {
                criteria = { ...criteria, category: categoryResult._id };
            }
        }

        // Handle brand filter only if brand is not an empty string
        if (brands && brands.length) {
            const brandResult = await Brand.findOne({ name: { $regex: `${brands}`, $options: 'i' } });
            if (brandResult) {
                criteria = { ...criteria, brands: brandResult._id };
            }
        }

        // Count the documents matching the criteria
        const count = await Product.countDocuments(criteria);

        // Fetch products based on the criteria
        const products = await Product.find(criteria)
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('category')
            .populate('brands');

        // Return the response with product data and count
        return res.json({
            data: products,
            count
        });
    } catch (error) {
        next(error);
    }
};



const indexbyId = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId)
        .populate('category')
        .populate('brands');

        if (product) {
            return res.json(product);
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
}


const update = async (req, res, next) => {
    try {
        const { id, colorId, sizeId } = req.params;
        let updateData = req.body;

        // Parse colors field if it is a string
        if (updateData.colors && typeof updateData.colors === 'string') {
            try {
                updateData.colors = JSON.parse(updateData.colors);
            } catch (error) {
                return res.status(400).json({ error: 'Invalid colors format' });
            }
        }

        // Find the product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Convert category and brand names to ObjectIds
        if (updateData.category) {
            const category = await Category.findOne({ name: { $regex: updateData.category, $options: 'i' } });
            if (category) {
                updateData.category = category._id;
            } else {
                delete updateData.category;
            }
        }

        if (updateData.brands) {
            const brand = await Brand.findOne({ name: { $regex: updateData.brands, $options: 'i' } });
            if (brand) {
                updateData.brands = brand._id;
            } else {
                delete updateData.brands;
            }
        }

        // Handle file uploads and update the corresponding color image if colorId is provided
        if (req.files && req.files.length > 0 && updateData.colors) {
            await Promise.all(req.files.map(async (file, index) => {
                if (updateData.colors[index] && product.colors[index]) {  // Ensure both file and color entry exist
                    // Delete the old image if it exists
                    const oldImagePath = path.resolve(__dirname, '../../public/images/products', product.colors[index].image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }

                    // Save new image with extension
                    const originalExt = file.originalname.split('.').pop();
                    const filename = `${file.filename}.${originalExt}`;
                    const tmpPath = file.path;
                    const targetPath = path.resolve(config.rootpath, `public/images/products/${filename}`);

                    await fsp.copyFile(tmpPath, targetPath);
                    await fsp.unlink(tmpPath);

                    // Associate the new image with the corresponding color entry
                    updateData.colors[index].image = filename;
                }
            }));
        }

        // Update colors and sizes based on parameters
        if (colorId) {
            const color = product.colors.id(colorId);
            if (!color) return res.status(404).json({ error: 'Color not found' });

            if (sizeId) {
                const size = color.sizes.id(sizeId);
                if (size) {
                    Object.assign(size, updateData); // Update size data
                } else {
                    color.sizes.push(updateData); // Add new size if it doesn't exist
                }
            } else {
                Object.assign(color, updateData); // Update color data
            }
        } else {
            // If no colorId, update product-level data directly
            Object.assign(product, updateData);
        }

        // Save updates to the product
        await product.save();
        return res.json(product);
        
    } catch (error) {
        console.error("Error updating product:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 1,
                message: error.message,
                fields: error.errors
            });
        }
        next(error);
    }
};








const destroy = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the ID is valid
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        // Find product by ID
        const imgproduct = await Product.findById(id);

        if (!imgproduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Log the product to check the colors and images
        // console.log('Product found:', imgproduct);

        // Loop through the colors array and delete each image
        if (imgproduct.colors && imgproduct.colors.length > 0) {
            imgproduct.colors.forEach((color, index) => {
                if (color.image) {
                    const imagePath = path.resolve(__dirname, '../../public/images/products', color.image);

                    // console.log(`Image path for color ${color.color}:`, imagePath);

                    // Check if file exists before deleting
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                        console.log(`Image for color ${color.color} deleted successfully`);
                    } else {
                        console.log(`Image for color ${color.color} not found: ${imagePath}`);
                    }
                }
            });
        } else {
            console.log('No colors found for product');
        }

        // Delete the product from the database
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    index,
    indexbyId,
    store,
    update,
    destroy
}