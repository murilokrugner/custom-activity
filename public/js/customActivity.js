'use strict';

// Define o módulo usando RequireJS, carregando a biblioteca Postmonger
define(function (require) {
    // Importa a biblioteca Postmonger para comunicação com o Journey Builder
    var Postmonger = require('postmonger');
    // Cria uma nova sessão Postmonger para gerenciar eventos e mensagens
    var connection = new Postmonger.Session();

    // Objeto que armazenará a configuração da atividade (payload)
    var payload = {};
    // Armazena os tokens de autenticação recebidos do Journey Builder
    var authTokens = {};

    // Variáveis globais para armazenar dados específicos
    var eventDefinitionKey = null; // Armazena a chave do evento de entrada
    var templateCode = null; // Armazena o código do template selecionado

    // Inicializa a função quando a janela estiver pronta
    $(window).ready(onRender);

    // Registra os eventos do Postmonger que a UI vai escutar
    connection.on('initActivity', initialize); // Inicializa a atividade com dados existentes
    connection.on('requestedTokens', onGetTokens); // Recebe os tokens de autenticação
    connection.on('requestedEndpoints', onGetEndpoints); // Recebe os endpoints do Journey Builder
    connection.on('requestedInteraction', requestedInteractionHandler); // Recebe a interação da jornada
    connection.on('clickedNext', save); // Salva a configuração quando o usuário clica em "Próximo"

    // Função chamada quando a UI é renderizada
    function onRender() {
        // Informa ao Journey Builder que a UI está pronta
        connection.trigger('ready');
        // Solicita os tokens de autenticação
        connection.trigger('requestTokens');
        // Solicita os endpoints disponíveis
        connection.trigger('requestEndpoints');
        // Solicita as interações da jornada
        connection.trigger('requestInteraction');

        // Adiciona um evento de clique ao botão "Cadastrar"
        $('#toggleActive').click(function (evt) {
            // Impede o comportamento padrão do formulário (recarregamento)
            evt.preventDefault();

            // Desabilita o campo de template para evitar edições após o cadastro
            document.getElementById('templateCode').disabled = true;
            // Armazena o valor do template selecionado
            templateCode = $('#templateCode').val();

            // Desabilita o botão e muda o texto para "Cadastrado"
            document.getElementById('toggleActive').disabled = true;
            document.getElementById('toggleActive').innerHTML = "Cadastrado";

            // Chama a função para salvar os dados
            save();
        });
    }

    // Função chamada para inicializar a atividade com dados existentes
    function initialize(data) {
        // Atualiza o payload com os dados recebidos, se houver
        if (data) {
            payload = data;
        }

        // Inicializa a estrutura do payload se não existir
        if (!payload['arguments']) {
            payload['arguments'] = {};
        }
        if (!payload['arguments'].execute) {
            payload['arguments'].execute = {};
        }
        if (!payload['metaData']) {
            payload['metaData'] = {};
        }

        // Carrega dados existentes do payload, se disponíveis
        if (payload['arguments'].execute.inArguments && payload['arguments'].execute.inArguments.length > 0) {
            var args = payload['arguments'].execute.inArguments[0];
            $('#title').val(args.title || ''); // Preenche o campo título
            $('#message').val(args.message || ''); // Preenche o campo mensagem
            $('#mediaUrl').val(args.mediaUrl || ''); // Preenche o campo URL da mídia
            $('#navigationUrl').val(args.url || ''); // Preenche o campo URL de navegação
            $('#userId').val(args.vucCode || ''); // Preenche o campo ID do usuário com vucCode da jornada
            $('#templateCode').val(args.template || ''); // Preenche o campo template
            $('input[name="businessUnit"][value="' + (args.brand || '') + '"]').prop('checked', true); // Seleciona a bandeira

            // Se já houver um template, desabilita o campo e o botão
            if (args.template) {
                document.getElementById('templateCode').disabled = true;
                document.getElementById('toggleActive').disabled = true;
                document.getElementById('toggleActive').innerHTML = "Cadastrado";
            }
        }
    }

    // Função chamada quando os tokens de autenticação são recebidos
    function onGetTokens(tokens) {
        authTokens = tokens; // Armazena os tokens recebidos
    }

    // Função chamada quando os endpoints são recebidos
    function onGetEndpoints(endpoints) {
        console.log('Endpoints:', endpoints); // Loga os endpoints para debug
    }

    // Função chamada quando a interação da jornada é recebida
    function requestedInteractionHandler(settings) {
        try {
            // Tenta obter a chave do evento de entrada
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
            document.getElementById('select-entryevent-defkey').value = eventDefinitionKey;
        } catch (err) {
            console.error('Erro ao obter eventDefinitionKey:', err); // Loga erros, se houver
        }
    }

    // Função para salvar a configuração da atividade
    function save() {
        // Captura os valores dos campos do formulário
        var title = $("#title").val();
        var message = $("#message").val();
        var mediaUrl = $("#mediaUrl").val();
        var navigationUrl = $("#navigationUrl").val();
        var userId = $("#userId").val(); // Usará o vucCode da jornada, se fornecido
        var templateCode = $("#templateCode").val();
        var businessUnit = $("input[name='businessUnit']:checked").val();

        // Exibe os valores capturados no console para debug
        console.log("Title:", title);
        console.log("Message:", message);
        console.log("Media URL:", mediaUrl);
        console.log("Navigation URL:", navigationUrl);
        console.log("User ID (vucCode):", userId);
        console.log("Template Code:", templateCode);
        console.log("Business Unit:", businessUnit);

        // Garante que a estrutura do payload esteja correta antes de usar
        if (!payload['arguments']) {
            payload['arguments'] = {};
        }
        if (!payload['arguments'].execute) {
            payload['arguments'].execute = {};
        }
        if (!payload['metaData']) {
            payload['metaData'] = {};
        }

        // Define os argumentos de entrada no payload
        payload['arguments'].execute.inArguments = [{
            "template": templateCode,
            "title": title,
            "message": message,
            "mediaUrl": mediaUrl,
            "url": navigationUrl,
            "vucCode": userId, // vucCode vindo da jornada ou do campo userId
            "brand": businessUnit
        }];

        // Marca a atividade como configurada
        payload['metaData'].isConfigured = true;

        // Exibe o payload completo no console para debug
        console.log('Payload completo:', JSON.stringify(payload));
        // Envia o payload atualizado para o Journey Builder
        connection.trigger('updateActivity', payload);
    }
});