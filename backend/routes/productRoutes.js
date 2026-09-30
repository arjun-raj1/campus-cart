const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/add', upload.single("image"), productController.addProduct); // Original endpoint was /add-product, we can alias it
router.delete('/:id', productController.deleteProduct);

module.exports = router;
