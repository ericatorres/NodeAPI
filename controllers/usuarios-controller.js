const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.cadastroUsuario = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM usuarios WHERE email like ?';
        let result = await mysql.execute(query, [req.body.email]);
        if(result.length > 0) {
            return res.status(409).send({mensagem: 'Email já cadastrado'})
        } 
        else {
            bcrypt.hash(req.body.senha, 10, async (errBcrypt, hash) => {
                if(errBcrypt) { 
                    return res.status(500).send({error: errBcrypt})
                };
                query = `INSERT INTO usuarios (email, senha) VALUES (?, ?);`;
                result = await mysql.execute(query, [req.body.email, hash]);
                const response = {
                    mensagem: 'Usuário criado com sucesso',
                    usuarioCriado: {
                        id_usuario: result.insertId,
                        email: req.body.email
                    }
                }
                return res.status(201).send(response)
            })
        }
    } catch (error) {
        return res.status(500).send({error: error})
    }
};

exports.loginUsuario = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM usuarios WHERE email like ?';
        const result = await mysql.execute(query, [req.body.email]);
        
        if (result.length < 1) {
            return res.status(401).send({ message: 'Falha na autenticação' })
        }
        if (await bcrypt.compareSync(req.body.senha, result[0].senha)) {
            const token = jwt.sign({
                id_usuario: result[0].id_usuario,
                email: result[0].email
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            });
            return res.status(200).send({
                message: 'Autenticado com sucesso',
                token: token
            });
        }
        return res.status(401).send({ message: 'Falha na autenticação' })
    } catch (error) {
        return res.status(500).send({ message: 'Falha na autenticação' });
    }
};