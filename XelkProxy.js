//Matthew Rife
var http = require('http');
var XelkReq = require('/homes/paul/HTML/CS316/P3_Req.js');

const hostname = 'iris.cs.uky.edu';
const port = generatePort();
const server = http.createServer(geturl);

function geturl(req,res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('Hello World!');
	res.end();
	console.log(req.url);
	checkUrl(req.url, res);

}

function checkUrl(url,res) {
	var accepted = false;
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
		accepted = true;
	}
	else {
		console.log("Rejected");
		console.log(fullRegExCombination);
		console.log(localFileFinalRegEx);
	}
	
	if(accepted) {
		//Figure out which one it passed
		//Turn all strings into regular expressions
		remoteFileFinalRegEx = new RegExp(remoteFileFinalRegEx);
		remoteExecFinalRegEx = new RegExp(remoteExecFinalRegEx);
		localFileFinalRegEx = new RegExp(localFileFinalRegEx);
		localExecFinalRegEx = new RegExp(localExecFinalRegEx);
		if(remoteFileFinalRegEx.test(url)) {
			//Do stuff
			console.log("Remote File");
			checkExtension(url);
		}
		else if(remoteExecFinalRegEx.test(url)) {
			console.log("Remote exec");
		}
		else if(localFileFinalRegEx.test(url)) {
			console.log("Local file");
			var fileExtension = checkExtension(url);
			if(fileExtension) {
				var headerType = getHeaderType(fileExtension);
				serveFile(url,res,headerType);
			}
		}
		else {
			console.log("Local Exec");
		}
	}
	
		
}

function checkExtension(url) {
	var extensionIsValid = false;
	var validExtensions = XelkReq.extAllowed();
	for(var i = 0; i<validExtensions.length; i++) {
		var extensionToCheck = validExtensions[i][0];
		extensionToCheckRegEx = new RegExp(extensionToCheck + "$");
		if(extensionToCheckRegEx.test(url)){
			extensionIsValid = true;
			var finalExtension = extensionToCheck;
		}
	}

	if(extensionIsValid) {
		console.log("Valid extension");
		
	}
	else {
		console.log("Invalid extension");
	}

	return finalExtension;

}

function getHeaderType(fileExtension) {
	var extAllowed = XelkReq.extAllowed();
	var headerType;
	var finalIndex0, finalIndex1;
	for(var i = 0; i< extAllowed.length; i++) {
		var subArray = extAllowed[i];
  		var extIndex = subArray.indexOf(fileExtension);
		if(extIndex != -1) {
			finalIndex0 = i;
			finalIndex1 = extIndex + 1; //HeaderType is the element after the extension
		}
	}	
	if(finalIndex0) {
		headerType = extAllowed[finalIndex0][finalIndex1];
	}
	else {
		headerType = 'text/plain';
	}

	return headerType;
}

function generatePort() {
	var port = Math.floor(Math.random() * (+XelkReq.UpperPort() - +XelkReq.LowerPort()) + +XelkReq.LowerPort());
	return port;
}

function serveFile(url,res,headerType) {
	const fs = require('fs');
	var fileDir = XelkReq.fileDir();
	var extAllowed = XelkReq.extAllowed();
	res.writeHead(200, {'Content-Type': headerType});
	//Remove LOCALFILE from filepath
	url = url.split("/");
	url.splice(1,1);
	url = url.join("/");
	fs.readFile(fileDir + url, (err, data) => {
  		if (err) throw err;
  		console.log(data);
	});
	console.log(fileDir+url);
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});





