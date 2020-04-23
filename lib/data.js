// for storing and editing data

var fs = require('fs');
var path = require('path');

var lib = {};


lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function (dir, file, data, callback) {

    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {

            var stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {

                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false) //because callback expects an error, hence a false value means no error 
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
            })
        } else {
            callback('Could not create new file, it may already exist')
        }
    })
}

lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        callback(err, data)
    })
}



module.exports = lib