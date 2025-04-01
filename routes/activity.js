"use strict";

// Importa módulos necessários
const Path = require("path");
const JWT = require(Path.join(__dirname, "..", "lib", "jwtDecoder.js")); // Para decodificar tokens JWT
const util = require("util"); // Para inspeção de objetos (debug)
const axios = require("axios"); // Para fazer requisições HTTP

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
    originalUrl: req.originalUrl,
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
  console.log("edit request");
  logData(req);
  res.send(200, "Edit");
};

// Endpoint para salvar a configuração da atividade
exports.save = function (req, res) {
  console.log("save request");
  logData(req);
  console.log("Dados enviados pela UI:", JSON.stringify(req.body));
  res.send(200, "Save");
};

// Endpoint para executar a atividade (envia notificação ao app do cliente via middleware)
exports.execute = function (req, res) {
  logData(req);
  const teste =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0ODUxNDA5ODQsImlhdCI6MTQ4NTEzNzM4NCwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIyOWFjMGMxOC0wYjRhLTQyY2YtODJmYy0wM2Q1NzAzMThhMWQiLCJhcHBsaWNhdGlvbklkIjoiNzkxMDM3MzQtOTdhYi00ZDFhLWFmMzctZTAwNmQwNWQyOTUyIiwicm9sZXMiOltdfQ.Mp0Pcwsz5VECK11Kf2ZZNF_SMKu5CgBeLN9ZOP04kZo";
  // Valida o token JWT

  JWT(req.body, teste, (err, decoded) => {
    if (err) {
      console.error("Erro ao validar JWT:", err);
      return res.status(401).end();
    }

    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
      var decodedArgs = decoded.inArguments[0];
      const payload = {
        template: decodedArgs["template"],
        title: decodedArgs["title"],
        message: decodedArgs["message"],
        mediaUrl: decodedArgs["mediaUrl"],
        url: decodedArgs["url"],
        vucCode: decodedArgs["vucCode"], // vucCode vindo da jornada
        brand: decodedArgs["brand"],
      };

      const MIDDLEWARE_AUTH_TOKEN = "cmQtc3RnOnNlbnNlZGlh";

      const headers = {
        "Content-Type": "application/json",
        Authorization: `basic ${MIDDLEWARE_AUTH_TOKEN}`, // Substitua por token do middleware
      };

      // Envia a notificação ao middleware (endpoint genérico, substitua pelo real)
      axios
        .post(
          "https://api-rd-internal-stg.raiadrogasil.io/v1/api/msatomjavacommunication/custom-messaging/api/notifications",
          payload,
          { headers: headers }
        )
        .then((response) => {
          console.log("Notificação enviada com sucesso ao app do cliente");
          res.send(200, "Execute");
        })
        .catch((err) => {
          console.error("Erro ao enviar notificação ao middleware:", err);
          res.status(500).send("Erro ao enviar notificação");
        });
    } else {
      console.error("inArguments inválidos.");
      return res.status(400).end();
    }
  });
};

// Endpoint para publicar a atividade
exports.publish = function (req, res) {
  console.log("publish request");
  logData(req);
  res.send(200, "Publish");
};

// Endpoint para validar a atividade
exports.validate = function (req, res) {
  console.log("validate request");
  logData(req);
  res.send(200, "Validate");
};
