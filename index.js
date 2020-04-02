const rp = require('request-promise');
const config = require('./config');
const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = function(event, context, callback)  {
	if(event['source'] == 'aws.events'){
		sendCallOutStart();
	}
	else{
		const message = JSON.parse(event.body);
		var messageText = message['text'];
		var lower = messageText.toLowerCase();
		if(lower == '#quizme'){
			sendRandomTerm(message);
		}	
	}
};


function sendRandomTerm(message){
	scrapeTerms(function(terms){
		const oneRandom = Math.floor(Math.random() * Math.floor(terms.length));
		const nameOfSender = message.name;
		let body = {
			"bot_id": config.BOT_ID,
			"text": '@' + nameOfSender + " " + terms[oneRandom],
			"attachments": [{
				"loci": [],
				"type": "mentions",
				"user_ids": []
			}]
		};
		body.attachments[0].user_ids.push(message.user_id);
		body.attachments[0].loci.push([0, nameOfSender.length + 1]);
		postMessage(body);	
	});
}

function scrapeTerms(callback){
	var list;
	axios.get(config.QUIZLET_URL)
	.then( response => {
		//console.log(response.data);
		list = getData(response.data);
		callback(list);
	})
	.catch(error => {
		console.log(error);
	})
}

let getData = html =>{
	var data = [];
	const $ = cheerio.load(html);
	const terms = $('.SetPageTerm-wordText').each(function(){
		data.push($(this).text());
	});
	return data;
};

async function sendCallOutStart(){
	//console.log('hello');
	var resp;
	try{
		resp = await rp({
			method: 'GET',
			url: `https://api.groupme.com/v3/groups/${config.GROUP_ID}?token=${config.ACCESS_TOKEN}`,
			json: true
		});
	}
	catch(err){
		console.error(err);
	}
    createMessage(resp);
}

function createMessage(resp){
	var numPeople = resp.response.members.length;
	var oneRandom = Math.floor(Math.random() * Math.floor(numPeople));
	//console.log(resp.response.members[oneRandom]);
	var ranMessage = Math.floor(Math.random() * Math.floor(config.MESSAGES.length));
	var recNickname = resp.response.members[oneRandom].nickname;
	let body = {
		"bot_id": config.BOT_ID,
		"text": '@' + recNickname + config.MESSAGES[ranMessage],
		"attachments": [{
			"loci": [],
			"type": "mentions",
			"user_ids": []
		}]
	};
	body.attachments[0].user_ids.push(resp.response.members[oneRandom].user_id);
	body.attachments[0].loci.push([0, recNickname + 1]);
	postMessage(body);
}

async function postMessage(body){
	const options = {
		method: 'POST',
		url: 'https://api.groupme.com/v3/bots/post',
		body: body,
		json: true
	};
	if(typeof body === 'string') {
		options.body = {
			'bot_id': config.BOT_ID,
			'text': body
		};
	}
	try {
		await rp(options);
	}
	catch(err){
		console.error(err);
	}
}