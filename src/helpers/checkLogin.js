module.exports = (req, res, next) => {
	if (req.session.accessKey == null) {
		return res.status(401).json({message: 'unauthorized'});
	}

	next();
};
