var http = require('http');

const hostname = 'iris.cs.uky.edu';
const port = 3000;
const server = http.createServer(geturl);
function geturl(req,res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('Hello World!');
	res.end();
}
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});




