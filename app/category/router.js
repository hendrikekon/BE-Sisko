const router = require('express').Router();
const categoryController = require('./controller');
const multer = require('multer');
const upload = multer();
const { police_check } = require('../../middlewares');


router.get('/categories', categoryController.index);
router.post('/categories', upload.none(), police_check('create', 'Category'), categoryController.store);
router.patch('/categories/:id', upload.none(), police_check('update', 'Category'), categoryController.update);
router.delete('/categories/:id', police_check('delete', 'Category'), categoryController.destroy);

module.exports = router;