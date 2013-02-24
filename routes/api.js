/*
 * Serve JSON
 */

exports.getIp = function(req, res) {
	res.jsonp({
		ip: req.connection.remoteAddress
	});
};