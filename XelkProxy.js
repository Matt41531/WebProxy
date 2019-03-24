//Matthew Rife
var http = require('http');
var XelkReq = require('/homes/paul/HTML/CS316/P3_Req.js');

const hostname = 'iris.cs.uky.edu';
const port = 3300;
const server = http.createServer(geturl);

function geturl(req,res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('Hello World!');
	res.end();
	console.log(req.url);
	checkUrl(req.url);

}

function checkUrl(url) {
	//var localfileRegEx = "^(\/LOCALFILE\/)([a-zA-Z0-9\-\_\~])*(\/[a-zA-z0-9\-\_\~]*)*(\.)([a-zA-Z0-9]*)$";
	var localFileRegEx = "^(\/LOCALFILE\/)";
	var hostRegEx = "(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])";
	var filepathRegEx = "([a-zA-Z0-9\-\_\~])*(\/[a-zA-z0-9\-\_\~]*)*(\.)([a-zA-Z0-9]*)$";
	var remoteFileRegEx = "^(\/REMOTEFILE\/)";
	var cgiRegEx = "([a-zA-Z0-9\-\_])*(\/[a-zA-z0-9\-\_]*)*(\.)(cgi)$"
	var localExecRegEx = "^(\/LOCALEXEC\/)";
	var remoteExecRegEx = "^(\/REMOTEEXEC\/)";
	var remoteFileFinalRegEx = remoteFileRegEx + hostRegEx + filepathRegEx;
	var remoteExecFinalRegEx = remoteExecRegEx + hostRegEx + cgiRegEx;
	var localFileFinalRegEx = localFileRegEx + filepathRegEx;
	var localExecFinalRegEx = localExecRegEx + cgiRegEx;
	var fullRegExCombination = new RegExp(localFileFinalRegEx + "|" + remoteFileFinalRegEx + "|" + remoteExecFinalRegEx + "|" + localExecFinalRegEx);
	if(fullRegExCombination.test(url)) {
		console.log("Accepted");
	}
	else {
		console.log("Rejected");
		console.log(fullRegExCombination);
		console.log(localFileFinalRegEx);
	}
}


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});





