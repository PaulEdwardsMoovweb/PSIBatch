fs = require('fs');
var psi = require('psi');

var inputFile = "";
var inputFileContents = "";

// Get the input file
if(process.argv.length > 2){
	//console.log("Input file: " + process.argv[2]);
	inputFile = process.argv[2];
} else {
	console.log('No input file specified - terminating');
	process.exit(1);
}

function getInputFileContents(){
	fs.readFile(inputFile, 'utf8', function (err,data) {
	  if (err) {
	    console.log(err);
	    process.exit(1);
	  }
	  //console.log(data);
	  inputFileContents = data.toString();
	  testEachSite();
	});	
}

function testEachSite(){
	var array = inputFileContents.toString().split("\n");

	//console.log(array.length);
    
    for(i in array) {
    	//console.log("array[i] " + array[i]);
    	//console.log("array[i] " + array[i].toString().length);

    	if(array[i].toString().length >0){
       		console.log("Site test " + i + ": " + array[i]);
       		runPSI(array[i], "desktop");
       		runPSI(array[i], "mobile");
       	}
    }
}

function runPSI(site, strategy){
	psi({
		url: ('http://' + site), 
		strategy: strategy
	}, function (err, data) {
		if(err){
			console.log(err)
			process.exit(1)
		}
		console.log(data);
	    console.log(data.score);
	    console.log(data.pageStats);
	});
}

getInputFileContents()
