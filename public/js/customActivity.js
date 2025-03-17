'use strict';

define(function (require) {
    var Postmonger = require('postmonger');
    var connection = new Postmonger.Session();

    var payload = {};
    var authTokens = {};

    var eventDefinitionKey = null;
    var templateCode = null;
   
    var parameterList = null;
   
    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', requestedInteractionHandler);
    connection.on('clickedNext', save);

    /* [ Form Validate ] ================================================================== */

    // $('.validate-form .input100').each(function () {
    //     $(this).focus(function () {
    //         hideValidate(this);
    //     });
    // });

    // function showValidate(input) {
    //     var thisAlert = $(input).parent();
    //     $(thisAlert).addClass('alert-validate');
    // }

    // function hideValidate(input) {
    //     var thisAlert = $(input).parent();
    //     $(thisAlert).removeClass('alert-validate');
    // }

    // function validate_field(input) {
    //     if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
    //         if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
    //             return false;
    //         }
    //     }
    //     else {
    //         if ($(input).val().trim() == '' || $(input).val().trim() == 'conta de envio*') {
    //             return false;
    //         }
    //     }
    // }

    // function validate() {
    //     var input = $('.validate-input .input100');
    //     var check = true;
    //     for (var i = 0; i < input.length; i++) {
    //         if (validate_field(input[i]) == false) {
    //             showValidate(input[i]);
    //             check = false;
    //         }
    //     }
    //     return check;
    // }

    /* ![ Form Validate ] ================================================================== */

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');

        $('#toggleActive').click(function (evt) {
            evt.preventDefault(); // Evita o comportamento padrão do formulário

            document.getElementById('templateCode').disabled = true;
            templateCode = $('#templateCode').val();

            document.getElementById('toggleActive').disabled = true;
            document.getElementById('toggleActive').innerHTML = "Cadastrado";

            save(); // Chama a função save quando o botão é clicado
        });
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        // Inicializa a estrutura do payload, se não existir
        if (!payload['arguments']) {
            payload['arguments'] = {};
        }
        if (!payload['arguments'].execute) {
            payload['arguments'].execute = {};
        }
        if (!payload['metaData']) {
            payload['metaData'] = {};
        }

        templateCode = payload['arguments'].templateCode;
        if (templateCode) {
            document.getElementById('templateCode').disabled = true;
            document.getElementById('templateCode').value = templateCode;

            document.getElementById('toggleActive').disabled = true;
            document.getElementById('toggleActive').innerHTML = "Cadastrado";
        }
    }

    function onGetTokens(tokens) {
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        // console.log(endpoints);
    }

    function requestedInteractionHandler(settings) {
        try {
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
            document.getElementById('select-entryevent-defkey').value = eventDefinitionKey;
        } catch (err) {
            console.error('Erro ao obter eventDefinitionKey:', err);
        }
    }

    function save() {
        var title = $("#title").val();
        var message = $("#message").val();
        var mediaUrl = $("#mediaUrl").val();
        var navigationUrl = $("#navigationUrl").val();
        var userId = $("#userId").val();
        var templateCode = $("#templateCode").val();
        var businessUnit = $("input[name='businessUnit']:checked").val();

        // Debug statements
        console.log("Title: ", title);
        console.log("Message: ", message);
        console.log("Media URL: ", mediaUrl);
        console.log("Navigation URL: ", navigationUrl);
        console.log("User ID: ", userId);
        console.log("Template Code: ", templateCode);
        console.log("Business Unit: ", businessUnit);

        payload['arguments'].execute.inArguments = [{
            // "tokens": authTokens,
            "template": templateCode,
            "title": title,
            "message": message,
            "mediaUrl": mediaUrl,
            "url": navigationUrl,
            "vucCode": userId,
            "brand": businessUnit
        }];

        payload['metaData'].isConfigured = true;

        console.log('Payload completo:', JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }
});
