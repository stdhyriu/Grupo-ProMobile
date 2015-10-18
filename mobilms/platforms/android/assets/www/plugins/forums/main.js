var templates = [
    "root/externallib/text!root/plugins/forums/forums.html",
    "root/externallib/text!root/plugins/forums/discussions.html",
	"root/externallib/text!root/plugins/forums/posts.html",
	"root/externallib/text!root/plugins/forums/reply.html",
    "root/externallib/text!root/plugins/forums/lang/pt_br.json"
];

define(templates,function (forums, discussions, posts, reply, langStrings) {
    var plugin = {
        settings: {
            name: "forums",
            type: "course",
            menuURL: "#course/forums/",
            lang: {
                component: "local_start",
                strings: langStrings
            }
        },

        routes: [
            ["course/forums/:courseid", "course_view_forums", "viewForums"],
            ["course/forums/:courseid/:forumname/discussions/:forumid", "course_view_discussions", "viewDiscussions"],
			["course/forums/:courseid/:forumname/discussions/:forumid/posts/:discussionid", "course_view_posts", "viewPosts"],
			["course/forums/:courseid/:forumname/discussions/:forumid/posts/:discussionid/reply/:subject", "course_add_posts", "addPosts"]
        ],

        viewForums: function(courseId) {

            MM.panels.showLoading('center');

            if (MM.deviceType == "tablet") {
                MM.panels.html('right', '');
            }

            var data = {
				"device[0]" : MM.deviceTypeLog,
				"courseids[0]" : courseId
            };            

            MM.moodleWSextCall('local_start_get_forums_by_courses', data, function(contents) {
                var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);
				
				var pageTitle = MM.lang.s("forum","forums");

                var tpl = {
                    forums: contents,
                    course: course.toJSON() // Convert a model to a plain javascript object.
                }
                var html = MM.tpl.render(MM.plugins.forums.templates.forums.html, tpl);
                MM.panels.show("center", html, {title: pageTitle});
				
				if (MM.deviceType == "tablet" && contents.length > 0) {
                    // First section.
					//console.log(contents);
					//console.log(contents[0]["id"]);
                    MM.plugins.forums.viewDiscussions(courseId, encodeURIComponent(contents[0]["name"]), contents[0]["id"]);
                }
				
            });
        },

        viewDiscussions: function(courseId, forumName, forumId) {

            if (MM.deviceType == "tablet") {
                MM.panels.html('right', '');
            }

            var data = {
				"device[0]" : MM.deviceType,
				"device[1]" : forumId,
				"device[2]" : courseId,
				"forumids[0]" : forumId
            };            
            
            MM.moodleWSextCall('local_start_get_forum_discussions', data, function(contents) {
                var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);
				
				var pageTitle = MM.lang.s("forum","forums");
				
                var tpl = {
                    discussions: contents,
					forumId: forumId,
					forumName: decodeURIComponent(forumName),
                    course: course.toJSON() // Convert a model to a plain javascript object.
                }
                var html = MM.tpl.render(MM.plugins.forums.templates.discussions.html, tpl);
                MM.panels.show("right", html, {title: pageTitle});

				
            });
        },
        
        viewPosts: function(courseId, forumName, forumId, discussionId) {

            var data = {
				"device" : MM.deviceTypeLog,
				"courseId" : courseId,
				"forumId" : forumId,
				"discussionid" : discussionId
            };            
            
            MM.moodleWSextCall('local_start_get_forum_posts', data, function(contents) {
                var course = MM.db.get("courses", MM.config.current_site.id + "-" + courseId);

				var pageTitle = MM.lang.s("forum","forums");
				
                var tpl = {
                    posts: contents,
					forumName: decodeURIComponent(forumName),
                    course: course.toJSON(), // Convert a model to a plain javascript object.
					tcourseId: courseId,
					tforumId: forumId,
					tdiscussionId: discussionId,
					role: MM.config.role
                }
				
                var html = MM.tpl.render(MM.plugins.forums.templates.posts.html, tpl);
                MM.panels.html("right", html, {title: pageTitle});
            });
        },	
        
        addPosts: function(courseId, forumName, forumId, discussionId, subject) {
			subject = decodeURIComponent(subject);
			var res = subject.split("edit_");
			if (res.length > 1){
				
				var pageTitle = MM.lang.s("forum","forums");
				
				var tpl = {
					forumName: decodeURIComponent(forumName),
					tcourseId: courseId,
					tforumId: forumId,
					tdiscussionId: discussionId,
					tsubject: decodeURIComponent(subject)
				}
				var html = MM.tpl.render(MM.plugins.forums.templates.reply.html, tpl);
				MM.panels.html("right", html, {title: pageTitle});

				$("#form-reply-update").on( "click", function() {
					if ( $.trim($("#form-reply-resposta").val()).length <= 0){
						MM.popMessage("Por favor, preencha corretamente.");
					}else{
						MM.showModalLoading(MM.lang.s("salvando","forums"));
						
						var data = {
							"dados[device]" : MM.deviceTypeLog,
							"dados[userid]" : MM.config.current_site.userid,
							"dados[courseId]" : courseId,
							"dados[forumName]" : decodeURIComponent(forumName),
							"dados[forumId]" : forumId,
							"dados[discussionId]" : discussionId,
							"dados[id]" : parseInt(res[1]),
							"dados[resposta]" : $("#form-reply-resposta").val()
						};
						
						MM.moodleWSextCall('local_start_editar_forum', data, function(contents) {
							MM.refresh();
							MM.plugins.forums.viewPosts(courseId, forumName, forumId, discussionId);
						});	
					}
				});
			}else{
				
				var pageTitle = MM.lang.s("forum","forums");
				
				var tpl = {
					forumName: decodeURIComponent(forumName),
					tcourseId: courseId,
					tforumId: forumId,
					tdiscussionId: discussionId,
					tsubject: subject
				}
				
				var html = MM.tpl.render(MM.plugins.forums.templates.reply.html, tpl);
				MM.panels.html("right", html, {title: pageTitle});

				$("#form-reply-update").on( "click", function() {
					if ( $.trim($("#form-reply-resposta").val()).length <= 0){
						MM.popMessage("Por favor, preencha corretamente.");
					}else{
						MM.showModalLoading(MM.lang.s("salvando","forums"));
						
						var data = {
							"dados[device]" : MM.deviceTypeLog,
							"dados[userid]" : MM.config.current_site.userid,
							"dados[courseId]" : courseId,
							"dados[forumName]" : forumName,
							"dados[forumId]" : forumId,
							"dados[discussionId]" : discussionId,
							"dados[subject]" : subject,
							"dados[resposta]" : $("#form-reply-resposta").val()
						};
						MM.moodleWSextCall('local_start_responder_forum', data, function(contents) {
							MM.refresh();
							//MM.plugins.forums.viewPosts(courseId, forumName, forumId, discussionId);
							MM.panels.goBack();
						});	
					}
				});
			}
        },		
		
        templates: {
            "forums": {
                html: forums
            },
            "discussions": {
                html: discussions
            },
            "posts": {
                html: posts
            },
            "reply": {
                html: reply
            }
        }
    }

    MM.registerPlugin(plugin);
});