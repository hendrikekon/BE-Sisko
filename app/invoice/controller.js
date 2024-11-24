const Invoice = require('./model');
const {subject} = require('@casl/ability');
const { policyFor } = require('../../utils');

const show = async (req, res, next) => {
    try {
        let { order_id } = req.params;

        let invoice = await Invoice
        .findOne({order: order_id})
        .populate('order')
        .populate('user', 'full_name email');
        if (!invoice) {
            return res.status(404).json({
                error: 1,
                message: 'Invoice not found'
            });
        }
        let policy = await policyFor(req.user);
        let subjectInvoice = subject('Invoice', {...invoice, user_id: invoice.user._id});
        if (!policy.can('read', subjectInvoice)) {
            return res.json({
                error: 1,
                message: 'You are not authorized to view this invoice.'
            })
        }
        
        
        return res.json(invoice);

    } catch (err) {
        console.error('Error retrieving invoice:', err);
        return res.json({
            error: 1,
            message: 'Failed to retrieve invoice.'
        });

    }
}

module.exports = {
    show
}