'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const http = require('http');
const QRCode = require('qrcode-npm');
const uuid = require('uuid');

const server = new Hapi.Server();

function createQRCode(data) {
    var qr = QRCode.qrcode(8, 'M');
    qr.addData(data);
    qr.make();
    return qr.createImgTag(4);
}

function buildUserURL(username) {
    return process.env.USER_REQUEST_URL + "?username=" + username + "&request_token=" + process.env.USER_REQUEST_TOKEN;
}

function buildValidationURL(username, token) {
    return process.env.USER_VALIDATE_URL + "?username=" + username + "&access_token=" + token;
}

function makeRequest(url, next) {
    http.get(url, function(response) {
        response.on('data', function(data) {
            next(null, data);
        });
    }, function(error) {
       next(error); 
    });
}

function findUser(username, next) {
    makeRequest(buildUserURL(username), next);
}

function validateUser(username, token, next) {
    makeRequest(buildValidationURL(username, token), next);
}

server.connection({ port: 8080 });

server.state('user', {
    ttl: 24 * 60 * 60 * 1000,
    isSecure: false,
    isHttpOnly: true,
    strictHeader: true,
    clearInvalid: true,
    encoding: 'iron',
    password: uuid.v4()
    //domain: "localhost"
});

server.route({
    method: 'GET',
    path: '/generate/login',
    handler: function(request, reply) {
        var nonce = new Buffer(uuid.v4() + ":" + (new Date()).getTime()).toString("base64");
        //var url = "http://192.168.1.70:8080/validate?nonce=" + nonce;
        var url = request.server.info.uri + "/validate?nonce=" + nonce;
        reply(createQRCode(url));
    },
    config: {
        state: {
            parse: false,
            failAction: 'ignore'
        }
    }
});

server.route({
    method: 'GET',
    path: '/generate/register/{username}',
    handler: function(request, reply) {
        var nonce = new Buffer(uuid.v4() + ":" + (new Date()).getTime()).toString("base64");
        //var url = "http://192.168.1.70:8080/register?username=" + request.params.username + "&nonce=" + nonce;
        var url = request.server.info.uri + "/register?username=" + request.params.username + "&nonce=" + nonce;
        reply(createQRCode(url));
    },
    config: {
        state: {
            parse: false,
            failAction: 'ignore'
        }
    }
});

server.route({
    method: 'GET',
    path: '/validate',
    handler: function(request, reply) {
        var user = JSON.parse(new Buffer(request.state.user).toString());
        validateUser(user.username, user.access_token, function(error, isApproved) {
            if (error) {
                reply(error).code(400);
                return;
            }

            if ("OK" === isApproved.toString()) {
                reply("You are logged in!").redirect(process.env.REDIRECT_URL);
                return;
            }
            reply("Not found").code(404);
        });
    },
    config: {
        state: {
            parse: true,
            failAction: 'error'
        }
    }
});

server.route({
    method: 'GET',
    path: '/register',
    handler: function(request, reply) {
        findUser(request.query.username, function(error, user) {
            if (error) {
                reply(error).code(400);
                return;
            }
            reply("Device Synced!").state('user', user);
        });
    },
    config: {
        validate: {
            query: {
                username: Joi.string(),
                nonce: Joi.string()
            }
        },
        state: {
            parse: true,
            failAction: 'error'
        }
    }
});

server.route({
    method: 'GET',
    path: '/info',
    handler: function(request, reply) {
        var user = JSON.parse(new Buffer(request.state.user).toString());
        reply(user)
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

