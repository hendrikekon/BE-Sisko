const router = require('express').Router();
const multer = require('multer');
const productController = require('./controller');
const os = require('os');
// const upload = multer({ dest: os.tmpdir() });
const upload = multer({ dest: os.tmpdir() }).any();
const { police_check } = require('../../middlewares');

router.get('/products', productController.index);

router.get('/products/:id', productController.indexbyId);

router.post('/products', upload, police_check('create', 'Product'),productController.store);

router.patch('/products/:id', upload, police_check('update', 'Product'),productController.update);

router.delete('/products/:id', police_check('delete', 'Product'), productController.destroy);

module.exports = router;