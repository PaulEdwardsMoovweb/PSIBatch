fs = require('fs');
var psi = require('psi');

var inputFile = "";
var inputFileContents = "";
var outputFile ="";

var writtenKeys = false;

// Get the input file
if(process.argv.length > 3){
	inputFile = process.argv[2];
	outputFile = inputFile + '-output.csv';
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

	  inputFileContents = data;
	  testEachSite(0, 'desktop');
	});	
}

function testEachSite(i, strategy){
	var array = inputFileContents.toString().split("\n");
	if(i < array.length){
   		console.log("Site test " + i + ": " + array[i]);
   		runPSI(array[i], strategy);
	    
	    if(strategy == 'desktop'){
	    	strategy = 'mobile';
	    } else {
	    	strategy = 'desktop';
	     	i += 1;	
	    }

	    //nasty hack as my output buffers are not synchronous...
	    setTimeout(function(){testEachSite(i, strategy)},5000);
	    
	}    
}

function runPSI(site, strategy){
	console.log('testing: ' + site + ' with strategy: ' + strategy);

	psi({
		url: ('http://' + site), 
		strategy: strategy
	}, function (err, data) {
		if(err){
			console.log('error: ' + err)
		}
		writeAppendFile(data,strategy);
	});
}

function writeAppendFile(payload,strategy){
	var output = "";
	var dataString = JSON.stringify(payload);
	if(!writtenKeys){
		fs.appendFile(outputFile, "id,strategy,responseCode,title,score,numberResources,numberHosts,totalRequestBytes,numberStaticResources,htmlResponseBytes,cssResponseBytes,imageResponseBytes,otherResponseBytes,numberCSSResources,avoidLadingPageRedirects rule impact,Avoid Plugins rule impact,Configure Viewport rule impact,EnableGzipCompression rule impact,leverageBrowserCompression rule impact,mainResourceServerResponseTime rule impact,minifyCSS rule impact,minifyHTML rule impact,minifyJavaScript rule impact,minimizeRenderBlockingResources rule impact,optizeImages rule impact,prioritizeVisibleContent rule impact, sizeContent to viewport rule impact, sizeTapTargetsAppropriately rule impact, useLegibleFontSize rule impact\n", function (err) {
			if(err){
				console.log('out error: ' + err);
				process.exit(1)
			}
		});
		writtenKeys = true;
	}

	output += payload.id + ",";
	output += strategy + ",";
	output += payload.responseCode + ",";
	output += payload.title + ",";
	output += payload.score + ",";
	output += payload.pageStats.numberResources + ",";
	output += payload.pageStats.numberHosts + ",";
	output += payload.pageStats.totalRequestBytes + ",";
	output += payload.pageStats.numberStaticResources + ",";
	output += payload.pageStats.htmlResponseBytes + ",";
	output += payload.pageStats.cssResponseBytes + ",";
	output += payload.pageStats.imageResponseBytes + ",";
	output += payload.pageStats.otherResponseBytes + ",";
	output += payload.pageStats.numberCssResources + ",";
	output += payload.formattedResults.ruleResults.AvoidLandingPageRedirects.ruleImpact + ",";

	if(strategy == "mobile"){
	//note: desktop does not seem to have AvoidPlugins as you might expect.	
		output += payload.formattedResults.ruleResults.AvoidPlugins.ruleImpact + ",";
		output += payload.formattedResults.ruleResults.ConfigureViewport.ruleImpact + ",";
	} else {
		output += "NA,NA,";
	}
	
	output += payload.formattedResults.ruleResults.EnableGzipCompression.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.LeverageBrowserCaching.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.MainResourceServerResponseTime.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.MinifyCss.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.MinifyHTML.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.MinifyJavaScript.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.MinimizeRenderBlockingResources.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.OptimizeImages.ruleImpact + ",";
	output += payload.formattedResults.ruleResults.PrioritizeVisibleContent.ruleImpact + ",";

	if(strategy == "mobile"){
	//note: desktop does not seem to have AvoidPlugins as you might expect.	
		output += payload.formattedResults.ruleResults.SizeContentToViewport.ruleImpact + ",";
		output += payload.formattedResults.ruleResults.SizeTapTargetsAppropriately.ruleImpact + ",";
		output += payload.formattedResults.ruleResults.UseLegibleFontSizes.ruleImpact;
	} else {
		output += "NA,NA,NA";
	}

	output += "\r\n";
	appendToFile(outputFile,output);
}

function appendToFile(outputFile,dataString){
	fs.appendFile(outputFile, dataString, function (err) {
		if(err){
			console.log('out error: ' + err);
			process.exit(1)
		}
	});
}

getInputFileContents();
