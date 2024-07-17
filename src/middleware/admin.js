const adminMiddleware = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(401).send('Unauthorized accessss!')
    }
    next()
}

module.exports = adminMiddleware
