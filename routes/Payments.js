const express = require("express")
const router = express.Router();

const {capturePayment,verifySignature} = require("./../controllers/Payments");

router.post("/capturePayment",capturePayment);
router.post("/verifySignature",verifySignature);

module.exports = router;

// const { capturePayment, verifySignature,sendPaymentSuccessEmail } = require("../controllers/Payments")
// const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
// router.post("/capturePayment", auth, isStudent, capturePayment)
// router.post("/verifyPayment",auth,verifySignature)
// router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail)

// module.exports = router;