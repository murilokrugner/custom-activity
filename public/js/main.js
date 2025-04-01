"use strict";

requirejs.config({
  paths: {
    postmonger: "postmonger",
  },
  shim: {
    "jquery.min": {
      exports: "$",
    },
    "./customActivity": {
      deps: ["jquery.min", "postmonger"],
    },
  },
});

requirejs(["jquery.min", "./customActivity"], function ($, customEvent) {
  // Validação do formulário ao ser enviado
  $("#notificationForm").on("submit", function (event) {
    const titleInput = $("#title");
    const titleValue = titleInput.val().trim();

    // Verifica se a primeira letra do título é maiúscula
    if (
      titleValue.length > 0 &&
      titleValue[0] !== titleValue[0].toUpperCase()
    ) {
      titleInput[0].setCustomValidity(
        "A primeira letra do título deve ser maiúscula."
      );
      titleInput[0].reportValidity();
      event.preventDefault();
    } else {
      titleInput[0].setCustomValidity(""); // Limpa a mensagem de erro
    }

    // Validação da URL da Mídia
    const mediaUrl = $("#mediaUrl").val().trim();
    if (mediaUrl && !mediaUrl.startsWith("https://")) {
      $("#mediaUrl")[0].setCustomValidity("A URL deve começar com https://");
      $("#mediaUrl")[0].reportValidity();
      event.preventDefault();
    }

    // Validação da URL de Navegação
    const navigationUrl = $("#navigationUrl").val().trim();
    if (navigationUrl && !navigationUrl.startsWith("https://")) {
      $("#navigationUrl")[0].setCustomValidity(
        "A URL deve começar com https://"
      );
      $("#navigationUrl")[0].reportValidity();
      event.preventDefault();
    }
  });

  // Pré-visualização da URL da Mídia ao passar o mouse
  $("#mediaUrl").on("input", function () {
    const mediaUrl = $(this).val(); // Obtém a URL da mídia
    const mediaPreview = $("#mediaPreview");
    const mediaPreviewContainer = $("#mediaPreviewContainer");

    // Verifica se a URL é válida e começa com https://
    if (mediaUrl && mediaUrl.startsWith("https://")) {
      mediaPreview.attr("src", mediaUrl); // Atualiza a fonte da imagem
      mediaPreviewContainer.show(); // Mostra o contêiner da prévia
    } else {
      mediaPreviewContainer.hide(); // Esconde a prévia se a URL não for válida
    }
  });

  // Exibir prévia ao passar o mouse sobre o campo de URL da Mídia
  $("#mediaUrl").on("mouseenter", function () {
    const mediaUrl = $(this).val();

    // Verifica se a URL é válida e começa com https://
    if (mediaUrl && mediaUrl.startsWith("https://")) {
      $("#mediaPreview").attr("src", mediaUrl); // Atualiza a fonte da imagem
      $("#mediaPreviewContainer").show(); // Mostra o contêiner da prévia
    }
  });

  // Esconder prévia ao sair com o mouse do campo de URL da Mídia
  $("#mediaUrl").on("mouseleave", function () {
    $("#mediaPreviewContainer").hide(); // Esconde a prévia
  });
});

requirejs.onError = function (err) {
  if (err.requireType === "timeout") {
    console.log("modules: " + err.requireModules);
  }
  throw err;
};
