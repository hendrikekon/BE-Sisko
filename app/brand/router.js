const router = require('express').Router();
const categoryController = require('./controller');
const multer = require('multer');
const upload = multer();
const { police_check } = require('../../middlewares');


router.get('/brand', categoryController.index);
router.post('/brand', upload.none(), police_check('create', 'Brand'), categoryController.store);
router.patch('/brand/:id', upload.none(), police_check('update', 'Brand'), categoryController.update);
router.delete('/brand/:id', police_check('delete', 'Brand'), categoryController.destroy);

module.exports = router;