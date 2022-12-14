const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const ProdutosController = require('../controllers/produtos-controller')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname );
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'|| file.mimetype === 'image/jpg'){
        cb(null, true);
    }else {
        cb(null, false)
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 //5mb
    },
    fileFilter: fileFilter
});

router.get('/', ProdutosController.getProduto);
router.post('/', login.obrigatorio, upload.single('imagem_produto'), ProdutosController.postProduto);
router.get('/:id_produto', ProdutosController.getUmProduto);
router.patch('/', login.obrigatorio, ProdutosController.patchProduto);
router.delete('/', login.obrigatorio, ProdutosController.deleteProduto);

module.exports = router;