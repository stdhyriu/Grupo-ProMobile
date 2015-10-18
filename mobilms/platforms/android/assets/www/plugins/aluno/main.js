var templates = [
    "root/externallib/text!root/plugins/aluno/dados.html",
    "root/externallib/text!root/plugins/aluno/lang/pt_br.json"
];

define(templates,function (dadosTpl, langStrings) {
    var plugin = {
        settings: {
            name: "aluno",
            type: "general",
            menuURL: "#aluno",
            lang: {
                component: "local_start",
                strings: langStrings
            },
            icon: "plugins/aluno/icon.png"
        },
		
        routes: [
            ["aluno", "general_view_aluno", "showAluno"]
        ],

		showAluno: function() {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			// Adding loading icon.
            $('a[href="#aluno"]').addClass('loading-row');
			
            var data = {
                "dados[userid]" : MM.config.current_site.userid
            };
			
			MM.moodleWSextCall('local_start_get_user', data, function(contents) {
                // Removing loading icon.
                $('a[href="#aluno"]').removeClass('loading-row');
				
				var pageTitle = MM.lang.s("alunodados","aluno");
				
                var tpl = {
					retorno: contents
                }
                var html = MM.tpl.render(MM.plugins.aluno.templates.dados.html, tpl);
                MM.panels.show("center", html, {title: pageTitle});
				
				$("#form-aluno-update").on( "click", function() {
					MM.showModalLoading(MM.lang.s("saving","aluno"));
					
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[userid]" : MM.config.current_site.userid,
						"dados[firstname]" : $("#form-aluno-firstname").val(),
						"dados[lastname]" : $("#form-aluno-lastname").val(),
						"dados[email]" : $("#form-aluno-email").val(),
						"dados[passwordatual]" : $("#form-aluno-passwordatual").val(),
						"dados[password]" : $("#form-aluno-password").val(),
						"dados[password2]" : $("#form-aluno-password2").val()
					};
					
					if (($.trim($("#form-aluno-passwordatual").val()).length == 0) || ($.trim($("#form-aluno-password").val()).length == 0) || ($.trim($("#form-aluno-password2").val()).length == 0)){
						MM.popMessage("Atenção, informe o campo de senha corretamente.");
					}else{
					
						if ((($.trim($("#form-aluno-password").val()).length != 0) && ($.trim($("#form-aluno-password2").val()).length == 0)) ||
							(($.trim($("#form-aluno-password").val()).length == 0) && ($.trim($("#form-aluno-password2").val()).length != 0))){
							MM.popMessage("Atenção, informe o campo de senha corretamente.");
						}else{

							if ($.trim($("#form-aluno-password").val()) != $.trim($("#form-aluno-password2").val())){
								MM.popMessage("Atenção, senha de confirmação inválida.");
							}else{
								
								MM.moodleWSextCall('local_start_save_user', data, function(contents) {
									if (contents=="salvo"){
										MM.refresh(1);
										setTimeout(function(){
											MM.popMessage("Dados Salvos com sucesso");
											MM.panels.goBack();					
										}, 1500);
									}else if (contents=="senha"){
										MM.refresh(1);
										setTimeout(function(){
											MM.popMessage("Senha de confirmação inválida.");
										}, 1500);
									}else{
										setTimeout(function(){
											MM.popMessage("Senha atual incorreta.");
										}, 1500);
									}
								});
								
							}
						}
					}
				});
            }); 
        },

        templates: {
            "dados": {
                html: dadosTpl
            }
        }
    }

    MM.registerPlugin(plugin);
});