/*
 * Serve JSON
 */

exports.getIp = function(req, res) {
	res.jsonp({
		ip: req.headers['HTTP_X_FORWARDED'] || req.connection.remoteAddress
	});
};