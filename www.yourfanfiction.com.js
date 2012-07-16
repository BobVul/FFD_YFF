/* * *
 * YourFanfiction plugin for FanFictionDownloader
 * By Elusive
 * http://www.yourfanfiction.com
 *
 * * *
 * Based on the HPFanFicArchive plugin by BitPoet (version 1.0)
 * 
 * Changes from BitPoet's version are minor, since both sites use the same
 * engine.
 *
 * - URL changes
 * - YFF does not open TOC for single chapter stories, therefore index=1 must
 *    be added to the request string
 * - Date format is DD MMM YYYY, instead of MMMMM DD, YYYY
 * - Fixed some formatting to match the comments. Date now uses `-` separators,
 *    not `/`, which could potentially cause an issue with filenames. storyStatus
 *    now uses "In Progress", as defined by the comments, not "WIP".
 * - Made sure parseInt() will not bug on leading zero by specifying base 10
 *    (stupid JavaScript)
 * - YFF doesn't seem to use the `STARTXXXFICSAVERS` comments, so used another
 *    way to find content
 * - Added author's notes block from outside story block
 * - [BUGGED] Added &ageconsent=ok&warning=5 to request strings to bypass content filters
 *
 * * *
 * This plugin is not affiliated in any way with YourFanfiction nor
 * FanFictionDownloader.
 *
 */


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
	if(url.indexOf("www.yourfanfiction.com") != -1)
		this.websiteName = "YourFanfiction";
	return this.websiteName;
}

//Do whatever you need to do to extract the informations from "sourceCode" and place them into the variables
//"sourceCode" contains the informations from the link entered by the user into the GUI
function analyseContent(sourceCode) {
	// First check if sourceCode contains the story index or a chapter:
	// Checking for TOC link because YFF does not have convenient STARTXXXFICSAVERS comments
	//if( sourceCode.indexOf("STARTAUTHORFICSAVERS") != -1 )
	if (sourceCode.match(/<a href="viewstory\.php\?sid=\d+&amp;index=1">Table of Contents<\/a>/))
	{
		// We're in a chapter, let's look up the story id and fetch the index page
		var sid = sourceCode.match(/<div id="pagetitle"><a href="viewstory.php\?sid=(\d+)">/m)[1];
		linkAdditionInfo = "http://www.yourfanfiction.com/viewstory.php?sid=" + sid + "&index=1&ageconsent=ok&warning=5";
		return true;
	}
	
	/*contentFilterSid = sourceCode.match(/class='errortext'>Age Consent Required<br \/><a href='viewstory\.php\?sid=(\d+)&amp;ageconsent=ok&amp;warning=\d+'>Ages 18\+ - Contains explicit content for mature adults only\.<\/a>/)[1];
	if (contentFilterSid)
	{
		// Content filter. Need to bypass it.
		var sid = sourceCode.match(/<div id="pagetitle"><a href="viewstory.php\?sid=(\d+)">/m)[1];
		linkAdditionInfo = "http://www.yourfanfiction.com/viewstory.php?sid=" + contentFilterSid + "&index=1&ageconsent=ok&warning=5";
		return true;
	}*/
	
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

	var catspan = sourceCode.match( /<span class="label">Categories:<\/span> ([\s\S]+?)<\/span/m )[1];

	var cats = [];
	var pat = /<a.+?>([^<]+)</mg;
	while( result = pat.exec(catspan) )
	{
		cats.push(result[1]);
	}
	//Category
	category = cats.join(',');

	//Updated '02-20-12';
	result = sourceCode.match(/<span class="label">Updated:<\/span> (\d+ \w+ \d+)/);
	var udate = new Date(result[1]);
	lastUpdated = '' + zeropad(udate.getMonth() + 1, 2) + '-' + zeropad(udate.getDate(), 2) + '-' + udate.getFullYear();
		
	//Storystatus
	result = sourceCode.search(/<span class="label">Completed:<\/span> Yes/);
	if( result != -1 )
	{
		storyStatus = "Completed";
	} else {
		storyStatus = "In Progress";
	}
   
	//Storywords
	totalWordCount = parseInt(sourceCode.match( /<span class="label">Word count:<\/span> (\d+)/ )[1], 10);
	
	//Chaptercount will be set when we extract chapter links and names
	countOfChapters = parseInt(sourceCode.match( /<span class="label">Chapters: <\/span> (\d+)/ )[1], 10);

	//Summary
	summary = sourceCode.match(/<span class="label">Summary: <\/span><p>([\s\S]+?)<\/p>/)[1];
   
	//Storylink (Always to the first chapter)
	storyLink = "http://www.yourfanfiction.com/viewstory.php?sid=" + storyid + "&chapter=1";//&ageconsent=ok&warning=5";
  
	pat = /<b>\d+\. <a href="(viewstory\.php\?sid=\d+&amp;chapter=\d+)">([^<]+)</mg;
	while( result = pat.exec( sourceCode ) )
	{
		chapterNames.push(result[2]);
		chapterLinks.push("http://www.yourfanfiction.com/" + result[1].replace('&amp;', '&')/* + "&ageconsent=ok&warning=5"*/);
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

	// Clear string
	chapterText = '';
	
	// Include author's notes
	chapterText += sourceCode.match(/<div class='notes'>([\s\S]*?)<\/div>\s+<div id="story">/im)[1];
	
	if (chapterText != '')
		chapterText += '<hr />';

	//Chaptertext
	chapterText += sourceCode.match(/<div id="story">([\s\S]*?)<\/div>\s+<div id="prev">/im)[1];

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