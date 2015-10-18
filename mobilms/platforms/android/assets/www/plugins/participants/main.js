var templates = [
    "root/externallib/text!root/plugins/participants/participants.html",
    "root/externallib/text!root/plugins/participants/participant.html",
    "root/externallib/text!root/plugins/participants/participant_ed.html",
    "root/externallib/text!root/plugins/participants/participants_row.html",	
    "root/externallib/text!root/plugins/participants/lang/pt_br.json"
];

define(templates,function (participantsTpl, participantTpl, participantedTpl, participantsRowTpl) {
    var plugin = {
        settings: {
            name: "participants",
            type: "course",
            menuURL: "#participants/",
            lang: {
                component: "core"
            },
            icon: ""
        },

        storage: {
            participant: {type: "model"},
            participants: {type: "collection", model: "participant"}
        },

        routes: [
            ["participants/:courseId", "participants", "showParticipants"],
            ["participant/:courseId/:userId", "participants", "showParticipant"],
            ["participant/:courseId/:userId/:popup", "participants_pop", "showParticipant"],
        ],

        limitNumber: 100,

        showParticipants: function(courseId) {
            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
            // Adding loading icon.
            $('a[href="#participants/' +courseId+ '"]').addClass('loading-row');

            MM.plugins.participants._loadParticipants(courseId, 0, MM.plugins.participants.limitNumber,
                function(users) {
                    // Removing loading icon.
                    $('a[href="#participants/' +courseId+ '"]').removeClass('loading-row');

                    var showMore = true;
                    if (users.length < MM.plugins.participants.limitNumber) {
                        showMore = false;
                    }

                    MM.plugins.participants.nextLimitFrom = MM.plugins.participants.limitNumber;

					var rndpic = Math.floor((Math.random() * 100000) + 1); 
                    var tpl = {
                        users: users,
                        deviceType: MM.deviceTypeLog,
                        courseId: courseId,
                        showMore: showMore,
                        rnd: rndpic
                    };
					//console.log(JSON.stringify(users));
                    var html = MM.tpl.render(MM.plugins.participants.templates.participants.html, tpl);

                    var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);
                    var pageTitle = course.get("shortname") + " - " + MM.lang.s("participants");

                    MM.panels.show('center', html, {title: pageTitle});
                    // Load the first user
                    if (MM.deviceType == "tablet" && users.length > 0) {
                        $("#panel-center li:eq(0)").addClass("selected-row");
                        MM.plugins.participants.showParticipant(courseId, users.shift().id);
                        $("#panel-center li:eq(0)").addClass("selected-row");
                    }
					
					// filtro
					$('#form-participants-procurar').keyup(function(){					
						var valThis = $(this).val().toLowerCase();
						$('#list-participants>li').each(function(){
							var text = $.trim($(this).text().toLowerCase());
							(text.indexOf(valThis) == 0) ? $(this).show() : $(this).hide();            
						});
						$('#participants-additional>li').each(function(){
							var text = $.trim($(this).text().toLowerCase());
							(text.indexOf(valThis) == 0) ? $(this).show() : $(this).hide();            
						});
					});					
					
                    // Show more button.
                    $("#participants-showmore").on(MM.clickType, function(e) {
                        var that = $(this);
                        $(this).addClass("loading-row-black");

                        MM.plugins.participants._loadParticipants(
                            courseId,
                            MM.plugins.participants.nextLimitFrom,
                            MM.plugins.participants.limitNumber,
                            function(users) {
                                that.removeClass("loading-row-black");
                                MM.plugins.participants.nextLimitFrom += MM.plugins.participants.limitNumber;

                                var tpl = {courseId: courseId, users: users, rnd: rndpic};
                                var newUsers = MM.tpl.render(MM.plugins.participants.templates.participantsRow.html, tpl);
                                $("#participants-additional").append(newUsers);
                                if (users.length < MM.plugins.participants.limitNumber) {
                                    that.css("display", "none");
                                }
                            },
                            function() {
                                that.removeClass("loading-row-black");
                            }
                        );
                    });

                }, function(m) {
                    // Removing loading icon.
                    $('a[href="#participants/' +courseId+ '"]').removeClass('loading-row');
                    if (typeof(m) !== "undefined" && m) {
                        MM.popErrorMessage(m);
                    }
                }
            );
        },

        _loadParticipants: function(courseId, limitFrom, limitNumber, successCallback, errorCallback) {
            var data = {
                "courseid" : courseId,
                "options[0][name]" : "limitfrom",
                "options[0][value]": limitFrom,
                "options[1][name]" : "limitnumber",
                "options[1][value]": limitNumber,
            };

            MM.moodleWSCall('moodle_user_get_users_by_courseid', data, function(users) {
                successCallback(users);
            }, null, function(m) {
                errorCallback(m);
            });
        },

        showParticipant: function(courseId, userId, popUp) {
            popUp = popUp || false;

            var menuEl = 'a[href="#participant/' + courseId + '/' + userId + '"]';
            $(menuEl, '#panel-center').addClass('loading-row-black');

            var data = {
                "userlist[0][userid]": userId,
                "userlist[0][courseid]": courseId
            };
            MM.moodleWSCall('moodle_user_get_course_participants_by_id', data, function(users) {
                // Load the active user plugins.

                var userPlugins = [];
                for (var el in MM.plugins) {
                    var plugin = MM.plugins[el];
                    if (plugin.settings.type == "user") {
						if (typeof(plugin.isPluginVisible) == 'function' && !plugin.isPluginVisible()) {
							continue;
						}
						if (plugin.settings.name == "addnote"){
							if (MM.config.role<=4){
								userPlugins.push(plugin.settings);
							}
						}else{
							userPlugins.push(plugin.settings);
						}
                    }
                }

                var newUser = users.shift();

                var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);
                var pageTitle = course.get("shortname") + " - " + MM.lang.s("participants");

                var tpl = {
                    "user": newUser,
                    "plugins": userPlugins,
                    "courseid": courseId,
                    "popUp": popUp
                };

				if (MM.config.role<=4){
					var html = MM.tpl.render(MM.plugins.participants.templates.participanted.html, tpl);
				}else{
					var html = MM.tpl.render(MM.plugins.participants.templates.participant.html, tpl);
				}
                newUser.id = MM.config.current_site.id + "-" + newUser.id;
                MM.db.insert("users", newUser);

                $(menuEl, '#panel-center').removeClass('loading-row-black');
                MM.panels.show('right', html, {title: pageTitle});
            });
        },

        /**
         * Check if we can show the grades button for this user.
         * @param  {integer} courseId The course id
         * @param  {integer} userId   The user Id
         * @return {boolean}          True or false
         */
        _showGrades: function(courseId, userId) {
            if (MM.plugins.grades.wsName == 'local_mobile_gradereport_user_get_grades_table') {
                return true;
            }
            return false;
        },

        templates: {
            "participant": {
                model: "participant",
                html: participantTpl
            },
            "participanted": {
                model: "participanted",
                html: participantedTpl
            },
            "participants": {
                html: participantsTpl
            },
            "participantsRow": {
                html: participantsRowTpl
            }
        }
    }

    MM.registerPlugin(plugin);
});