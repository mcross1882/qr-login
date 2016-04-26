wireless-ip:
	ifconfig wlp7s0 | grep 'inet ' | cut -d: -f2 | awk '{print $2}'

start-account-server:
	node test/accountservice.js

start-server:
	USER_REQUEST_URL=http://localhost:8888/users USER_VALIDATE_URL=http://localhost:8888/authenticate USER_REQUEST_TOKEN=SECRET REDIRECT_URL=http://192.168.1.70:8080/info node src/index.js
