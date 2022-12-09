const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Todos os produtos'
    });
});

router.post('/', (req, res, next) => {
    const produto ={
        nome: req.body.nome,
        preco: req.body.preco
    }
    res.status(201).send({
        mensagem: 'Produto inserido',
        produtoCriado: produto
    });
});

router.get('/:id_produto', (req, res, next) => {
    const id = req.params.id_produto;
    
    if(id === 'especial'){
        res.status(200).send({
            mensagem: 'Você usou o ID especial',
            id: id
        });
    }else {
        res.status(200).send({
            mensagem: 'Você usou um ID',
            id: id
        });
    }
});

router.patch('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Produto alterado'
    });
});

router.delete('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Produto excluído'
    });
});

module.exports = router;