var templates = [
    "root/externallib/text!root/plugins/contents/sections.html",
    "root/externallib/text!root/plugins/contents/contents.html",
    "root/externallib/text!root/plugins/contents/content.html",
    "root/externallib/text!root/plugins/contents/folder.html",
    "root/externallib/text!root/plugins/contents/localizacao.html",
    "root/externallib/text!root/plugins/contents/mimetypes.json"
];

define(templates,function (sectionsTpl, contentsTpl, contentTpl, folderTpl, localizacaoTpl, mimeTypes) {
    var plugin = {
        settings: {
            name: "contents",
            type: "course",
            menuURL: "#course/contents/",
            lang: {
                component: "core"
            },
            icon: ""
        },

        storage: {
            content: {type: "model"},
            contents: {type: "collection", model: "content"}
        },

        routes: [
            ["course/contents/:courseid", "course_contents", "viewCourseContents"],
            ["course/mapa/:courseid", "course_contents_mapa", "viewCourseContentsMapa"],
            ["course/contents/:courseid/section/:sectionId", "course_contents_section", "viewCourseContentsSection"],
            ["course/contents/:courseid/section/:sectionId/content/:id", "section_content", "viewSectionContent"],
            ["course/contents/:courseid/section/:sectionId/folder/:contentid/sectionname/:sectionname", "course_contents_folder", "viewFolder"],
            ["course/contents/:courseid/section/:sectionId/download/:contentid", "course_contents_download", "downloadContent"],
            ["course/contents/:courseid/section/:sectionId/download/:contentid/:index", "course_contents_download_folder", "downloadContent"]
        ],

        browseAlbumsBKP: function() {
            MM.log('Trying to get a image from albums', 'Upload');
            MM.Router.navigate("");
            var width  =  $(document).innerWidth()  - 200;
            var height =  $(document).innerHeight() - 200;
            var popover = new CameraPopoverOptions(10, 10, width, height, Camera.PopoverArrowDirection.ARROW_ANY);
            navigator.camera.getPicture(MM.plugins.contents.photoSuccess, MM.plugins.contents.photoFails, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                popoverOptions : popover
				//mediaType: navigator.camera.MediaType.ALLMEDIA
            });
        },

        browseAlbums: function() {
            var html = MM.tpl.render(MM.plugins.upload.templates.uploadfile.html, {});
            //MM.panels.show('center', html, {hideRight: true, title: MM.lang.s("uploadfile")});
			MM.panels.show('right', html, {title: MM.lang.s("uploadfile")});
            $('#uploadFileChooser').on('change', function(e) {
                e.preventDefault();
                var file = this.files[0];
                $(this).val('');
                if(file) {
					MM.plugins.upload.showUploadConfirmIfNeededContents(file);
                }
            });
        },
		
        takeMedia: function() {
            MM.log('Trying to get a image from camera', 'Upload');
            MM.Router.navigate("");
            navigator.camera.getPicture(MM.plugins.contents.photoTakeSuccess, MM.plugins.contents.photoFails, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI
            });
        },

		photoTakeSuccess: function(uri) {
            MM.log('Uploading an image to Moodle', 'Upload');
			window.resolveLocalFileSystemURL(uri, function(fileEntry) {		   		

                fileEntry.file(function(filee) {
					var d = new Date();
					var options = {};
					options.fileKey="file";
					var filetype = filee.type;
					var filext = filetype.substr(filetype.indexOf("/") + 1);
					if (MM.inNodeWK) {	// Check if we are in desktop or mobile.
						options.fileName = uri.lastIndexOf("/") + 1;
					} else {
						var dd = d.getDate();
						var mm = d.getMonth()+1;
						var yyyy = d.getFullYear();
						var hour    = d.getHours();
						var minute  = d.getMinutes();
						var second  = d.getSeconds(); 
						if(dd<10) { dd='0'+dd; }
						if(mm<10) { mm='0'+mm; }
						if(hour.toString().length == 1) { var hour = '0'+hour; }
						if(minute.toString().length == 1) { var minute = '0'+minute; }
						if(second.toString().length == 1) { var second = '0'+second;} 
						var dataarquivo = yyyy+''+mm+''+dd+'_'+hour+''+minute+''+second;
						options.fileName = "arquivo_" + dataarquivo + "."+filext;	 //options.fileName = "arquivo_" + d.getTime() + "."+filext;
					}
					options.mimeType = filetype;
					MM.moodleAttachFile(uri, options,
										function(result){
											$("#form-arquivo-result").val(JSON.stringify(result)); //$("#form-arquivo-anexado").html(options.fileName);
											$("#form-arquivo-anexado").html('<img src="'+filee.localURL+'" id="filee_localURL" style="max-height:150px; max-width: 50%;" border="0" />');
											MM.popMessage("Imagem anexada..."); 
										},
										function(){
											$("#form-arquivo-result").val("");
											MM.popErrorMessage(MM.lang.s("erroruploading"));
										});
                }, function() {
                    MM.popMessage("Erro: Sem permissão para enviar arquivo."); 
                });
            }, function () {  });
        },
		
		photoSuccess: function(uri) {
            MM.log('Uploading an image to Moodle', 'Upload');
			window.resolveLocalFileSystemURL(uri, function(fileEntry) {

                fileEntry.file(function(filee) {
					EXIF.getData(filee, function() {
						var datetime = EXIF.getTag(this, "DateTimeOriginal");
						setTimeout(function(){
							//se nao encontrar data e hora orignal
							if (typeof(datetime) === 'undefined' || datetime === null){
								var nativeurl = fileEntry.nativeURL;
								//nativeurl = nativeurl.replace(/[^\d_-]/g, '');
								//nativeurl = nativeurl.replace(/\D+/g,'');
								nativeurl = nativeurl.replace(/[^0-9_-]/g, '');								
								var d = new Date();
								var options = {};
								options.fileKey="file";
								var filetype = filee.type;
								var filext = filetype.substr(filetype.indexOf("/") + 1);
								if (MM.inNodeWK) {	// Check if we are in desktop or mobile.
									options.fileName = uri.lastIndexOf("/") + 1;
								} else {						
									if(nativeurl.toString().length <= 5) {
										var dd = d.getDate();
										var mm = d.getMonth()+1;
										var yyyy = d.getFullYear();
										var hour    = d.getHours();
										var minute  = d.getMinutes();
										var second  = d.getSeconds(); 
										if(dd<10) { dd='0'+dd; }
										if(mm<10) { mm='0'+mm; }
										if(hour.toString().length == 1) { var hour = '0'+hour; }
										if(minute.toString().length == 1) { var minute = '0'+minute; }
										if(second.toString().length == 1) { var second = '0'+second;} 
										var dataarquivo = yyyy+''+mm+''+dd+'_'+hour+''+minute+''+second;
									}else{
										var dataarquivo = nativeurl;
									}						
									options.fileName = "a2rquivo_" + dataarquivo + "."+filext;	 //options.fileName = "arquivo_" + d.getTime() + "."+filext;
								}
								options.mimeType = filetype;
								
							//se encontrar data e hora original do arquivo
							}else{
								var nativeurl = datetime;
								nativeurl = nativeurl.replace(/\:/g, "");
								nativeurl = nativeurl.replace(/\ /g, "_");
								var d = new Date();
								var options = {};
								options.fileKey="file";
								var filetype = filee.type;
								var filext = filetype.substr(filetype.indexOf("/") + 1);
								if (MM.inNodeWK) {	// Check if we are in desktop or mobile.
									options.fileName = uri.lastIndexOf("/") + 1;
								} else {						
									if(nativeurl.toString().length <= 5) {
										var dd = d.getDate();
										var mm = d.getMonth()+1;
										var yyyy = d.getFullYear();
										var hour    = d.getHours();
										var minute  = d.getMinutes();
										var second  = d.getSeconds(); 
										if(dd<10) { dd='0'+dd; }
										if(mm<10) { mm='0'+mm; }
										if(hour.toString().length == 1) { var hour = '0'+hour; }
										if(minute.toString().length == 1) { var minute = '0'+minute; }
										if(second.toString().length == 1) { var second = '0'+second;} 
										var dataarquivo = yyyy+''+mm+''+dd+'_'+hour+''+minute+''+second;
									}else{
										var dataarquivo = nativeurl;
									}						
									options.fileName = "a1rquivo_" + dataarquivo + "."+filext;	 //options.fileName = "arquivo_" + d.getTime() + "."+filext;
								}
								options.mimeType = filetype;
							}
							MM.moodleAttachFile(uri, options,
											function(result){
												// alert(JSON.stringify(result));
												// alert(filee.localURL);
												// alert(options.fileName);
												$("#form-arquivo-result").val(JSON.stringify(result)); //$("#form-arquivo-anexado").html(options.fileName);
												$("#form-arquivo-anexado").html('<img src="'+filee.localURL+'" id="filee_localURL" style="max-height:150px; max-width: 50%;" border="0" />');
												MM.popMessage("Imagem anexada..."); 
											},
											function(){
												$("#form-arquivo-result").val("");
												MM.popErrorMessage(MM.lang.s("erroruploading"));
											});
						}, 1500);
						
					});
					
                }, function() {
                    MM.popMessage("Erro: Sem permissão para enviar arquivo."); 
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

        viewCourseContents: function(courseId) {

            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
            // Adding loading icon.
            $('a[href="#course/contents/' +courseId+ '"]').addClass('loading-row');
						
			// mostrar locativa se ja houver atualizacao da posicao

			var latinfo = 1;
			var longinfo = 1;
			var latinfo = $("#latinfo").val();
			var longinfo = $("#longinfo").val();		
			if (latinfo == "") latinfo = 1;
			if (longinfo == "") longinfo = 1;

            var data = {
                'courseid': courseId,
				"options[0][device]" : MM.deviceTypeLog,
                'options[0][name]': 'excludecontents',
                'options[0][value]': true,
				"options[0][latinfo]" : latinfo,
				"options[0][longinfo]" : longinfo
            };

            MM.moodleWSextCall('local_start_get_course_contents', data, function(contents) {
                // Removing loading icon.
                $('a[href="#course/contents/' +courseId+ '"]').removeClass('loading-row');
                var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);

                var tpl = {
					locativa: 0,
                    sections: contents,
                    course: course.toJSON() // Convert a model to a plain javascript object.
                };
                var html = MM.tpl.render(MM.plugins.contents.templates.sections.html, tpl);

                pageTitle = course.get("shortname") + " - " + MM.lang.s("contents");

                MM.panels.show("center", html, {title: pageTitle});
                if (MM.deviceType == "tablet" && contents.length > 0) {
                    // First section.
                    var firstSection = 0;

                    // Special case, frontpage. Avoid the rest of sections
                    if (courseId == 1) {
                        firstSection = -1;
                        $("#panel-center li:eq(0)").addClass("selected-row");
                    } else {
                        $("#panel-center li:eq(1)").addClass("selected-row");
                    }
                    MM.plugins.contents.viewCourseContentsSection(courseId, firstSection);
                }
				
				$("#form-content-gps").on( "click", function() {
					gpsDetect = cordova.require('cordova/plugin/gpsDetectionPlugin');
					gpsDetect.checkGPS(function (on) {
						if (on){
							setTimeout(function(){
								MM.popMessage("Atualizando dados GPS.");
							}, 500);
							funcgeolocation();
							setTimeout(function(){
								MM.plugins.contents.viewCourseContentsMapa(courseId,$("#latinfo").val(), $("#longinfo").val());
							}, 500);
							
						}else{
							MM.popMessage("Para melhor utilização, ligue o GPS do seu dispositivo.");
						}
					}, 
					function (e) {
						setTimeout(function(){
							MM.popMessage("Erro:"+ e);
						}, 1500);
					});
				});
				
            }, null, function(m) {
                // Error callback.
                // Removing loading icon.
                $('a[href="#course/contents/' +courseId+ '"]').removeClass('loading-row');
                if (typeof(m) !== "undefined" && m) {
                    MM.popErrorMessage(m);
                }
            });
        },

		viewCourseContentsMapa: function(courseId,tlatitude,tlongitude) {
			
			var tpl = {
				retorno: tlatitude
			}
			var html = MM.tpl.render(MM.plugins.contents.templates.localizacao.html, tpl);
			MM.panels.show("right", html);
			
			setTimeout(function(){
				mapa.clear();
				mapa.off();
				var div = $("#map_canvas")[0];
				if (div) {
					mapa.setDiv(div);					
					mapa.setClickable(true);
					
					
					var latLng = null;
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[courseid]" : courseId,
						"dados[latinfo]" : tlatitude,
						"dados[longinfo]" : tlongitude
					};	
					MM.moodleWSextCall('local_start_get_gps_restricted', data, function(contents) {
						for(var i = 0; i < contents.length; i++) {
							latLng = funclatLng(contents[i].latitude, contents[i].longitude);
							mapa.addMarker({
								'position': latLng,
								'title': contents[i].address,
								'icon': 'www/img/azul.png'
							}, function(marker) {
								marker.showInfoWindow();
							});
						}
					});
					
					
					latLng = funclatLng(tlatitude,tlongitude);
					mapa.addMarker({
						'position': latLng,
						'title': "Eu estou aqui!"
					}, function(marker) {
						mapa.animateCamera({
							'target': latLng,
							'zoom': 18
						}, function() {
							marker.showInfoWindow();
						});
					});
				}
					
				$("#form-content-gpsin").on( "click", function() {
					var latLng = funclatLng(tlatitude,tlongitude);
					mapa.addMarker({
						'position': latLng,
						'title': "Eu estou aqui!"
					}, function(marker) {
						mapa.animateCamera({
							'target': latLng,
							'zoom': 18
						}, function() {
							marker.showInfoWindow();
						});
					});
					
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[userid]" : MM.config.current_site.userid,
						"dados[courseid]" : courseId,
						"dados[latitude]" : tlatitude,
						"dados[longitude]" : tlongitude
					};					
					MM.refresh(1);
					MM.popMessage("Posição atualizada! voltando para o conteúdo do curso.");
					MM.moodleWSextCall('local_start_gps_user', data, function(contents) {						
						setTimeout(function(){
							//MM.panels.goBack();
							mapa.setClickable(false);
							var div = $("#tempmapa")[0];
							if (div) {
							  mapa.setDiv(div);
							}
							MM.plugins.contents.viewCourseContents(courseId);
						}, 500);
					});	
				});
			}, 1000);
        },


        viewCourseContentsSection: function(courseId, sectionId) {

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }

            var sectionName = "";

			var latinfo = $("#latinfo").val();
			var longinfo = $("#longinfo").val();
			if (latinfo == "") latinfo = 1;
			if (longinfo == "") longinfo = 1;
            var data = {
				"options[0][device]" : MM.deviceTypeLog,
				"options[0][name]" : "",
				"options[0][value]" : "",
				"options[0][latinfo]" : latinfo,
				"options[0][longinfo]" : longinfo
            };
            data.courseid = courseId;

            // This is used in the logging WS call.
            var sectionNumber = 0;
            if (sectionId > 0) {
                sectionNumber = sectionId;
            }

            MM.moodleWSextCall(
                'local_start_get_course_contents',
                data,
                function(contents) {
                    var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);
                    var courseName = course.get("fullname");

                    var firstContent = 0;

                    var contentsStored = [];
                    MM.db.each("contents", function(el){
                        contentsStored.push(el.get("id"));
                    });

                    var finalContents = [];
                    $.each(JSON.parse(JSON.stringify(contents)), function(index1, sections){
                        // Skip sections deleting contents..
                        if (sectionId > -1 && sectionId != index1) {
                            // This is a continue.
                            return true;
                        }
                        sectionName = sections.name;
                        $.each(sections.modules, function(index2, content){

                            content.contentid = content.id;
                            content.courseid = courseId;
                            content.id = MM.config.current_site.id + "-" + content.contentid;

                            if(!firstContent) {
                                firstContent = content.contentid;
                            }

                            // Check if has multiple files.
                            if (content.modname == "folder" ||
                                    (content.contents && content.contents.length > 1)) {
                                sections.modules[index2].multiplefiles = true;
                            }

                            // Check if is a resource URL.
                            if (content.modname == "url" &&
                                    content.contents && content.contents.length > 0 &&
                                    content.contents[0].fileurl) {

                                sections.modules[index2].fileurl = content.contents[0].fileurl;
                            }

                            // The file/s was/were downloaded.
                            var downloaded = false;

                            // This content is currently in the database.
                            if (contentsStored.indexOf(content.id) > -1) {
                                var c = MM.db.get("contents", content.id);
                                c = c.toJSON();
                                sections.modules[index2].mainExtension = c.mainExtension;
                                sections.modules[index2].webOnly = c.webOnly;

                                if (c.contents) {
                                    $.each(c.contents, function (index5, filep) {
                                        if (typeof(filep.localpath) != "undefined" &&
                                                typeof(sections.modules[index2].contents[index5]) != "undefined") {

                                            sections.modules[index2].contents[index5].localpath = filep.localpath;
                                        }
                                    });
                                }

                                if (!sections.modules[index2].webOnly) {
                                    if (c.contents && c.contents[0]) {
                                        var extension = MM.util.getFileExtension(c.contents[0].filename);

                                        if (c.contents.length == 1 || (content.modname == "resource" && extension != "html" && extension != "htm")) {
                                            var cFile = c.contents[0];
                                            downloaded = typeof(cFile.localpath) != "undefined";
                                        } else {
                                            downloaded = true;
                                            if (c.contents) {
                                                $.each(c.contents, function (index5, filep) {
                                                    if (typeof(filep.localpath) == "undefined") {
                                                        downloaded = false;
                                                    }
                                                });
                                            }
                                        }
                                    }
                                    sections.modules[index2].downloaded = downloaded;
                                }

                                // Check if our stored information has changed remotely.
                                var updateContentInDB = false;
                                var contentElements = ['filename', 'fileurl' , 'filesize',
                                    'timecreated', 'timemodified', 'author', 'license'];

                                for (var indexEl in c.contents) {
                                    _.each(contentElements, function(el) {
                                        if (typeof(c.contents[indexEl][el]) != "undefined" &&
                                            typeof(content.contents[indexEl]) != "undefined" &&
                                            typeof(content.contents[indexEl][el]) != "undefined" &&
                                            c.contents[indexEl][el] != content.contents[indexEl][el]
                                            ) {
                                            updateContentInDB = true;
                                            c.contents[indexEl][el] = content.contents[indexEl][el];
                                        }
                                    });
                                }

                                // Check file additions.
                                for (var indexEl in content.contents) {
                                    if (typeof c.contents[indexEl] == "undefined") {
                                        updateContentInDB = true;
                                        c.contents[indexEl] = content.contents[indexEl];
                                    }
                                }

                                // Check if the content name has changed.
                                if (c.name != content.name) {
                                    c.name = content.name;
                                    updateContentInDB = true;
                                }

                                // Labels should be allways updated (the description may change).
                                if (c.modname == "label") {
                                    c.description = content.description;
                                    updateContentInDB = true;
                                }

                                if (updateContentInDB) {
                                    MM.db.insert("contents", c);
                                }

                                return true; // This is a continue;
                            }

                            // The mod url also exports contents but are external contents not downloadable by the app.
                            var modContents = ["folder","page","resource"];

                            if (modContents.indexOf(content.modname) == -1) {
                                content.webOnly = true;
                            } else {
                                content.webOnly = false;
                            }
                            sections.modules[index2].webOnly = content.webOnly;

                            MM.db.insert("contents", content);

                            // Sync content files.

                            if (typeof(content.contents) != "undefined") {
                                $.each(content.contents, function (index3, file) {

                                    if (typeof file.fileurl == "undefined" || !file.fileurl) {
                                        return true;
                                    }

                                    if (file.fileurl.indexOf(MM.config.current_site.siteurl) == -1) {
                                        return true;
                                    }

                                    var paths = MM.plugins.contents.getLocalPaths(courseId, content.contentid, file);

                                    var el = {
                                        id: hex_md5(MM.config.current_site.id + file.fileurl),
                                        url: file.fileurl,
                                        path: paths.directory,
                                        newfile: paths.file,
                                        contentid: content.id,
                                        index: index3,
                                        syncData: {
                                            name: MM.lang.s("content") + ": " + courseName + ": " + content.name,
                                            description: file.fileurl
                                        },
                                        siteid: MM.config.current_site.id,
                                        type: "content"
                                       };

                                    // Disabled auto sync temporaly
                                    //MM.log("Sync: Adding content: " + el.syncData.name + ": " + el.url);
                                    //MM.db.insert("sync", el);

                                    if (file.filename) {
                                        var extension = file.filename.substr(file.filename.lastIndexOf(".") + 1);

                                        // Exception for folder type, we use the resource icon.
                                        if (content.modname != "folder" && typeof(MM.plugins.contents.templates.mimetypes[extension]) != "undefined") {
                                            sections.modules[index2].mainExtension = MM.plugins.contents.templates.mimetypes[extension]["icon"];
                                            content.mainExtension = sections.modules[index2].mainExtension;
                                            MM.db.insert("contents", content);
                                        }
                                    }
                                });
                            }
                        });

                        finalContents.push(sections);

                    });

                    var tpl = {
                        sections: finalContents,
                        sectionId: sectionId,
                        courseId: courseId,
                        course: course.toJSON() // Convert a model to a plain javascript object.
                    };

                    var pageTitle = MM.util.formatText(sectionName);
                    if (sectionId == -1) {
                        pageTitle = MM.lang.s("showall");
                    }

                    var html = MM.tpl.render(MM.plugins.contents.templates.contents.html, tpl);
                    MM.panels.show('right', html, {title: pageTitle});

					$(".btnchat").click(function() {
						var data = {
							"dados[device]" : MM.deviceType,
							"dados[courseid]" : courseId,
							"dados[sectionId]" : sectionId,
							"dados[cmid]" : $(this).attr("rel")
						};	
						MM.moodleWSextCall('local_start_link_click_log', data, function(contents) { });
					});

                    // Show info content modal window.
                    $(".content-info", "#panel-right").on(MM.quickClick, function(e) {
                        MM.plugins.contents.infoContent(
                            e,
                            $(this).data("course"),
                            $(this).data("section"),
                            $(this).data("content"),
                            -1);
                    });

                    // Show info for sections.
                    $("h3", "#panel-right").on(MM.quickClick, function(e) {
                        var sectionId = $(this).data("sectionid");
                        if (sectionId) {
                            $("#section-" + sectionId).toggle();
                        }
                    });

                    // Mod plugins should now that the page has been rendered.
                    for (var pluginName in MM.plugins) {
                        var plugin = MM.plugins[pluginName];

                        if (plugin.settings.type == 'mod') {
                            var visible = true;
                            if (typeof(plugin.isPluginVisible) == 'function' && !plugin.isPluginVisible()) {
                                visible = false;
                            }
                            if (visible && typeof plugin.contentsPageRendered == "function") {
                                plugin.contentsPageRendered();
                            }
                        }
                    }
                }
            );
        },

        downloadContent: function(courseId, sectionId, contentId, index){
            var file;
            var FILE_SIZE_WARNING = {
                'phone':  5000000,
                'tablet': 15000000
            };

            var content = MM.db.get("contents", MM.config.current_site.id + "-" + contentId);
            content = content.toJSON();

            if (typeof(index) != "undefined") {
                file = content.contents[index];
            } else {
                file = content.contents[0];
            }

            // Now we check if we have to alert the user that is about to download a large file.
            if (file.filesize) {
                // filesize is in bytes.
                var filesize = parseInt(file.filesize);
                if (filesize > FILE_SIZE_WARNING[MM.deviceType]) {
                    //var notice = MM.lang.s("noticelargefile");
                    var notice = " " + MM.lang.s("filesize") + " " + MM.util.bytesToSize(filesize, 2) + "<br />";
                    notice += MM.lang.s("confirmcontinuedownload");

                    MM.popConfirm(notice, function() {
                        MM.plugins.contents.downloadContentFile(courseId, sectionId, contentId, index, true);
                    });
                    return;
                }
            }
            MM.plugins.contents.downloadContentFile(courseId, sectionId, contentId, index, true);
        },

        downloadContentFile: function(courseId, sectionId, contentId, index, open, background, successCallback, errorCallback) {

            open = open || false;
            background = background || false;

            var content = MM.db.get("contents", MM.config.current_site.id + "-" + contentId);
            content = content.toJSON();

            var downCssId = "#download-" + contentId;
            var linkCssId = "#link-" + contentId;

            if (typeof(index) != "undefined") {
                downCssId = "#download-" + contentId + "-" + index;
                linkCssId = "#link-" + contentId + "-" + index;
            } else {
                index = 0;
            }

            var file = content.contents[index];
            var downloadURL = file.fileurl + "&token=" + MM.config.current_token;

            // Now, we need to download the file.
            // First we load the file system (is not loaded yet).
            MM.fs.init(function() {
                var path = MM.plugins.contents.getLocalPaths(courseId, contentId, file);
                MM.log("Content: Starting download of file: " + downloadURL);
                // All the functions are async, like create dir.
                MM.fs.createDir(path.directory, function() {
                    MM.log("Content: Downloading content to " + path.file + " from URL: " + downloadURL);

                    if ($(downCssId)) {
                        $(downCssId).attr("src", "img/loadingblack.gif");
                    }

                    MM.moodleDownloadFile(downloadURL, path.file,
                        function(fullpath) {
                            MM.log("Content: Download of content finished " + fullpath + " URL: " + downloadURL + " Index: " +index + "Local path: " + path.file);
                            content.contents[index].localpath = path.file;
                            var downloadTime = MM.util.timestamp();
                            content.contents[index].downloadtime = downloadTime;
                            // Raise conditions may happen here. The callback functions handle that.
                            MM.db.insert("contents", content);
                            if ($(downCssId)) {
                                $(downCssId).remove();
                                $(linkCssId).attr("href", fullpath);
                                $(linkCssId).attr("rel", "external");
                                // Android, open in new browser
                                MM.handleFiles(linkCssId);
                                if (open) {
                                    MM._openFile(fullpath);
                                }
                            }
                            if (typeof successCallback == "function") {
                                successCallback(index, fullpath, path.file, downloadTime);
                            }
                        },
                        function(fullpath) {
                            MM.log("Content: Error downloading " + fullpath + " URL: " + downloadURL);
                            if ($(downCssId)) {
                                $(downCssId).attr("src", "img/download.png");
                            }
                            if (typeof errorCallback == "function") {
                                errorCallback();
                            }
                         },
                         background
                    );
                });
            });
        },
		
		viewSectionContent: function(courseId, sectionId, id) {
			MM.panels.showLoading('right');
			
            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
			
            // Adding loading icon.
            $("#tarefa-" + id).attr("src", "img/loadingblack.gif");

			var data = {
				"dados[device]" : MM.deviceTypeLog,
                "dados[courseid]" : courseId,
                "dados[sectionid]" : sectionId,
				"dados[userid]" : MM.config.current_site.userid,
                "dados[id]" : id
            };
			
            MM.moodleWSextCall('local_start_get_course_content', data, function(contents) {
				// Removing loading icon.
                $("#tarefa-" + id).remove();
			
				var versaoandroid = device.version;
				versaoandroid = versaoandroid.replace(/\./g,'');
				if (versaoandroid<100) versaoandroid = versaoandroid +"0";
				versaoandroid = parseInt(versaoandroid);
				
				var tpl = {
					retorno: contents,
					course_modules: id,
					conteudo: decodeURIComponent(contents[0]["intro"]),
					resposta: decodeURIComponent(contents[0]["resposta"]),
					onlinetext: contents[0]["onlinetext"],
					file: contents[0]["file"],
					cutoffdate: contents[0]["cutoffdate"],
					ja_respondeu: contents[0]["ja_respondeu"],
					maxfile: contents[0]["maxfile"],
					role: contents[0]["role"],
					vandroid: versaoandroid
				};

				var pageTitle = contents[0]["name"];
				
				var html = MM.tpl.render(MM.plugins.contents.templates.content.html, tpl);
                MM.panels.show("right", html, {title: pageTitle});

                // Show info content modal window.
                $(".content-info", "#panel-right").on(MM.quickClick, function(e) {
                    MM.plugins.contents.infoContent(
                        e,
                        $(this).data("course"),
                        $(this).data("section"),
                        $(this).data("content"),
                       -1);
				});

                // Mod plugins should now that the page has been rendered.
                for (var pluginName in MM.plugins) {
                    var plugin = MM.plugins[pluginName];

                    if (plugin.settings.type == 'mod') {
                       var visible = true;
                       if (typeof(plugin.isPluginVisible) == 'function' && !plugin.isPluginVisible()) {
                            visible = false;
                        }
                       if (visible && typeof plugin.contentsPageRendered == "function") {
                            plugin.contentsPageRendered();
                        }
                    }
                }	
				
				if (versaoandroid >= 440){
					$("#uploadFileChooser").on("click", function(e) {
						e.stopImmediatePropagation();
						MM.popMessage("Função não disponível para esta versão de android."); 
					});
				}else{
					$("#uploadFileChooser").on("change", function(e) {
						e.preventDefault();
						var file = this.files[0];
						$(this).val('');
						if(file) {
							MM.plugins.upload.showUploadConfirmIfNeededContents(file);
						}
					});
				}
				
				// $("#btn-content-image").on("click", function() {
					// MM.plugins.contents.browseAlbums();
				// });	
				
				$("#btn-content-photo").on("click", function() {
					MM.plugins.contents.takeMedia();
				});	
				
				$("#form-tarefa-adicionar").on( "click", function() {
					var v_online = 0;
					var v_file  = 0;
					var checar  = 0;
					if($('#form-tarefa-resposta').length){
						v_online = 1;
					}
					if($('#form-arquivo-result').length){
						v_file = 1;
					}
					if (v_online == 1 & v_file == 1){
						if (($('#form-arquivo-result').val().length > 0) && ($('#form-tarefa-resposta').val().length > 0)){
							checar = 1;
						}
					}
					if (v_online == 1 & v_file == 0){
						if ($('#form-tarefa-resposta').val().length > 0){
							checar = 1;
						}
					}
					if (v_online == 0 & v_file == 1){
						if ($('#form-arquivo-result').val().length > 0){
							checar = 1;
						}
					}
					
					if (checar == 0){
						if ((versaoandroid >= 440) && (v_file == 1)){
							MM.popMessage("Para completar esta tarefa é necessário anexar um arquivo, porém sua versão do android não permite isso. Use a versão web."); 
						}else{
							MM.popMessageNoButton("Atenção, responda a tarefa adequadamente.");
						}
					}else{
						MM.popMessageNoButton("Resposta salva com sucesso. Voltando ao conteúdo do curso...");
						var data = {
							"dados[device]" : MM.deviceTypeLog,
							"dados[userid]" : MM.config.current_site.userid,
							"dados[courseid]" : courseId,
							"dados[course_modules]" : $("#form-tarefa-modules").val(),
							"dados[conteudo]" : $("#form-tarefa-resposta").val(),
							"dados[anexo]" : $("#form-arquivo-result").val()
						};
						MM.moodleWSextCall('local_start_save_course_content', data, function(contents) {
							if (contents=="salvo"){
								setTimeout(function(){
									MM.refresh(1);
									MM.panels.goBack();
								}, 500);
							}else{
								setTimeout(function(){
									MM.refresh(1);
									MM.popMessage("Erro ao salvar resposta.");
								}, 500);
							}
						});
					}
				});
            });
        },

        viewFolder: function(courseId, sectionId, contentId, sectionName) {

            var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);
            var content = MM.db.get("contents", MM.config.current_site.id + "-" + contentId);
            content = content.toJSON();

            if (typeof content.instance == "undefined") {
                content.instance = 0;
            }

            var data = {
            "options[0][name]" : "",
            "options[0][value]" : ""
            };
            data.courseid = courseId;

            var tpl = {
                course: course,
                sectionId: sectionId,
                courseId: courseId,
                contentId: contentId,
                content: content,
                sectionName: sectionName
            };

            var pageTitle = sectionName;
            var html = MM.tpl.render(MM.plugins.contents.templates.folder.html, tpl);
            MM.panels.show('right', html, {title: pageTitle});
            $(document).scrollTop(0);

            $("#download-all", "#panel-right").on(MM.quickClick, function(e) {
                MM.plugins.contents.downloadAll($(this).data("courseid"),
                                                $(this).data("sectionid"),
                                                $(this).data("contentid"));
            });

            // Show info content modal window.
            $(".content-info", "#panel-right").on(MM.quickClick, function(e) {

                MM.plugins.contents.infoContent(
                    e,
                    $(this).data("course"),
                    $(this).data("section"),
                    $(this).data("content"),
                    $(this).data("index"));
            });
			
        },

        infoContent: function(e, courseId, sectionId, contentId, index) {

            e.preventDefault();
            var i = {
                left: e.pageX - 5,
                top: e.pageY
            };

            if (MM.quickClick.indexOf("touch") > -1) {
                i.left = e.originalEvent.touches[0].pageX -5;
                i.top = e.originalEvent.touches[0].pageY;
            }

            var content = MM.db.get("contents", MM.config.current_site.id + "-" + contentId);
            content = content.toJSON();

            if (typeof(MM.plugins.contents.infoBox) != "undefined") {
                MM.plugins.contents.infoBox.remove();
            }

            var skipFiles = false;


            if (index === -1) {
                if (content.modname == "folder") {
                    skipFiles = true;
                }
                // Reset to a valid index.
                index = 0;
            }

            if (typeof(content.contents) == "undefined" || !content.contents[index]) {
                skipFiles = true;
            }

            var information = '<p><strong>'+content.name+'</strong></p>';
            if (typeof(content.description) != "undefined") {
                information += '<p>'+content.description+'</p>';
            }

            if (! skipFiles) {
                var file = content.contents[index];

                var fileParams = ["author", "license", "timecreated", "timemodified", "filesize", "localpath", "downloadtime"];
                if (MM.debugging) {
                    fileParams.push("localpath");
                }
                for (var el in fileParams) {
                    var param = fileParams[el];
                    if (typeof(file[param]) != "undefined" && file[param]) {
                        information += MM.lang.s(param)+': ';

                        var value = file[param];

                        switch(param) {
                            case "timecreated":
                            case "timemodified":
                            case "downloadtime":
                                var d = new Date(value * 1000);
                                value = d.toLocaleString();
                                break;
                            case "filesize":
                                value = file[param] / 1024;
                                // Round to 2 decimals.
                                value = Math.round(value*100)/100 + " kb";
                                break;
                            case "localpath":
                                var url = MM.fs.getRoot() + '/' + value;
                                value = '<a href="' + url + '" rel="external">' +url + '</a>';
                                break;
                            default:
                                value = file[param];
                        }

                        information += value + '<br />';
                    }
                }
            }

            information += '<p>' + MM.lang.s("viewableonthisapp") + ': ';

            if (content.webOnly && !MM.checkModPlugin(content.modname)) {
                information += MM.lang.s("no");
            } else {
                information += MM.lang.s("yes");
            }
            information += "</p>";

            information += '<p><a href="'+content.url+'" target="_blank">'+content.url+'</a></p>';

            MM.plugins.contents.infoBox = $('<div id="infobox-'+contentId+'"><div class="arrow-box-contents">'+information+'</div></div>').addClass("arrow_box");
            $('body').append(MM.plugins.contents.infoBox);

            var width = $("#panel-right").width() / 1.5;
            $('#infobox-'+contentId).css("top", i.top - 30).css("left", i.left - width - 35).width(width);

            // Android, open in new browser
            MM.handleExternalLinks('#infobox-'+contentId+' a[target="_blank"]');
            MM.handleFiles('#infobox-'+contentId+' a[rel="external"]');

            // Hide the infobox on click in any link or inside itselfs
            $('#infobox-'+contentId+', a').bind('click', function(e) {
                if (typeof(MM.plugins.contents.infoBox) != "undefined") {
                    MM.plugins.contents.infoBox.remove();
                }
            });

            // Hide the infobox on scroll.
            $("#panel-right").bind("touchmove", function(){
                if (typeof(MM.plugins.contents.infoBox) != "undefined") {
                    MM.plugins.contents.infoBox.remove();
                }
            });

        },

        getLocalPaths: function(courseId, modId, file) {

            var filename = file.fileurl;
            var paramsPart = filename.lastIndexOf("?");
            if (paramsPart) {
                filename = filename.substring(0, paramsPart);
            }
            filename = filename.substr(filename.lastIndexOf("/") + 1);

            filename = MM.fs.normalizeFileName(filename);

            // We store in the sdcard the contents in site/course/modname/id/contentIndex/filename
            var path = MM.config.current_site.id + "/" + courseId + "/" + modId;

            // Check if the file is in a Moodle virtual directory.
            if (file.filepath) {
                path += file.filepath;
                newfile = path + filename;
            } else {
                newfile = path + "/" + filename;
            }

            return {
                directory: path,
                file: newfile
            };
        },

        getModuleIcon: function(moduleName) {
            var mods = ["assign", "assignment", "book", "chat", "choice",
            "data", "database", "date", "external-tool", "feedback", "file",
            "folder", "forum", "glossary", "ims", "imscp", "label", "lesson",
            "lti", "page", "quiz", "resource", "scorm", "survey", "url", "wiki", "workshop"
            ];

            if (mods.indexOf(moduleName) < 0) {
                moduleName = "external-tool";
            }

            return "img/mod/" + moduleName + ".png";
        },

        downloadAll: function(courseId, sectionId, contentId, successCallback, errorCallback) {
            var content = MM.db.get("contents", MM.config.current_site.id + "-" + contentId);
            content = content.toJSON();

            if (!content.contents) {
                if (typeof errorCallback == "function") {
                    errorCallback();
                }
                return;
            }

            var filesToDownload = content.contents.length;
            var paths = [];

            var downloadedCallback = function(index, fullPath, filePath, downloadTime) {
                filesToDownload--;
                paths.push({
                    index: index,
                    fullPath: fullPath,
                    filePath: filePath,
                    downloadTime: downloadTime
                });
                if (!filesToDownload) {
                    var content = MM.db.get("contents", MM.config.current_site.id + "-" + contentId);
                    content = content.toJSON();

                    _.each(paths, function(path) {
                        content.contents[path.index].localpath = path.filePath;
                        content.contents[path.index].downloadtime = path.downloadTime;
                    });
                    MM.db.insert("contents", content);

                    if (typeof successCallback == "function") {
                        successCallback(paths);
                    }
                }
            };

            var notDownloadedCallback = function() {
                if (typeof errorCallback == "function") {
                    errorCallback();
                }
            };

            if (content.contents) {
                $.each(content.contents, function(index, file) {
                    setTimeout(function() {
                        // Do not download using background webworker.
                        MM.plugins.contents.downloadContentFile(courseId, sectionId, contentId, index, false,
                                                                    false, downloadedCallback, notDownloadedCallback);
                    }, 500 * index);
                });
            }
        },

        templates: {
            "folder": {
                html: folderTpl
            },
            "localizacao": {
                html: localizacaoTpl
            },
            "contents": {
                html: contentsTpl
            },
            "sections": {
                html: sectionsTpl
            },
            "content": {
                html: contentTpl
            },
            "mimetypes": JSON.parse(mimeTypes)
        }
    };

    MM.registerPlugin(plugin);
});