/*
#get user ip address
/REST

/REST/get

/REST/user/create
/REST/user/authenticate
/REST/user/delete
/REST/user/update

/REST/key/list
/REST/key/create
/REST/key/update
/REST/key/delete


/REST/traffic

user->
	{
	email
	password
	active

key->
	{
	key
	sites
	active

traffic->
	day
		{ key-site
			requests
*/
var limit = 5000;

var mongoose = require('mongoose');
var sha1 = require("sha1");

mongoose.connect('localhost', 'jsIPService');

var keySchema = mongoose.Schema({
	key: String,
	sites: [String],
	active: Boolean,
	dailyLimit: Number
});

var userSchema = mongoose.Schema({
	email: String,
	password: String,
	active: Boolean,
	keys:  [keySchema]
});

var User = mongoose.model('User', userSchema);
var Key = mongoose.model('Key',keySchema);

function getIp(req, res) {
	res.jsonp({
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
	});
}

function createUser(req,res) {
	var email = req.query.email;
	var pass = req.query.password;

	if (!email || !pass) {
		error(res, 'Must supply email and password');
	}

	User.find({email: email},function(err,result){
		if (result.length) {
			error(res,'Email already in use.');
			return;
		}
		var u = new User();
		u.email = email;
		u.password = pass;
		u.active = true;
		u.save();
		success(res);
	});
}

function authenticateUser(req,res){
	var email = req.query.email;
	var pass = req.query.password;

	authenticate(
		email,
		pass,
		function() {
			success(res);
		},
		function() {
			error(res,'Invalid email or password, or account is disabled');
		}
	);
}

function updateUser(req,res) {
	var email = req.query.email;
	var pass = req.query.password;
	var newPass = req.query.newPassword;
	var active = req.query.active === 'true' ? true : false;

	authenticate(
		email,
		pass,
		function(user) {
			if (newPass) {
				user.password = newPass;
			}
			if (typeof active !== 'undefined') {
				user.active = active;
			}
			user.save(function(err){
				success(res);
			});
		},
		function() {
			error(res,'Invalid email or password, or account is disabled');
		}
	);
}

function deleteUser(req,res) {
	var email = req.query.email;
	var pass = req.query.password;

	authenticate(
		email,
		pass,
		function(user) {
			user.active = false;
			user.save(function(err){
				success(res);
			});
		},
		function() {
			error(res,'Invalid email or password, or account is disabled');
		}
	);
}

function listKeys(req,res) {
	var email = req.query.email;
	var pass = req.query.password;

	authenticate(
		email,
		pass,
		function(user) {
			success(res,user.keys);
		},
		function() {
			error(res,'Invalid email or password, or account is disabled');
		}
	);
}

function createKey(req,res) {
	var email = req.query.email;
	var pass = req.query.password;
	var sites = req.query.sites;

	authenticate(
		email,
		pass,
		function(user) {
			var ts = new Date();
			var key = sha1(ts.getTime());

			var k = new Key();
			k.key = key;
			k.active = true;
			k.dailyLimit = limit;
			if (sites) {
				k.sites = sites.split(',');
			}

			user.keys.push(k);
			user.save(function() {
				success(res,{
					key: k.key,
					sites: k.sites,
					active: k.active,
					dailyLimit: k.dailyLimit
				});
			});
		},
		function() {
			error(res,'Invalid email or password, or account is disabled');
		}
	);
}

function updateKey(req,res) {
	var email = req.query.email;
	var pass = req.query.password;
	var modifyKey = req.query.key;

	var sites = req.query.sites;
	var active = req.query.active;

	authenticate(
		email,
		pass,
		function(user) {
			var updatedKey;
			user.keys.forEach(function(key,i){
				if (key.key === modifyKey) {
					if (!key.active) {
						error(res,'Key is not active.');
						return;
					}
					if (sites) {
						key.sites = sites.split(',');
					}
					if (typeof active !== 'undefined') {
						key.active = active;
					}
					updatedKey = key;
				}
			});
			if (updatedKey) {
				user.save(function() {
					success(res,{
						key: updatedKey.key,
						sites: updatedKey.sites,
						active: updatedKey.active,
						dailyLimit: updatedKey.dailyLimit
					});
				});
			}
		},
		function() {
			error(res,'Invalid email or password, or account is disabled');
		}
	);
}

function deleteKey(req,res) {
	req.query.active = false;
	updateKey(req,res);
}

function authenticate(email, pass, success, fail) {
	if (!email || !pass) {
		fail();
	}
	User.find({ email: email, password:pass, active: true },function(err,result){
		if (result.length) {
			success(result[0]);
			return;
		}
		fail();
	});
}

function error(res,msg) {
	res.json({
		success: false,
		msg: msg
	});
}

function success(res,data) {
	var obj = {
		success: true
	};
	if (data) { obj.data = data; }

	res.json(obj);
}

module.exports = {
	user: {
		create: createUser,
		authenticate: authenticateUser,
		update: updateUser,
		delete: deleteUser
	},
	keys: {
		list: listKeys,
		create: createKey,
		update: updateKey,
		delete: deleteKey
	},
	getIp: getIp
};