const router = require('express').Router();
const orderController = require('./controller');
const multer = require('multer');
const upload = multer();
const { police_check } = require('../../middlewares');


router.get('/orders', police_check('view', 'Order'),orderController.index);
router.post('/orders', upload.none(), police_check('create', 'Order'), orderController.store);

module.exports = router;