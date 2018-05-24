var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Eos = require('./eosjs-recent/src/index');
var eos = Eos.Testnet({httpEndpoint: 'http://dev.cryptolions.io:18888', keyProvider: '5K2KsDfwjTxCfJDprHSEkFGeQbgAWHPErju8ViuZ9SALw19FNW2'});



var app = express();
var port = 80;

//view
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//for pushing the transaction
let sigbuf;

var fetchUrl = require("fetch").fetchUrl;

// source file is iso-8859-15 but it is converted to utf-8 automatically
let price;

//setInterval(function(){
	fetchUrl("https://api.coinmarketcap.com/v2/ticker/1765/?convert=EUR", function(error, meta, body){
		let x = body.toString();
		let f = JSON.parse(x);
    	price = f.data.quotes.USD.price.toString();
	});
//}, 6000 * 10 * 10)


//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set static path for assets
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {

	eos.getInfo({}).then(result=> {
		let blockNum = result.head_block_num;
		let lastBlock = result.last_irreversible_block_num;
		let timestamp = result.head_block_time;
		let miner = result.head_block_producer;
		let cpulimit = result.block_cpu_limit;
		res.render('eoswalletpro', {
			blockNum: blockNum,
			lastBlock: lastBlock,
			timestamp: timestamp,
			miner: miner,
			cpulimit: cpulimit,
			price: price
		});
	});
});

app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});


app.post('/lookupacct', function(req, res, status){
	console.log(req.body);
	eos.getAccount(req.body.targetAcct).then(result=>{
		console.log(result);
		let account = req.body.targetAcct;
		let created = result.created;
		let ram = result.ram_quota;
		let bandwidth = result.delegated_bandwidth;
		res.send({account: account, created: created, ram: ram, bandwidth: bandwidth});
		res.end();
	});
});

app.post('/getbalance', function (req, res){
	eos.getTableRows({code: 'eosio.token', scope: req.body.targetAcct, table: 'accounts', json: true}).then(result2=>{
		console.log(result2);
		res.send(result2.rows);
		res.end();
	});
});

app.post('/pubtoacct', function(req, res){
	//let pub = req.body.pubkey;
	//eos.getaccounts(pub).then(accountRes => {});
	eos.getAccount("dylan").then(result=>{
		let ram_quota = result.ram_quota;
		let ram_usage = result.ram_usage;
		let bandwidth = result.delegated_bandwidth;
		let cpu_limit = result.cpu_limit.available; 
		let created = result.created;
		eos.getTableRows({code: 'eosio.token', scope: 'dylan', table: 'accounts', json: true}).then(result2=>{
			let balances = result2;
			res.send({
				balances: {balances: balances},
				ram_quota: ram_quota,
				cpu_limit: cpu_limit,
				ram_usage: ram_usage,
				bandwidth: bandwidth,
				created: created
			});
			res.end();
		});
	});
});



//----------------------- LOGIN WITH PRIVATE KEY ------------------------//

app.post('/login', function(req, res, status){

});

//----------------------- LOGIN WITH PRIVATE KEY ------------------------//




//----------------------- CREATE NEW ACCOUNT ------------------------//

let alphabet = "abcdefghijklmnopqurstuvwxyz12345"

app.post('/createaccount', function(req, res, status) {
	let key = req.body.pubkey;
	let rand = alphabet[Math.floor(Math.random()*alphabet.length)];
	eos.newaccount({creator: 'justin', name: rand, owner: key, active: key}).then(result=>{
		console.log(result);
		res.send(result);
		res.end();
	});
	//res.send({account_name: createacct});
	//res.end();
});

//----------------------- CREATE NEW ACCOUNT ------------------------//




//----------------------- CREATE RAW EOS TRANSACTION ------------------------//

let packedTr;
let i = 0;

app.post('/transaction', function(req, res, status) {
	let params = req.body;

	//Sets the packed tr and the buffer to be signed
	if (params.to && params.amount) {
		eos.transfer("dylan", params.to, params.amount, "", {broadcast: false, sign: false}).then(result=>{
			console.log(req.body);
			packedTr = result.transaction;
			console.log(result.buffer);
			console.log(result.transaction);
			//let testsig = Eos.modules.ecc.sign(result.buffer, "5HwGj4jBXQgAQva8pFpTvnJGMicvciHDQPQhbszXYXHge8kZeB1");
			let stringBuf = JSON.stringify(result.buffer);
			res.send({buf: stringBuf});
			res.end();
		});
	} else {
		i++;
		console.log("error" + i);
		res.send({ e: "error"});
		res.end();
	}
});

//----------------------- CREATE RAW EOS TRANSACTION ------------------------//




//----------------------- CREATE RAW TOKEN TRANSACTION ------------------------//

app.post('/tokentransaction', function(req, res, status){
	let token = req.body;
	eos.transaction(token.token, currency => {
		currency.transfer(token.from, token.to, token.amount)
	})
});

//----------------------- CREATE RAW TOKEN TRANSACTION ------------------------//




//----------------------- PUSH SIGNED TRANSACTION ------------------------//

app.post('/pushtransaction', function(req, res) {
	console.log(req.body);
	console.log(5);
	if (req.body.sigs) {
		let sigver = Eos.modules.ecc.Signature.from(req.body.sigs).toString();
		let lasig = [sigver];
		//let sigver = req.body.sigs;
		let package = {
			compression: 'none',
			transaction: packedTr,
			signatures: lasig
		}
	
		console.log(package);
		//Pushes tx in correct format
		eos.pushTransaction(package).then(result=>{
			res.send(result);
			res.end();
			console.log(result);
		});
	}
})

//----------------------- PUSH SIGNED TRANSACTION ------------------------//





