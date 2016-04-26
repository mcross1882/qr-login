'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const uuid = require('uuid');

const server = new Hapi.Server();

server.connection({ port: 8888 });

var users = [
    {
        id: 50,
        username: "jdoe",
        email: "johndoe@email.com",
        password: "ABC123!"
    }
];

server.route({
    method: 'GET',
    path: '/users',
    handler: function(request, reply) {
        for (var index in users) {
            if (request.query.username === users[index].username) {
                users[index].access_token = uuid.v4();
                reply(users[index]);
                return;
            }
            reply({message: "Could not find user " + request.query.username});
        }
    },
    config: {
        validate: {
            query: {
                username: Joi.string(),
                request_token: Joi.string()
            }
        }
    }
});

server.route({
    method: 'GET',
    path: '/authenticate',
    handler: function(request, reply) {
        for (var index in users) {
            if (
                request.query.username == users[index].username
                && request.query.access_token == users[index].access_token
            ) {
                reply("OK");
                return;
            }
        }
        reply("Not found").code(404);
    },
    config: {
        validate: {
            query: {
                username: Joi.string(),
                access_token: Joi.string()
            }
        }
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

