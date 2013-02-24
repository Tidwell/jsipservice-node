/*
 * Serve JSON
 */

exports.getIp = function(req, res) {
	res.jsonp({
		ip: req.headers['X-Forwarded-For']
	});
};