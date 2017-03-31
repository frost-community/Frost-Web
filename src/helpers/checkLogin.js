module.exports = (req, res, next) => {
	if (req.session.accessKey == null)
		res.status(401).send('unauthorized');

	next();
};
