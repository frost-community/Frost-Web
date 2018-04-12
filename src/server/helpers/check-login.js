/**
 * ログイン状態を確認するためのミドルウェアです。
 */
module.exports = (req, res, next) => {
	if (req.session.accessToken == null) {
		return res.status(401).json({ message: 'unauthorized' });
	}

	next();
};
