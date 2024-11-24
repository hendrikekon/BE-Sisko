const router = require('express').Router();
const invoiceController = require('./controller');
const { police_check } = require('../../middlewares');

router.get('/invoices/:order_id', police_check('read', 'Invoice'), invoiceController.show);

module.exports = router;