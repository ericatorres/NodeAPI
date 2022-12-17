const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};
        conn.query(
            'SELECT * FROM pedidos INNER JOIN produtos ON produtos.id_Produto = pedidos.id_Produto',
            (error, result, fields) => {
                if(error) { return res.status(500).send({error: error})};
                const response = {
                    quantidade: result.length,
                    pedidos: result.map(ped => {
                        return {
                            id_pedido: ped.id_Pedido,                            
                            produto: {
                                id_produto: ped.id_Produto,
                                nome: ped.nome,
                                preco: ped.preco
                            },
                            quantidade: ped.Quantidade,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um pedido específico',
                                url: 'http://localhost:3000/'+ ped.id_Pedido
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    })
});

router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};
        conn.query(
            'SELECT * FROM produtos WHERE id_Produto = ?;',
            [req.body.id_produto],
            (error, result, field) => {
                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'Produto não encontrado'
                    })
                }
                conn.query(
                    'INSERT INTO pedidos (id_Produto, Quantidade) VALUES (?, ?)',
                    [req.body.id_produto, req.body.quantidade],
                    (error, result, field) => {
                        conn.release();
                        if(error) { return res.status(500).send({error: error})};                        
                        const response = {
                            mensagem: 'Pedido inserido com sucesso',
                            pedidoCriado : {
                                id_pedido: result.id_Pedido,
                                id_produto: req.body.id_produto,
                                quantidade: req.body.quantidade,
                                request: {
                                    tipo: 'POST',
                                    descricao: 'Retorna todos os pedidos',
                                    url: 'http://localhost:3000/pedidos/'
                                }
                            }
                        }
                        return res.status(201).send(response);
                    }
                );
            }
        )
    });
});

router.get('/:id_pedido', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};

        conn.query(
            `
            SELECT * FROM pedidos 
            INNER JOIN produtos ON produtos.id_Produto = pedidos.id_Produto 
            WHERE id_Pedido = ?;
            `,
            [req.params.id_pedido],
            (error, result, fields) => {
                if(error) { return res.status(500).send({error: error})};

                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado pedido com esse id'
                    })
                }

                const response = {
                    pedido: {
                        id_Pedido: result[0].id_Pedido,
                        id_Produto: result[0].id_Produto,
                        nome: result[0].nome,
                        precoUnitario: result[0].preco,
                        quantidade: result[0].Quantidade,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/pedidos/'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        );
    });
});

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error: error})};

        conn.query(
            'DELETE FROM pedidos WHERE id_Pedido = ?;',
            [req.body.id_pedido],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({error: error})};
                const response = {
                    mensagem: 'Pedido removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere um pedido',
                        url: 'http://localhost:3000/pedidos',
                        body: {
                            id_produto: 'int',
                            quantidade: 'int'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        );
    });
});

module.exports = router;