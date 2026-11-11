import { adminRequired } from "../../middlewares/validateToken.js";
import { Router } from "express";
import { addPaymentType,deletePaymentType,getPaymentTypes,getPaymentTypeById,getPaymetnTypesDropdown,updatePaymentType } from "../../controllers/api_controllers/payment_type.controller.js";
const router = Router();

router.get('/payment-type/:id', adminRequired, getPaymentTypeById);
router.post('/payment-types', adminRequired, getPaymentTypes);
router.get('/payment-type-dropdown', getPaymetnTypesDropdown);
router.post('/payment-type', adminRequired, addPaymentType);
router.put('/payment-type/:id', adminRequired, updatePaymentType);
router.delete('/payment-type/:id', adminRequired, deletePaymentType);

export default router;
