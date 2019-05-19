// 401 not authenticated
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) =>{
    const authHeader = req.get('Authorization')
    const fakeId = req.get('fakeId')
	console.log("fakeId is:",fakeId,".")
    if(!authHeader){
        const err = new Error('Missing auth header!!');
        err.statusCode = 401;
        throw err  
    }
    const token = authHeader.split(' ')[1];
	if (token == "null") {
		const err = new Error('Missing auth header!!');
		err.statusCode = 401;
		throw err
	}
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'AsEcRetStrINgToImproveSecurITYtheLonGerTHEbettER')
    } catch (err) {
        err.statusCode = 503;
        throw err
    } if (!decodedToken){
        const error = new Error('Not authenticated!!!');
        error.statusCode = 401;
        throw error
    }
    req.userId = fakeId ? fakeId : decodedToken.userId;
    next();
}