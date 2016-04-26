Stateless SQRL Service
======================

A simple microservice that can process stateless SQRL login requests.

## Routes

Generate a unique QR code for logging in

```
GET /generate
```

The redirected route that the QR code will point to

```
GET /validate
```

Register a new device with the user by setting a temporary access cookie

```
GET /register
```

## How it works

- Before the QR authentication will work the user must download the access cookie. This can be done by making a request
to the `/register` route
- The server makes a GET request to a external server that will supply user token data
- The server then encrypts the user data into a JWT and stores it as a cookie on the client
- After the cookie is stored on the users device subsequent QR scans will use it for authentication
- The user scans a one-time temporary QR code from the `/generate` route
- After that the client is redirected to the `/validate` route
- The server will make another request to an external server to verify the user credentials in the token are valid

