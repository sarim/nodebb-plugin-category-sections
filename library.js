"use strict";

var plugin = {},
	emitter = module.parent.require('./emitter'),
	templates = module.parent.require('templates.js'),
	SocketPlugins = module.parent.require('./socket.io/plugins'),
	user = module.parent.require('./user'),
	db = module.parent.require('./database'),
	controllers;

plugin.init = function(params, callback) {
	var app = params.router,
		middleware = params.middleware;

	controllers = params.controllers;

	app.get('/admin/plugins/category-sections', middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin/plugins/category-sections', renderAdmin);

	SocketPlugins['category-sections'] = {};
	SocketPlugins['category-sections'].save = function(socket, data, callback) {
		user.isAdministrator(socket.uid, function(err, isAdmin) {
			if (isAdmin) {
				saveSections(data, callback);
			}
		});
	};

  callback();
  // modifyCategoryTpl(callback);
};

plugin.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/category-sections',
		icon: 'fa-folder-open-o',
		name: 'Category Sections'
	});

	callback(null, header);
};

plugin.getCategories = function(params, callback) {
	getCategories(params, function(err, data) {
		params.res.render('sections', data.data);
	});
};

function saveSections(data, callback) {
	db.set('plugins:category-sections:sections', JSON.stringify(data), callback);
}

function renderAdmin(req, res, next) {
	getCategories({
		req: req,
		res: res
	}, function(err, data) {
		res.render('admin/plugins/category-sections', data);
	});
}

function getCategories(params, callback) {
	function getSections(tpl, data) {
		db.get('plugins:category-sections:sections', function(err, sections) {
			if (err) {
				return callback(err);
			}

			sections = (sections && sections.length) ? sections : [];
			
			// for legacy
			sections = (typeof sections === 'string') ? JSON.parse(sections) : sections;
			

			var categories = data.categories,
				sectioned = [];

			delete data.categories;
			data.uncategorized = [];

			sections.forEach(function(section) {
				section.categories = [];

				section.cids.forEach(function(cid) {
					for (var c in categories) {
						if (categories.hasOwnProperty(c)) {
							if (parseInt(cid, 10) === parseInt(categories[c].cid, 10)) {
								section.categories.push(categories[c]);
								sectioned.push(parseInt(categories[c].cid, 10));
								break;
							}
						}
					}
				});
			});

			categories.forEach(function(category, idx) {
				if (sectioned.indexOf(parseInt(category.cid, 10)) === -1) {
					data.uncategorized.push(category);
				}
			});

			res.locals.metaTags = override.locals.metaTags;
			data.sections = sections;
			callback(null, {
				tpl: tpl,
				data: data
			});
		});
	}

	var req = params.req,
		res = params.res,
		override = { // a fake res object to trick the controller
			locals: {},
			render: getSections
		};

	controllers.categories.list(req, override, params.next);
}

module.exports = plugin;
