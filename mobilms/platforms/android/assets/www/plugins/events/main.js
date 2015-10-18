var templates = [
    "root/externallib/text!root/plugins/events/events.html",
    "root/externallib/text!root/plugins/events/event.html",
    "root/externallib/text!root/plugins/events/event_ed.html"
];

define(templates, function (eventsTpl, eventTpl, eventendTpl) {
    var plugin = {
        settings: {
            name: "events",
            type: "general",
            icon: "plugins/events/icon.png",
            menuURL: "#events/90",
            lang: {
                component: "core"
            }
        },

        routes: [
            ["events/:days", "show_events", "showEvents"],
            ["events/show/:id/:rel", "show_event", "showEvent"]
        ],

        // This is like a static variable where we store the last Events retrieved in JSON format.
        lastEvents: null,

        /**
         * Determines is the plugin is visible.
         * It may check Moodle remote site version, device OS, device type, etc...
         * This function is called when a alink to a plugin functinality is going to be rendered.
         *
         * @return {bool} True if the plugin is visible for the site and device
         */
        isPluginVisible: function() {
            return MM.util.wsAvailable('core_calendar_get_calendar_events') ||
                    MM.util.wsAvailable('local_mobile_core_calendar_get_calendar_events');
        },
		
		_getCalendarEventsSuccesBKP: function(response, days) {
            var daysIncrement = 90;
            var pageTitle = MM.lang.s("events") + "  " + days + " " + MM.lang.s("days");

            MM.plugins.events.lastEvents = typeof(response.events !== "undefined")? response.events : [];

            var d;
            // Formatting.
            for (var el in MM.plugins.events.lastEvents) {
                var event = MM.plugins.events.lastEvents[el];

                d = new Date(event.timestart * 1000);
                event.startdate = d.toLocaleDateString();
                event.starttime = MM.util.toLocaleTimeString(d, MM.lang.current, {hour: '2-digit', minute:'2-digit'});

                if (event.timeduration) {
                    d = new Date((event.timestart + event.timeduration) * 1000);
                    event.enddate = d.toLocaleDateString();
                    event.endtime = MM.util.toLocaleTimeString(d, MM.lang.current, {hour: '2-digit', minute:'2-digit'});
                } else {
                    event.enddate = 0;
                    event.endtime = 0;
                }

                MM.plugins.events.lastEvents[el] = event;
            }

            // Removing loading icon.
            $('a[href="' + MM.plugins.events.settings.menuURL + '"]', '#panel-left').removeClass('loading-row');

            var tpl = {events: MM.plugins.events.lastEvents};

            var html = MM.tpl.render(MM.plugins.events.templates.events.html, tpl);

            if (MM.deviceType == "tablet" && MM.plugins.events.lastEvents.length > 0) {
                MM.panels.show('center', html, {title: pageTitle});
            } else  {
                if (MM.deviceType == "tablet") {
                    MM.panels.show('center', html, {title: pageTitle, hideRight: true});
                } else {
                    MM.panels.show('center', html, {title: pageTitle});
                }
            }

            $("#events-showmore").on(MM.clickType, function(e) {
                MM.plugins.events.showEvents(days + daysIncrement);
            });
            // Load the first event.
            if (MM.deviceType == "tablet" && MM.plugins.events.lastEvents.length > 0) {
                $("#panel-center li:eq(0)").addClass("selected-row");
                MM.plugins.events.showEvent(0);
                $("#panel-center li:eq(0)").addClass("selected-row");
            }

        },
		
		_getCalendarEventsSucces: function(response, days) {
            var daysIncrement = 90;
            var pageTitle = MM.lang.s("events") + "  " + days + " " + MM.lang.s("days");

            MM.plugins.events.lastEvents = typeof(response.events !== "undefined")? response.events : [];

            var d;
            // Formatting.
            for (var el in MM.plugins.events.lastEvents) {
                var event = MM.plugins.events.lastEvents[el];

                event.startdate = MM.util.dtMomentTSDate(event.timestart);
                event.starttime = MM.util.dtMomentTShour(event.timestart);

                if (event.timeduration) {
                    d = new Date((event.timestart + event.timeduration) * 1000);
                    event.enddate = d.toLocaleDateString();
                    event.endtime = MM.util.toLocaleTimeString(d, MM.lang.current, {hour: '2-digit', minute:'2-digit'});
                } else {
                    event.enddate = 0;
                    event.endtime = 0;
                }

                MM.plugins.events.lastEvents[el] = event;
            }

            // Removing loading icon.
            $('a[href="' + MM.plugins.events.settings.menuURL + '"]', '#panel-left').removeClass('loading-row');

            var tpl = {events: MM.plugins.events.lastEvents};

            var html = MM.tpl.render(MM.plugins.events.templates.events.html, tpl);

            if (MM.deviceType == "tablet" && MM.plugins.events.lastEvents.length > 0) {
                MM.panels.show('center', html, {title: pageTitle});
            } else  {
                if (MM.deviceType == "tablet") {
                    MM.panels.show('center', html, {title: pageTitle, hideRight: true});
                } else {
                    MM.panels.show('center', html, {title: pageTitle});
                }
            }

            $("#events-showmore").on(MM.clickType, function(e) {
                MM.plugins.events.showEvents(days + daysIncrement);
            });
            // Load the first event.
            if (MM.deviceType == "tablet" && MM.plugins.events.lastEvents.length > 0) {
                $("#panel-center li:eq(0)").addClass("selected-row");
                MM.plugins.events.showEvent(0);
                $("#panel-center li:eq(0)").addClass("selected-row");
            }

        },

        _getCalendarEventsFailure: function(m) {
            // Removing loading icon.
            $('a[href="' + MM.plugins.events.settings.menuURL + '"]', '#panel-left').removeClass('loading-row');
            if (typeof(m) !== "undefined" && m) {
                MM.popErrorMessage(m);
            }
        },

        /**
         * Display global and course events for all the user courses
         * TODO: Support groups events also
         *
         * @param  {integer} days The number of days for displaying events starting today
         */
        showEvents: function(days) {
            MM.panels.showLoading('center');

            days = parseInt(days, 10);

            if (MM.deviceType == "tablet") {
                MM.panels.showLoading('right');
            }
            // Adding loading icon.
            $('a[href="' + MM.plugins.events.settings.menuURL + '"]', '#panel-left').addClass('loading-row');

            MM.plugins.events._getEvents(
                days,
                null,
                function(r) {
                    MM.plugins.events._getCalendarEventsSucces(r, days);
                },
                MM.plugins.events._getCalendarEventsFailure
            );
        },

        /**
         * Displays a single event information
         *
         * @param  {integer} eventId The index position in the original events array retrieved.
         */
        showEvent: function(eventId, relId) {
            var pageTitle = MM.lang.s("events");

            if (typeof(MM.plugins.events.lastEvents[eventId]) != "undefined") {
                var fullEvent = MM.plugins.events.lastEvents[eventId];
                var course = MM.db.get("courses", MM.config.current_site.id + "-" + fullEvent.courseid);
                if (course) {
                    fullEvent.courseName = MM.util.formatText(course.get("fullname"));
                }
                var tpl = {"event": fullEvent,"relId": relId};
				if (MM.config.role<=4){
					var html = MM.tpl.render(MM.plugins.events.templates.event_ed.html, tpl);
				}else{
					var html = MM.tpl.render(MM.plugins.events.templates.event.html, tpl);
				}

                var title = '<div class="media"><div class="img"><img src="img/event-' + fullEvent.eventtype + '.png"></div>';
                title += '<div class="bd">' + MM.util.formatText(fullEvent.name) + '</div></div>';

                MM.panels.show('right', html, {title: title});
				
				$('#form-event-date').mask("00/00/0000 00:00", {placeholder: "__/__/____ __:__"});
				$("#form-event-update").on( "click", function() {
					MM.showModalLoading("Salvando...");
					
					var data = {
						"dados[device]" : MM.deviceTypeLog,
						"dados[relid]" : parseInt($("#form-event-id").val()),
						"dados[eventname]" : $("#form-event-name").val(),
						"dados[eventdate]" : $("#form-event-date").val()
					};
					MM.moodleWSextCall('local_start_event_save', data, function(contents) {
						setTimeout(function(){
							MM.refresh(1);
							MM.popMessage("Dados salvos com sucesso.");
						}, 500);
					});	 
				});
            }
        },

        _getEvents: function(days, settings, successCallback, errorCallback) {
            settings = settings || null;
            // The core_calendar_get_calendar_events needs all the current user courses and groups.
            var params = {
                "options[userevents]": 1,
                "options[siteevents]": 1,
                "options[timestart]": MM.util.timestamp(),
                "options[timeend]": MM.util.timestamp() + (MM.util.SECONDS_DAY * days)
            };

            var courses = MM.db.where("courses", {siteid: MM.config.current_site.id});
            $.each(courses, function(index, course) {
                params["events[courseids][" + index + "]"] = course.get("courseid");
            });

            var wsFunction = "core_calendar_get_calendar_events";
            if (!MM.util.wsAvailable(wsFunction)) {
                wsFunction = 'local_mobile_core_calendar_get_calendar_events';
            }

            MM.moodleWSCall(wsFunction,
                params,
                function(r) {
                    successCallback(r);
                },
                settings,
                errorCallback
            );
        },

        checkLocalNotifications: function() {
            MM.plugins.events._getEvents(
                30,
                {
                    getFromCache: false,
                    saveToCache: true
                },
                function() {},
                function() {}
            );
        },

        templates: {
            "event": {
                html: eventTpl
            },
            "event_ed": {
                html: eventendTpl
            },
            "events": {
                html: eventsTpl
            }
        }

    };

    MM.registerPlugin(plugin);

});