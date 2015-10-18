var templates = [
    "root/externallib/text!root/plugins/ajuda/dados.html",
    "root/externallib/text!root/plugins/ajuda/lang/pt_br.json"
];

define(templates,function (dadosTpl, langStrings) {
    var plugin = {
        settings: {
            name: "ajuda",
            type: "settings",
            menuURL: "#ajuda",
            lang: {
                component: "local_start",
                strings: langStrings
            },
            icon: "plugins/ajuda/icon.png"
        },
		
        routes: [
            ["ajuda", "general_view_ajuda", "showAjuda"]
        ],

		showAjuda: function() {
            userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			var pageTitle = MM.lang.s("titulo","ajuda");
				
			var tpl = {
				retorno: 0
			}
			var html = MM.tpl.render(MM.plugins.ajuda.templates.dados.html, tpl);
			MM.panels.show("center", html, {title: pageTitle});
				
        },

        templates: {
            "dados": {
                html: dadosTpl
            }
        }
    }

    MM.registerPlugin(plugin);
});