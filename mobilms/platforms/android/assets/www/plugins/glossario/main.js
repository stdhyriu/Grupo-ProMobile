var templates = [
    "root/externallib/text!root/plugins/glossario/dados.html",
    "root/externallib/text!root/plugins/glossario/glossario.html",
    "root/externallib/text!root/plugins/glossario/glossariopadrao.html",
    "root/externallib/text!root/plugins/glossario/categoria.html",
    "root/externallib/text!root/plugins/glossario/meusitens.html",
    "root/externallib/text!root/plugins/glossario/editar.html",
    "root/externallib/text!root/plugins/glossario/palavra.html",
    "root/externallib/text!root/plugins/glossario/palavrapadrao.html",
    "root/externallib/text!root/plugins/glossario/inserir.html",
    "root/externallib/text!root/plugins/glossario/lang/pt_br.json"
];

define(templates,function (dadosTpl, glossarioTpl, glossariopadraoTpl, categoriaTpl, meusitensTpl, editarTpl, palavraTpl, palavrapadraoTpl, inserirTpl, langStrings) {
    var plugin = {
        settings: {
            name: "glossario",
            type: "course",
            menuURL: "#course/glossario/",
            lang: {
                component: "local_start",
                strings: langStrings
            }
			//,
            //icon: "plugins/glossario/icon.png"
        },
		
        routes: [
            ["course/glossario/:courseid", "general_view_glossarios", "showGlossarios"],
            ["course/glossario/:courseid/id/:id/:mod", "general_view_glossario", "showGlossario"],
			["course/glossario/:courseid/id/:id/categoria/:categoria/:mod", "general_view_category", "showCategory"],
			["course/glossario/:courseid/id/:id/meusitens/:mod", "general_view_itens", "showMeusItens"],
			["course/glossario/:courseid/id/:id/edit/:palavra/:mod", "general_edit_item", "editItem"],
			["course/glossario/:courseid/id/:id/categoria/:categoria/inserir/:mod", "general_add_item", "addItem"],
			["course/glossario/:courseid/id/:id/categoria/:categoria/palavra/:palavra", "general_view_item", "showItem"],
			["course/glossario/inserir/:courseid/id/:id/categoria/:categoria/:mod", "general_insert_glossario", "addGlossario"]
        ],

		showGlossarios: function(courseid) {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			// Adding loading icon.
            $('a[href="#course/glossario/' +courseid+ '"]').addClass('loading-row');	
			
			var data = {
                "dados[courseid]" : courseid,
                "dados[userid]" : MM.config.current_site.userid
            };
			
			MM.moodleWSextCall('local_start_get_glossary', data, function(contents) {			
				// Removing loading icon.
				$('a[href="#course/glossario/' +courseid+ '"]').removeClass('loading-row');
				
				var pageTitle = "Glossário";
				var tpl = {
					retorno: contents
				}
				
				var html = MM.tpl.render(MM.plugins.glossario.templates.dados.html, tpl);
				MM.panels.show("center", html, {title: pageTitle});
				
				$(".content-info").on(MM.quickClick, function(e) {
                    MM.plugins.glossario.infoContent(
                        e,
                        $(this).data("id"),
                        $(this).data("content"));
                });
			});
        },

		showGlossario: function(courseid,id,mod) {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }	
			
			var data = {
                "dados[courseid]" : courseid,
                "dados[userid]" : MM.config.current_site.userid
            };
			
			MM.moodleWSextCall('local_start_get_glossary', data, function(contents) {
				var pageTitle = "Glossário";
				
				if (mod==1){
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[courseid]" : courseid,
						"dados[glossaryid]" : id,
						"dados[userid]" : MM.config.current_site.userid
					};
					MM.moodleWSextCall('local_start_get_category_log', data, function(contentss) {
						var tpl = {
							retorno: contentss,
							gcourseid: courseid,
							gid: id,
							gmod: mod
						}
						
						var html = MM.tpl.render(MM.plugins.glossario.templates.glossario.html, tpl);
						MM.panels.show("center", html, {title: pageTitle});
						
					});
				}else{	
					
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[courseid]" : courseid,
						"dados[glossaryid]" : id,
						"dados[userid]" : MM.config.current_site.userid
					};
					
					MM.moodleWSextCall('local_start_get_category_padrao', data, function(contentss) {
						var tpl = {
							retorno: contentss,
							gcourseid: courseid,
							gid: id,
							gmod: mod
						}
						
						var html = MM.tpl.render(MM.plugins.glossario.templates.glossariopadrao.html, tpl);
						MM.panels.show("center", html, {title: pageTitle});
						
						(function($) {
							var allPanels = $('.accordionLetra > dd').hide();
							$('.accordionLetra > dt > a').click(function() {
								allPanels.slideUp();
								$(this).parent().next().slideDown();
								return false;
							});
						})(jQuery);
						
						$("#form-glossario-inserir").on( "click", function() {
							MM.plugins.glossario.addItem(courseid,id,0,mod);
						});
					});
				}
				
			});
        },

		showCategory: function(courseid,id,categoria,mod) {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('right');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			
			if (mod == 1){
				var data = {
					"dados[glossaryid]" : id,
					"dados[categoria]" : categoria
				};
				
				MM.moodleWSextCall('local_start_get_category', data, function(contents) {

					var pageTitle = "Glossário";
					var tpl = {
						retorno: contents,
						gcourseid: courseid,
						gid: id,
						gcategoria: categoria,
						gmod: mod
					}
					
					var html = MM.tpl.render(MM.plugins.glossario.templates.categoria.html, tpl);
					MM.panels.show("right", html, {title: pageTitle});
				});
			}else{
				var data = {
					"dados[device]" : MM.deviceTypeLog,
					"dados[courseid]" : courseid,
					"dados[glossaryid]" : id,
					"dados[userid]" : MM.config.current_site.userid
				};
				
				MM.moodleWSextCall('local_start_get_category_padrao', data, function(contents) {

					var pageTitle = "Glossário";
					var tpl = {
						retorno: contents,
						gcourseid: courseid,
						gid: id,
						gcategoria: categoria,
						gmod: mod
					}
					
					var html = MM.tpl.render(MM.plugins.glossario.templates.categoria.html, tpl);
					MM.panels.show("right", html, {title: pageTitle});
				});
				
			}
        },	

		showMeusItens: function(courseid,id, mod) {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('right');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			
			var data = {
				"dados[device]" : MM.deviceTypeLog,
				"dados[userid]" : MM.config.current_site.userid,
                "dados[glossaryid]" : id,
                "dados[mod]" : mod,
                "dados[courseid]" : courseid
            };
			
			MM.moodleWSextCall('local_start_get_meusitens', data, function(contents) {

				var pageTitle = "Glossário - Meus Itens";
				var tpl = {
					retorno: contents,
					gcourseid: courseid,
					gid: id
				}
				
				var html = MM.tpl.render(MM.plugins.glossario.templates.meusitens.html, tpl);
				MM.panels.show("right", html, {title: pageTitle});
				
				$(".editItem").on( "click", function() {
					MM.plugins.glossario.editItem(courseid,id,
							$(this).attr("rel"),
							$("#glossario-edit-image"+$(this).attr("rel")).val(),
							$("#glossario-edit-concept"+$(this).attr("rel")).val(),
							$("#glossario-edit-definition"+$(this).attr("rel")).val(),
							mod);
				});
			});
        },	
		
		editItem: function(courseid,id,palavra,image,concept,definition,mod) {

			var pageTitle = "Glossário - Editar";

			var tpl = {
				tcourseid: courseid,
				tid: id,
				tpalavra: palavra,
				timage: '<img src="'+image+'" style="max-height:150px; max-width: 50%;" border="0" />',
				tconcept: concept,
				tdefinition: definition
			}
			var html = MM.tpl.render(MM.plugins.glossario.templates.editar.html, tpl);
			MM.panels.show("right", html, {title: pageTitle});
			
			$("#btn-glossario-editar-image").on("click", function() {
				MM.plugins.glossario.browseAlbums();
			});	
			
			$("#btn-glossario-editar-photo").on("click", function() {
				MM.plugins.glossario.takeMedia();
			});	
									
			$("#btn-glossario-deletar-item").on( "click", function() {
				MM.popConfirm("Você realmente deseja deletar o item?", function() {
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[courseid]" : courseid,
						"dados[glossaryid]" : id,
						"dados[palavra]" : palavra,
						"dados[mod]" : mod
					};
					
					MM.moodleWSextCall('local_start_delete_glossary', data, function(contents) {					
						MM.refresh(1);
						MM.popMessage("Palavra deletada com sucesso.");
						MM.plugins.glossario.showMeusItens(courseid,id,mod);
					});
				});
			});
			
			$("#btn-glossario-editar").on( "click", function() {
				if ( ($.trim($("#editar-glossario-conceito").val()) == "") || ($.trim($("#editar-glossario-definicao").val()) == "") ){
					MM.popMessage("É importante informar o conceito e definição.");
				}else{
					$("#btn-glossario-editar").attr("value","Editando...");
					$("#btn-glossario-editar").attr("disabled","true");
					
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[userid]" : MM.config.current_site.userid,
						"dados[courseid]" : courseid,
						"dados[glossaryid]" : id,
						"dados[mod]" : mod,
						"dados[palavra]" : palavra,
						"dados[item]" : $("#editar-glossario-id").val(),
						"dados[conceito]" : $("#editar-glossario-conceito").val(),
						"dados[definicao]" : $("#editar-glossario-definicao").val(),
						"dados[anexo]" : $("#glossario-image-result").val()
					};

					MM.moodleWSextCall('local_start_edit_glossary', data, function(contents) {
						$("#btn-glossario-editar").removeAttr("disabled");
						$("#btn-glossario-editar").attr("value","Editar mudanças");
						
						if (contents[0].id == 0){
							MM.popMessage("Este conceito já existe. Não é permitida a criação de outras versões.");
						}else{
							MM.refresh(1);
							MM.popMessage("Palavra editada com sucesso.");
							MM.plugins.glossario.showMeusItens(courseid,id,mod);
						}
					});
				}
			});
			
        },	

		showItem: function(courseid,id,categoria,palavra) {
			userid = MM.config.current_site.userid;
			
            MM.panels.showLoading('right');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			// Adding loading icon.
            //$('a[href="#glossario"]').addClass('loading-row');	
			
			var data = {
                "dados[courseid]" : courseid,
                "dados[glossaryid]" : id,
                "dados[categoria]" : categoria,
                "dados[palavra]" : palavra
            };
			
			MM.moodleWSextCall('local_start_get_palavra', data, function(contents) {			
				// Removing loading icon.
				//$('a[href="#aluno"]').removeClass('loading-row');

				var pageTitle = "Glossário";
				var tpl = {
					retorno: contents,
					gcourseid: courseid,
					gid: id,
					gcategoria: categoria
				}
				if (categoria == 0){
					var html = MM.tpl.render(MM.plugins.glossario.templates.palavrapadrao.html, tpl);
					MM.panels.show("right", html, {title: pageTitle});
				}else{
					var html = MM.tpl.render(MM.plugins.glossario.templates.palavra.html, tpl);
					MM.panels.show("right", html, {title: pageTitle});
				}
				
				$("#form-glossario-comentar").on( "click", function() {
					if ($.trim($("#form-glossario-comentario").val()) == ""){
						MM.popMessage("É importante informar o comentário.");
					}else{
						var data = {
							"dados[device]" : MM.deviceTypeLog,
							"dados[userid]" : MM.config.current_site.userid,
							"dados[glossaryid]" : id,
							"dados[mod]" : categoria,
							"dados[itemid]" : palavra,
							"dados[courseid]" : courseid,
							"dados[comentario]" : $("#form-glossario-comentario").val()
						};					
						MM.moodleWSextCall('local_start_save_comentario', data, function(contents) {
							MM.refresh(1);
							MM.popMessage("Comentário inserido com sucesso.");
							MM.plugins.glossario.showItem(courseid,id,categoria,palavra);
						});
					}
				});
			});
        },
		
		addItem: function(courseid,id,categoria,mod) {

			var pageTitle = "Glossário - Inserir";

			var tpl = {
				retorno: courseid
			}
			var html = MM.tpl.render(MM.plugins.glossario.templates.inserir.html, tpl);
			MM.panels.show("right", html, {title: pageTitle});
			
			$("#btn-glossario-image").on("click", function() {
				MM.plugins.glossario.browseAlbums();
			});	
			
			$("#btn-glossario-photo").on("click", function() {
				MM.plugins.glossario.takeMedia();
			});	
			
			$("#form-glossario-salvar").on( "click", function() {
				if ( ($.trim($("#form-glossario-conceito").val()) == "") || ($.trim($("#form-glossario-definicao").val()) == "") ){
					MM.popMessage("É importante informar o conceito e definição.");
				}else{
					$("#form-glossario-salvar").attr("value","Salvando...");
					$("#form-glossario-salvar").attr("disabled","true");
					
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[userid]" : MM.config.current_site.userid,
						"dados[courseid]" : courseid,
						"dados[glossaryid]" : id,
						"dados[categoria]" : categoria,
						"dados[conceito]" : $("#form-glossario-conceito").val(),
						"dados[definicao]" : $("#form-glossario-definicao").val(),
						"dados[anexo]" : $("#glossario-image-result").val()
					};
			
					MM.moodleWSextCall('local_start_save_glossary', data, function(contents) {
						$("#form-glossario-salvar").removeAttr("disabled");
						$("#form-glossario-salvar").attr("value","Salvar mudanças");
						if (contents[0].id == 0){
							MM.popMessage("Este conceito já existe. Não é permitida a criação de outras versões.");
						}else{
							MM.refresh(1);
							MM.popMessage("Palavra inserida com sucesso.");
							MM.plugins.glossario.showGlossario(courseid,id,mod);
						}
					});
				}
			});
			
        },
		
		addGlossario: function(courseid,id,categoria) {

			var pageTitle = "Glossário - Inserir";

			var tpl = {
				retorno: courseid
			}
			var html = MM.tpl.render(MM.plugins.glossario.templates.inserir.html, tpl);
			MM.panels.show("center", html, {title: pageTitle});
			
			$("#form-glossario-salvar").on( "click", function() {
				var data = {
					"dados[device]" : MM.deviceTypeLog,
					"dados[userid]" : MM.config.current_site.userid,
					"dados[courseid]" : id,
					"dados[conceito]" : $("#form-glossario-conceito").val(),
					"dados[definicao]" : $("#form-glossario-definicao").val()
				};
				
				MM.moodleWSextCall('local_start_save_glossary', data, function(contents) {
					MM.popMessage("Glossário inserido com sucesso.");
					MM.panels.goBack();
				});
			});
			
        },
		
		
		browseAlbums: function() {
            MM.log('Trying to get a image from albums', 'Upload');
            MM.Router.navigate("");
            var width  =  $(document).innerWidth()  - 200;
            var height =  $(document).innerHeight() - 200;
            // iPad popOver, see https://tracker.moodle.org/browse/MOBILE-208
            var popover = new CameraPopoverOptions(10, 10, width, height, Camera.PopoverArrowDirection.ARROW_ANY);
            navigator.camera.getPicture(MM.plugins.glossario.photoSuccess, MM.plugins.glossario.photoFails, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                popoverOptions : popover
				//mediaType: navigator.camera.MediaType.ALLMEDIA
            });
        },
        takeMedia: function() {
            MM.log('Trying to get a image from camera', 'Upload');
            MM.Router.navigate("");
            navigator.camera.getPicture(MM.plugins.glossario.photoSuccess, MM.plugins.glossario.photoFails, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI
            });
        },
		photoSuccess: function(uri) {
            MM.log('Uploading an image to Moodle', 'Upload');			
			window.resolveLocalFileSystemURL(uri, function(fileEntry) {
                fileEntry.file(function(filee) {				
					var d = new Date();					
					var options = {};
					options.fileKey="file";					
					var filetype = filee.type;
					var filext = filetype.substr(filetype.indexOf("/") + 1);
					// Check if we are in desktop or mobile.
					if (MM.inNodeWK) {
						options.fileName = uri.lastIndexOf("/") + 1;
					} else {
						options.fileName = "arquivo_" + d.getTime() + "."+filext;
					}					
					options.mimeType = filetype;
					// var optionJson = JSON.stringify(filee);
					// alert(filee.localURL);
					MM.moodleUploadFile(uri, options,
											function(result){
												$("#glossario-image-result").val(JSON.stringify(result));
												$("#glossario-image-attach").html('<img src="'+filee.localURL+'" style="max-height:150px; max-width: 50%;" border="0" />');
												MM.popMessage(MM.lang.s("imagestored")); 
											},
											function(){
												$("#glossario-image-result").val("");
												MM.popErrorMessage(MM.lang.s("erroruploading"));
											}
					);
                }, function() {
                    alert('error287');
                });
            }, function () {  });
        },
        photoFails: function(message) {
            MM.log('Error trying getting a photo', 'Upload');
            if (message) {
                MM.log('Error message: ' + JSON.stringify(message));
            }
            if (message.toLowerCase().indexOf("error") > -1 || message.toLowerCase().indexOf("unable") > -1) {
                MM.popErrorMessage(message);
            }
        },
		
        infoContent: function(e, id, content) {

            e.preventDefault();
            var i = {
                left: e.pageX - 5,
                top: e.pageY
            };

            if (MM.quickClick.indexOf("touch") > -1) {
                i.left = e.originalEvent.touches[0].pageX -5;
                i.top = e.originalEvent.touches[0].pageY;
            }

            if (typeof(MM.plugins.glossario.infoBox) != "undefined") {
                MM.plugins.glossario.infoBox.remove();
            }

			content = decodeURIComponent(content);
			content = content.replace(/\+/g, " ");
			var information = '<p><strong>'+decodeURIComponent(content)+'</strong></p>';

            MM.plugins.glossario.infoBox = $('<div id="infobox-'+id+'"><div class="arrow-box-contents">'+information+'</div></div>').addClass("arrow_box");
            $('body').append(MM.plugins.glossario.infoBox);

            var width = $("#panel-right").width() / 1.5;
            $('#infobox-'+id).css("top", i.top - 30).css("left", i.left - width - 35).width(width);

            // Hide the infobox on click in any link or inside itselfs
            $('#infobox-'+id+', a').bind('click', function(e) {
                if (typeof(MM.plugins.glossario.infoBox) != "undefined") {
                    MM.plugins.glossario.infoBox.remove();
                }
            });

            // Hide the infobox on scroll.
            $("#panel-right").bind("touchmove", function(){
                if (typeof(MM.plugins.glossario.infoBox) != "undefined") {
                    MM.plugins.glossario.infoBox.remove();
                }
            });
        },
		
        templates: {
            "dados": {
                html: dadosTpl
            },
            "glossario": {
                html: glossarioTpl
            },
            "glossariopadrao": {
                html: glossariopadraoTpl
            },
            "categoria": {
                html: categoriaTpl
            },
            "meusitens": {
                html: meusitensTpl
            },
            "editar": {
                html: editarTpl
            },
            "palavra": {
                html: palavraTpl
            },
            "palavrapadrao": {
                html: palavrapadraoTpl
            },
            "inserir": {
                html: inserirTpl
            }
        }
    }

    MM.registerPlugin(plugin);
});