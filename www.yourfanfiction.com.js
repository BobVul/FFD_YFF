//-----------------------------------
//---      Script by BitPoet      ---
//--- Version 1.0, 14. March 2012 ---
//-----------------------------------
//------------ Changelog ------------
//--- Version 1.0 BitPoet         ---
//--- Initial Version             ---
//-----------------------------------



//Fill these variables with content but do not modify the variables names!!
websiteName = "";			//Name of the website, nicely formated (String)
storyName = "";				//Contains the name of the Story that you are downloading (String)
authorName = "";			//Contains the name of the Author (String)
countOfChapters = 0;		//Count of chapters (Integer)
lastUpdated = "";			//Date of the last update (String, Format mm/dd/yyyy)
summary = "";				//Summary of the story (String)
storyStatus = "Unknown";	//Status of the story (Either "Complete", "In Progress" or "Unknown") (String)
category = "";				//Story Category (String)
storyLink = "";				//Link to the story. IMPORTANT: independent of the entered link (chapter 1 or 2 or 20...) this has to be always the same!! Also it must be a link that the downloader accepts. (String)
totalWordCount = 0;			//Total wordcount of the story. Set it to 0 if the total wordcount isn't displayed by the website. Then it'll be the sum of all chapters. (Integer)
chapterNames = [];			//Name/title of the chapters. (Use chapterNames.push(""); to add a new entry) (String)
chapterLinks = [];			//Link to the chapters. (Use chapterLinks.push(""); to add a new entry) (String)
linkAdditionInfo = "";		//Set link if you want to request additional infos


//variables for "analyseChapter()"
chapterText = "";			//contains the storytext with html formatting. This is overwritten each time that analyseChapter() is called (Stirng)
chapterWordCount = 0;		//coontains the count of words for this chapter. Set to 0 if the information is not provided by the website (Integer)

//End variable area


//Check if the URL is the same like the page that you want to support with this script.
//Return "websiteName" if true, otherwise false. Format the name nicely (e.g. "FanFiction.Net")
function analyseLink(url) {
	if(url.indexOf("www.hpfanficarchive.com") != -1)
		this.websiteName = "HPFanFicArchive";
	return this.websiteName;
}

//Do whatever you need to do to extract the informations from "sourceCode" and place them into the variables
//"sourceCode" contains the informations from the link entered by the user into the GUI
function analyseContent(sourceCode) {
	// First check if sourceCode contains the story index or a chapter:
	if( sourceCode.indexOf("STARTAUTHORFICSAVERS") != -1 )
	{
		// We're in a chapter, let's look up the story id and fetch the index page
		var sid = sourceCode.match(/<div id="pagetitle"><a href="viewstory.php\?sid=(\d+)">/m)[1];
		linkAdditionInfo = "http://www.hpfanficarchive.com/stories/viewstory.php?sid=" + sid;
		return true;
	}
	
	return analyseIndex(sourceCode);
}

function zeropad(val, len)
{
	return ('0000' + val).slice(-1 * len);
}

function analyseIndex(sourceCode)
{  
	var result;
	
	//Use RegEx to look for storyname, authorname....
  result = sourceCode.match(/<div id="pagetitle"><a href="viewstory.php\?sid=(\d+)">([^<]+)<\/a> by <a href="viewuser.php\?uid=\d+">([^<]+)</);
  
  var storyid = result[1];
  
	//Storyname
	//storyName = sourceCode.match(/var title_t = '(.*)';/)[1];
	storyName = result[2];
   
	//Authorname
	authorName = result[3];

	var catspan = sourceCode.match( /<span class="label">Categories:<\/span> ((?:.|\r|\n)+?)<\/span/m )[1];

	var cats = [];
	var pat = /<a.+?>([^<]+)</mg;
	while( result = pat.exec(catspan) )
	{
		cats.push(result[1]);
	}
	//Category
	category = cats.join(',');

	//Updated '02-20-12';
	result = sourceCode.match(/Updated:<\/span> (\w+ \d+, \d+)/);
	var udate = new Date(result[1]);
	lastUpdated = '' + zeropad(udate.getMonth() + 1, 2) + '/' + zeropad(udate.getDate(), 2) + '/' + udate.getFullYear();
		
	//Storystatus
	result = sourceCode.search(/Completed:<\/span> Yes/);
	if( result != -1 )
	{
		storyStatus = "Completed";
	} else {
		storyStatus = "WIP";
	}
   
	//Storywords
	totalWordCount = parseInt(sourceCode.match( />Word count:<\/span> (\d+)/ )[1]);
	
	//Chaptercount will be set when we extract chapter links and names
	countOfChapters = parseInt(sourceCode.match( /Chapters: <\/span> (\d+)/ )[1]);
   
	//Summary
	summary = sourceCode.match(/Summary: <\/span><p>((?:.|\r?\n)+?)<\/p>/)[1];
   
	//Storylink (Always to the first chapter)
	storyLink = "http://www.hpfanficarchive.com/stories/viewstory.php?psid="+storyid;
  
	pat = /<b>\d+. <a href="(viewstory.php\?sid=\d+&amp;chapter=\d+)">([^<]+)</mg;
	while( result = pat.exec( sourceCode ) )
	{
		chapterNames.push(result[2]);
		chapterLinks.push('http://www.hpfanficarchive.com/stories/' + result[1].replace('amp;', ''));
	}

   return true;
}

//like "analyseContent(sourceCode)" but you can request informations from a second link (optional)
//(Gets content of link in "linkAdditionInfo")
function analyseAdditionalContent(sourceCode) {
	return analyseIndex(sourceCode);
}

//Extract the storytext from "sourceCode"
//This function is called once for every chapter
function analyseChapter(sourceCode) {

	//Chaptertext
	chapterText = sourceCode.match(/^<!-- STARTSTORYFICSAVERS -->((?:.|\r|\n)*?)<!-- ENDSTORYFICSAVERS -->/im)[1];

	return true;
}


//##############################################
//### Do not modify content below this area! ###
//##############################################
function getWebsiteName() {
	return this.websiteName;
}
function getStoryName() {
	return this.storyName;
}
function getAuthorName() {
	return this.authorName;
}
function getCountOfChapters() {
	return this.countOfChapters;
}
function getLastUpdated() {
	return this.lastUpdated;
}
function getSummary() {
	return this.summary;
}
function getStoryStatus() {
	return this.storyStatus;
}
function getCategory() {
	return this.category;
}
function getStoryLink() {
	return this.storyLink;
}
function getTotalWordCount() {
	return this.totalWordCount;
}
function getChapterNames() {
	return this.chapterNames;
}
function getChapterLinks() {
	return this.chapterLinks;
}
function getLinkAdditionInfo() {
	return this.linkAdditionInfo;
}
function getChapterText() {
	return this.chapterText;
}
function getChapterWordCount() {
	return this.chapterWordCount;
}