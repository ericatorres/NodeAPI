const express = require('express');
const router = express.Router();
const mysql  = require('../mysql').pool;
const multer = require('multer');

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
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
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

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};

        conn.query(
            'SELECT * FROM PRODUTOS;',
            (error, result, fields) => {
                if(error) { return res.status(500).send({error: error})};
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id_Produto,
                            nome: prod.nome,
                            preco: prod.preco,
                            imagem_produto: prod.imagem_produto,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um produto específico',
                                url: 'http://localhost:3000/produtos/' + prod.id_Produto
                            }
                        }
                    })
                }
                return res.status(200).send({response})
            }
        );
    });
});

router.post('/', upload.single('imagem_produto'), (req, res, next) => {
    console.log(req.file);
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};
        conn.query(
            'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?, ?, ?)',
            [req.body.nome, req.body.preco, req.file.path],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({error: error})};
                const response = {
                    mensagem: 'Produto inserido com sucesso',
                    produtoCriado : {
                        id_produto: result.id_Produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        imagem_produto: req.file.path,
                        request: {
                            tipo: 'POST',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos/'
                        }
                    }
                }
                return res.status(201).send(response);
            }
        );
    });
});

router.get('/:id_produto', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};

        conn.query(
            'SELECT * FROM PRODUTOS WHERE id_produto = ?;',
            [req.params.id_produto],
            (error, result, fields) => {
                if(error) { return res.status(500).send({error: error})};

                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado produto com esse id'
                    })
                }

                const response = {
                    produto: {
                        id_produto: result[0].id_Produto,
                        nome: result[0].nome,
                        preco: result[0].preco,
                        imagem_produto: result[0].imagem_produto,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos/'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        );
    });
});

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};

        conn.query(
            `UPDATE produtos 
            SET nome = ?,
                preco = ?
            WHERE id_Produto = ?;`,
            [req.body.nome, req.body.preco, req.body.id_Produto],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({error: error})};
                const response = {
                    mensagem: 'Produto atualizado com sucesso',
                    produtoAtualizado : {
                        id_produto: req.body.id_Produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'POST',
                            descricao: 'Retorna os detalhes de um produto específico',
                            url: 'http://localhost:3000/produtos/' + req.body.id_Produto
                        }
                    }
                }
                return res.status(202).send(response);
            }
        );
    });
});

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};

        conn.query(
            'DELETE FROM produtos WHERE id_Produto = ?;',
            [req.body.id_Produto],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({error: error})};
                const response = {
                    mensagem: 'Produto removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere um produto',
                        url: 'http://localhost:3000/produtos',
                        body: {
                            nome: 'String',
                            preco: 'number'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        );
    });
});

module.exports = router;