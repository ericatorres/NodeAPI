const mysql = require('../mysql');

exports.getPedidos = async (req, res, next) => {
    try {
        const result = await mysql.execute('SELECT * FROM pedidos INNER JOIN produtos ON produtos.id_Produto = pedidos.id_Produto;');
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
    } catch (error) {
        return res.status(500).send({error: error})
    }
};

exports.postPedidos = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM produtos WHERE id_Produto = ?;';
        let result = await mysql.execute(query, [req.body.id_produto]);
        if(result.length == 0){
            return res.status(404).send({
                mensagem: 'Produto não encontrado'
            })
        }else {
            query = 'INSERT INTO pedidos (id_Produto, Quantidade) VALUES (?, ?);';
            result = await mysql.execute(query, [
                req.body.id_produto, 
                req.body.quantidade
            ]);
            const response = {
                mensagem: 'Pedido inserido com sucesso',
                pedidoCriado : {
                    id_pedido: result.insertId,
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
    } catch (error) {
        return res.status(500).send({error: error})
    }
};

exports.getUmPedido = async (req, res, next) => {
    try {
        const query = `SELECT * FROM pedidos 
                        INNER JOIN produtos ON produtos.id_Produto = pedidos.id_Produto 
                        WHERE id_Pedido = ?;
                        `
        const result = await mysql.execute(query, [req.params.id_pedido]);
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
    } catch (error) {
        return res.status(500).send({error: error})
    }
};

exports.deletePedido = async (req, res, next) => {
    try {
        const query = 'DELETE FROM pedidos WHERE id_Pedido = ?;';
        await mysql.execute(query, [req.body.id_pedido]);
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
    } catch (error) {
        return res.status(500).send({error: error})
    }
};