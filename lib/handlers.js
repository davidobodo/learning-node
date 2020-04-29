var _data = require('./data');
var helpers = require('./helpers');


var handlers = {};

handlers._users = {};

handlers._users.post = function (data, callback) {

    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {

        _data.read('users', phone, function (err, data) {
            if (err) {
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    }

                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create new user' })
                        }
                    })
                } else {
                    callback(500, { 'Error': 'Could not hash user\'s password' })
                }



            } else {
                callback(400, { 'Error': 'A user with that phone number already exists' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }

}

handlers._users.get = function (data, callback) {

}

handlers._users.put = function (data, callback) {

}

handlers._users.delete = function (data, callback) {

}

handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405)
    }
}

handlers._tokens = {};

handlers._tokens.post = function (data, callback) {
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {

        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {


                //i refactored this section
                var _userData = helpers.parseJsonToObject(userData)

                var hashedPassword = helpers.hash(password);

                if (hashedPassword == _userData.hashedPassword) {

                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 3600;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    }

                    _data.create('tokens', tokenId, tokenObject, function (err) {
                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, { 'Error': 'Could not create the new token' })
                        }
                    })

                } else {
                    callback(400, { 'Error': 'Password did not match the specified user\'s stored password' })
                }

            } else {
                callback(400, { 'Error': 'Could not find specified user' })
            }
        })

    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }

}

handlers._tokens.get = function (data, callback) {

    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        console.log(id)

        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData)
            } else {
                callback(404);
            }
        })

    } else {
        callback(400, { 'Error': 'Missing required field, or field invalid' })
    }
}
handlers._tokens.put = function (data, callback) {

}
handlers._tokens.delete = function (data, callback) {

}

handlers.tokens = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405)
    }
}

handlers.ping = function (data, callback) {
    callback(200)
}

handlers.notFound = function (data, callback) {
    callback(404)
}

module.exports = handlers