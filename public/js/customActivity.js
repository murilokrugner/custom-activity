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
            if (args.businessUnit) {
                $(`input[name="businessUnit"][value="${args.businessUnit}"]`).prop('checked', true);
            }
        });

        // Adiciona o evento de clique no botão "Cadastrar"
        $('#toggleActive').click(function (e) {
            e.preventDefault();
            save();
        });
    }

    function requestedSchema(data) {
        if (data.error) {
            console.error('requestedSchema Error:', data.error);
        } else {
            schemaDE = data['schema'];
            console.log('Schema da Data Extension:', JSON.stringify(schemaDE));
        }

        // Limpa a lista suspensa antes de preenchê-la
        $('#vucCodeField').empty();
        $('#vucCodeField').append('<option value="">Selecione um campo da Data Extension</option>');

        // Preenche a lista suspensa com os campos da Data Extension
        for (var i in schemaDE) {
            var field = schemaDE[i];
            var name = field.name;
            var key = field.key;
            if (name && key) {
                console.log(`Adicionando campo à lista suspensa: name=${name}, key=${key}`);
                $('#vucCodeField').append(`<option value="${name}">${name}</option>`);
                dataDE[name] = `{{${key}}}`; // Armazena o formato completo (ex.: {{Event.DEAudience-123.vucCode}})
            }
        }

        console.log('dataDE após preenchimento:', JSON.stringify(dataDE));
    }

    function save() {
        var template = $('#template').val();
        var title = $('#title').val();
        var message = $('#message').val();
        var mediaUrl = $('#mediaUrl').val();
        var url = $('#url').val();
        var vucCode = $('#vucCode').val();
        var vucCodeField = $('#vucCodeField').val();
        var businessUnit = $('input[name="businessUnit"]:checked').val();

        // Validação básica
        if (!template || !title || !message || !businessUnit) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            connection.trigger('updateButton', { button: 'next', enabled: false });
            return;
        }

        // Log para depurar o valor selecionado
        console.log('Valor selecionado no vucCodeField:', vucCodeField);
        console.log('Valor correspondente no dataDE:', vucCodeField ? dataDE[vucCodeField] : 'N/A');

        // Monta os argumentos que serão enviados ao activity.js
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};
        payload['arguments'].execute.inArguments = [{
            "template": template,
            "title": title,
            "message": message,
            "mediaUrl": mediaUrl,
            "url": url,
            "vucCode": vucCode,
            "vucCodeField": vucCodeField ? dataDE[vucCodeField] : "", // Salva no formato {{Event.DEAudience-123.vucCode}}
            "businessUnit": businessUnit
        }];

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;

        console.log('Salvando payload:', JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }
})();