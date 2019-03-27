//Matthew Rife
//PURPOSE: Create a proxy server to serve local files, local CGIs, remote files, and remote CGIs
var http = require('http');
var XelkReq = require('/homes/paul/HTML/CS316/P3_Req.js');

const hostname = 'iris.cs.uky.edu';
const port = generatePort();
const server = http.createServer(geturl);

function geturl(req,res) {
	res.write('Proxy running...');
	checkUrl(req.url, res);
}

function checkUrl(url,res) {
	var accepted = false;
	var localFileRegEx = "^(\/LOCALFILE\/)";
	var hostRegEx = "(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])";
	var filepathRegEx = "([a-zA-Z0-9\-\_\~])*(\/[a-zA-z0-9\-\_\~]*)*(\.)([a-zA-Z0-9]*)$";
	var remoteFileRegEx = "^(\/REMOTEFILE\/)";
	var cgiRegEx = "([a-zA-Z0-9\-\_\~])*(\/[a-zA-z0-9\-\_\~]*)*(\.)(cgi)$"
	var localExecRegEx = "^(\/LOCALEXEC\/)";
	var remoteExecRegEx = "^(\/REMOTEEXEC\/)";
	var remoteFileFinalRegEx = remoteFileRegEx + hostRegEx + filepathRegEx;
	var remoteExecFinalRegEx = remoteExecRegEx + hostRegEx + cgiRegEx;
	var localFileFinalRegEx = localFileRegEx + filepathRegEx;
	var localExecFinalRegEx = localExecRegEx + cgiRegEx;
	var fullRegExCombination = new RegExp(localFileFinalRegEx + "|" + remoteFileFinalRegEx + "|" + remoteExecFinalRegEx + "|" + localExecFinalRegEx);
	if(fullRegExCombination.test(url)) {
		accepted = true;
	}
	else {
		console.log("Rejected");
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
			console.log("DEBUG: Remote File");
			var fileExtension = checkExtension(url);
			if(fileExtension) {
				console.log("Accepted");
				pullandsendFile(url);
			}
			else {
				console.log("Rejected: Invalid extension");
			}

		}
		else if(remoteExecFinalRegEx.test(url)) {
			console.log("Accepted");
			console.log("DEBUG: Remote exec");
			pullandsendOutput(url);
		}
		else if(localFileFinalRegEx.test(url)) {
			console.log("DEBUG: Local file");
			var fileExtension = checkExtension(url);
			if(fileExtension) {
				console.log("Accepted");
				var headerType = getHeaderType(fileExtension);
				serveFile(url,res,headerType);
			}
			else {
				console.log("Rejected: Invalid extension");
			}
		}
		else {
			console.log("Accepted");
			console.log("DEBUG: Local Exec");
			serveCGI(url);
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
function removeCommandFromURL(url) {
	//Remove LOCALFILE from filepath
	url = url.split("/");
	url.splice(1,1);
	url = url.join("/");
	return url;
}

function serveFile(url,res,headerType) {
	const fs = require('fs');
	var fileDir = XelkReq.fileDir();
	var extAllowed = XelkReq.extAllowed();
	res.writeHead(200, {'Content-Type': headerType});
	url = removeCommandFromURL(url);
	fs.readFile(fileDir + url,"utf8", (err, data) => {
  		if (err) throw err;
  		console.log(data);
		res.write(data);
		res.end();
	});
	console.log(fileDir+url);
	console.log(headerType);
}

function serveCGI(url) {
	var exec = require('child_process').exec;
	url = removeCommandFromURL(url);
	var execDir = XelkReq.execDir();
	exec(execDir + url, (error, stdout, stderr) => {
  		if (error) {
    			console.error(`exec error: ${error}`);
    			return;
  		}
		else {
			console.log(stdout);
		}
	});
	
}

function pullandsendFile(url) {
	var exec = require('child_process').exec;
	url = removeCommandFromURL(url);
	var curlCommand = "/usr/bin/curl -s -S ";
	var http = "http://";
	exec(curlCommand + http + url, (error, stdout, stderr) => {
  		if (error) {
    			console.error(`exec error: ${error}`);
    			return;
  		}
		else {
			console.log(stdout);
		}
	});
}

function pullandsendOutput(url) {
	var exec = require('child_process').exec;
	url = removeCommandFromURL(url);
	var curlCommand = "/usr/bin/curl -s -S ";
	var http = "http://";
	exec(curlCommand + http + url, (error, stdout, stderr) => {
  		if (error) {
    			console.error(`exec error: ${error}`);
    			return;
  		}
		else {
			console.log(stdout);
		}
	});
}


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});





