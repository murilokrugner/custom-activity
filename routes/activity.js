'use strict';

const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
const util = require('util');
const axios = require('axios');

exports.logExecuteData = [];

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

exports.edit = function (req, res) {
    console.log('edit request');
    logData(req);
    res.status(200).send('Edit');
};

exports.save = function (req, res) {
    console.log('save request');
    logData(req);
    console.log('Dados enviados pela UI:', JSON.stringify(req.body));
    res.status(200).send('Save');
};

exports.execute = function (req, res) {
    logData(req);
    console.log('execute request:', JSON.stringify(req.body));

    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Erro ao validar JWT:', err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];
            console.log('inArguments:', JSON.stringify(decoded.inArguments));

            // Log adicional para inspecionar todas as chaves disponíveis no decodedArgs
            console.log('Todas as chaves do decodedArgs:', Object.keys(decodedArgs));

            // Determina o vucCode a ser usado
            let vucCode;

            // Prioridade 1: Usa o campo da Data Extension, se selecionado
            if (decodedArgs['vucCodeField']) {
                // Extrai o nome do campo do formato {{Event.DEAudience-123.vucCode}}
                const vucCodeField = decodedArgs['vucCodeField'].match(/\.([^.]+)\}\}$/);
                const fieldName = vucCodeField ? vucCodeField[1] : decodedArgs['vucCodeField'];
                console.log(`Tentando acessar o campo da DE: ${fieldName}`);

                // Verifica se o campo existe no decodedArgs
                if (fieldName in decodedArgs) {
                    vucCode = decodedArgs[fieldName];
                    console.log(`Usando vucCode da Data Extension (campo ${fieldName}): ${vucCode}`);
                } else {
                    console.error(`Campo ${fieldName} não encontrado no decodedArgs. Chaves disponíveis:`, Object.keys(decodedArgs));
                }
            }

            // Prioridade 2: Usa o vucCode unitário, se preenchido
            // *** INÍCIO DA LÓGICA DO VUCCODE UNITÁRIO ***
            if (!vucCode && decodedArgs['vucCode']) {
                vucCode = decodedArgs['vucCode'];
                console.log(`Usando vucCode unitário: ${vucCode}`);
            }
            // *** FIM DA LÓGICA DO VUCCODE UNITÁRIO ***

            // Validação: Garante que o vucCode esteja presente
            if (!vucCode) {
                console.error('vucCode não encontrado. Selecione um campo da Data Extension ou insira um vucCode unitário.');
                return res.status(400).send('vucCode é obrigatório.');
            }

            const payload = {
                template: decodedArgs['template'],
                title: decodedArgs['title'],
                message: decodedArgs['message'],
                mediaUrl: decodedArgs['mediaUrl'],
                url: decodedArgs['url'],
                vucCode: vucCode,
                businessUnit: decodedArgs['businessUnit']
            };

            console.log('Payload enviado ao middleware:', JSON.stringify(payload));

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MIDDLEWARE_AUTH_TOKEN}`
            };

            // Responde imediatamente ao Journey Builder
            res.status(200).send('Execute');

            // Envia a notificação ao middleware em segundo plano
            axios.post('https://api-rd-internal-stg.raiadrogasil.io/v1/api/msatomjavacommunication/custom-messaging', payload, { 
                headers: headers,
                timeout: 10000
            })
                .then((response) => {
                    console.log('Notificação enviada com sucesso ao app do cliente');
                })
                .catch((err) => {
                    console.error('Erro ao enviar notificação ao middleware:', err.message);
                });
        } else {
            console.error('inArguments inválidos.');
            return res.status(400).end();
        }
    });
};

exports.publish = function (req, res) {
    console.log('publish request');
    logData(req);
    res.status(200).send('Publish');
};

exports.validate = function (req, res) {
    console.log('validate request');
    logData(req);
    res.status(200).send('Validate');
};