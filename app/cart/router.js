const router = require('express').Router();
const { police_check } = require('../../middlewares');
const cartController = require('./controller');
const multer = require('multer');
const upload = multer();


router.get('/carts', police_check('read', 'Cart'), cartController.index);
router.put('/carts', upload.none(), police_check('update', 'Cart'), cartController.update);
// input hanya bisa dilakukan via json. untuk multipart/formdata dan form url encoded tidak bisa karena data dibaca bukan sebagai array.

module.exports = router;