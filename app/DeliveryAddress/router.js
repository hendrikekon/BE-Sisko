const router = require('express').Router();
const deliveryAddressController = require('./controller');
const multer = require('multer');
const upload = multer();
const { police_check } = require('../../middlewares');


router.get('/delivery-address', police_check('view', 'DeliveryAddress'),deliveryAddressController.index);
router.post('/delivery-address', upload.none(), police_check('create', 'DeliveryAddress'), deliveryAddressController.store);
router.patch('/delivery-address/:id', upload.none(), police_check('update', 'DeliveryAddress'), deliveryAddressController.update);
router.delete('/delivery-address/:id', police_check('delete', 'DeliveryAddress'), deliveryAddressController.destroy);






module.exports = router;