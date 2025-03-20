'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var http = require('http');
var path = require('path');
var routes = require('./routes');

var app = express();

// Define a porta para o ambiente de produção ou 3000 como padrão
app.set('port', process.env.PORT || 3000);

// Configura o parser de corpo JWT (necessário para o Journey Builder)
app.use(bodyParser.raw({ type: 'application/jwt' }));

// Serve arquivos estáticos da pasta public (UI e JS)
app.use(express.static(path.join(__dirname, 'public')));

// Habilita errorhandler apenas no ambiente de desenvolvimento
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// Integra as rotas definidas em routes/index.js
app.use('/', routes);

// Inicia o servidor HTTP
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});