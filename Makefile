start-account-server:
	node test/accountservice.js

start-server:
	USER_REQUEST_URL=http://localhost:8888/users USER_VALIDATE_URL=http://localhost:8888/authenticate USER_REQUEST_TOKEN=SECRET node src/index.js
