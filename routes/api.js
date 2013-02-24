/*
 * Serve JSON
 */

exports.getIp = function(req, res) {
	res.jsonp({
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
	});
};