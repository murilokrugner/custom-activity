(function () {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var schemaDE = [];
    var dataDE = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedSchema', requestedSchema);
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestSchema');
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [];

        inArguments.forEach(function (args) {
            if (args.template) {
                $('#template').val(args.template);
            }
            if (args.title) {
                $('#title').val(args.title);
            }
            if (args.message) {
                $('#message').val(args.message);
            }
            if (args.mediaUrl) {
                $('#mediaUrl').val(args.mediaUrl);
            }
            if (args.url) {
                $('#url').val(args.url);
            }
            if (args.vucCode) {
                $('#vucCode').val(args.vucCode);
            }
            if (args.vucCodeField) {
                $('#vucCodeField').val(args.vucCodeField);
            }
            if (args.brand) {
                $('#brand').val(args.brand);
            }
        });

        $('#saveButton').click(function () {
            connection.trigger('clickedNext');
        });
    }

    function requestedSchema(data) {
        if (data.error) {
            console.error('requestedSchema Error:', data.error);
        } else {
            schemaDE = data['schema'];
            console.log('Schema da Data Extension:', schemaDE);
        }

        // Limpa a lista suspensa antes de preenchê-la
        $('#vucCodeField').empty();
        $('#vucCodeField').append('<option value="">Selecione um campo da Data Extension</option>');

        // Preenche a lista suspensa com os campos da Data Extension
        for (var i in schemaDE) {
            var name = schemaDE[i].name;
            if (name) {
                // Adiciona cada campo como uma opção na lista suspensa
                $('#vucCodeField').append(`<option value="${name}">${name}</option>`);
                // Armazena o nome do campo e sua chave para uso posterior
                dataDE[name] = `{{${schemaDE[i].key}}}`;
            }
        }
    }

    function save() {
        var template = $('#template').val();
        var title = $('#title').val();
        var message = $('#message').val();
        var mediaUrl = $('#mediaUrl').val();
        var url = $('#url').val();
        var vucCode = $('#vucCode').val(); // vucCode unitário
        var vucCodeField = $('#vucCodeField').val(); // Campo selecionado da DE
        var brand = $('#brand').val();

        // Validação básica
        if (!template || !title || !message || !brand) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            connection.trigger('updateButton', { button: 'next', enabled: false });
            return;
        }

        // Monta os argumentos que serão enviados ao activity.js
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};
        payload['arguments'].execute.inArguments = [{
            "template": template,
            "title": title,
            "message": message,
            "mediaUrl": mediaUrl,
            "url": url,
            "vucCode": vucCode, // Mantém o vucCode unitário
            "vucCodeField": vucCodeField, // Adiciona o campo selecionado da DE
            "brand": brand
        }];

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }
})();