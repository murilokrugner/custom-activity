'use strict';

// Importa módulos necessários
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js')); // Para decodificar tokens JWT
const util = require('util'); // Para inspeção de objetos (debug)
const axios = require('axios'); // Para fazer requisições HTTP

// Array para armazenar logs de execução (usado para debug ou exibição no index.js)
exports.logExecuteData = [];

// Função para logar dados detalhados de uma requisição (usada para debug)
function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });

    // Exibe informações detalhadas da requisição no console
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + util.inspect(req.headers));
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

// Endpoint para lidar com solicitações de edição
exports.edit = function (req, res) {
    console.log('edit request');
    logData(req);
    res.send(200, 'Edit');
};

// Endpoint para salvar a configuração da atividade
exports.save = function (req, res) {
    console.log('save request');
    logData(req);
    console.log('Dados enviados pela UI:', JSON.stringify(req.body));
    res.send(200, 'Save');
};

// Endpoint para executar a atividade (envia notificação ao app do cliente via middleware)
exports.execute = function (req, res) {
    logData(req);
    console.log('execute request:', JSON.stringify(req.body));

    // Valida o token JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Erro ao validar JWT:', err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];
            console.log('inArguments:', JSON.stringify(decoded.inArguments));

            const payload = {
                template: decodedArgs['template'],
                title: decodedArgs['title'],
                message: decodedArgs['message'],
                mediaUrl: decodedArgs['mediaUrl'],
                url: decodedArgs['url'],
                vucCode: decodedArgs['vucCode'], // vucCode vindo da jornada
                brand: decodedArgs['brand']
            };

            console.log('Payload enviado ao middleware:', JSON.stringify(payload));

            
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MIDDLEWARE_AUTH_TOKEN}` // Substitua por token do middleware
            };

            // Envia a notificação ao middleware (endpoint genérico, substitua pelo real)
            axios.post('https://api-rd-internal-stg.raiadrogasil.io/v1/api/msatomjavacommunication/custom-messaging', payload, { headers: headers })
                .then((response) => {
                    console.log('Notificação enviada com sucesso ao app do cliente');
                    res.send(200, 'Execute');
                })
                .catch((err) => {
                    console.error('Erro ao enviar notificação ao middleware:', err);
                    res.status(500).send('Erro ao enviar notificação');
                });
        } else {
            console.error('inArguments inválidos.');
            return res.status(400).end();
        }
    });
};

// Endpoint para publicar a atividade
exports.publish = function (req, res) {
    console.log('publish request');
    logData(req);
    res.send(200, 'Publish');
};

// Endpoint para validar a atividade
exports.validate = function (req, res) {
    console.log('validate request');
    logData(req);
    res.send(200, 'Validate');
};