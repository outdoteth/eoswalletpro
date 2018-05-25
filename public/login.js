let ecc = require('./eosjs-ecc/src/index');

let priv;
let pub;
let account;

$("#welcome-done").on("click", function(){
	$(".welcome-box").toggleClass("hide");
})

$("#loginbut").on('click', function() {
	priv = $('#privkey').val();
	if (priv.length !== 51) {
		toggleHide("#error-account", true);
	}
	else { pub = ecc.privateToPublic(priv)
	if (pub[0] === "E") {
		console.log(pub);
		account = $(".acct-login").val();
		toggleHide(".login", false);
		toggleHide(".main-wallet", true);
		$.post('/pubtoacct', {account_target: account}, function(data){
			if (data.account) {
				console.log(data.account);
				getInfo(account);
				$("#account-name").text("Account: " + account);
			} else {
				$("#error-account").toggleClass("hide");
			};
		})
	} 
}
});


$("#cross").on("click", function(){
	toggleHide(".create-box", false);
});

$("#buy-eos").on("click", function(){
	toggleHide(".lookup-box", true);
});

let count = 0;
let eosBalance;

function getInfo(account_t) {
	$.post('/pubtoacct', {account_target: account_t}, function(data){
		let balanceArray = data.balances.balances.rows;
		let eosBalanceI = balanceArray[0].balance.split(' ');
		eosBalance = eosBalanceI[0];

		console.log(data);
		$("#cpu-limit").text("CPU limit: " + data.cpu_limit);
		$("#ram-usage").text("Ram usage: " + data.ram_usage);
		$("#ram-head").text("Ram: " + data.ram_usage);
		$("#ram-quota").text("Ram quota: " + data.ram_quota);
		$("#delegated-bandwidth").text("Bandwidth: " + data.bandwidth);
		$("#staked-voting").text("Created: " + data.created);
		$("#balance-head").text("Balance: " + balanceArray[0].balance);
		$("#account-balance").text("Balance: " + balanceArray[0].balance);
		for (let i = 1; i < balanceArray.length; i++) {
			if (balanceArray.length !== count){
				let tokenTarget = balanceArray[i].balance.split(' ');
				$("#selector").append(`<option value=${tokenTarget[1]}>${tokenTarget[1]}</option>`)
				if (i % 2 === 0){
					$("#column2").append(`<li id=${i}>${balanceArray[i].balance} <button class='button-blue column-but'>Trade</button></li>`);
				} else {
					$("#column1").append(`<li id=${i}>${balanceArray[i].balance} <button class='button-blue column-but'>Trade</button></li>`);
				} count = 0; count += balanceArray.length
			} else {
				$(`#${i}`).text(`${balanceArray[i].balance}`);
				$(`#${i}`).append(`<button class='button-blue column-but'>Trade</button>`);
			}
		};
	});
}

$("#send-but").on("click", function() {
	let _token = $("#selector").val()
	let _to = $('#to').val();
	let _amount = $('#amount').val() + " " + _token;
	console.log(_amount);
	$.post('/transaction', {from: account, to: _to, amount: _amount}, function(data, status) {
		//signs serialized tx
		let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
		let packedTr = data.packedTr;
		console.log(packedTr);
		let sig = []
		sig.push(ecc.sign(bufferOriginal, priv));
		console.log(sig);
		if (!data.e) {
		
			//sends sig back to server
			$.post('/pushtransaction', {sigs: ecc.sign(bufferOriginal, priv), packedTr: packedTr}, function(data, status){
				console.log(data);
				toggleHide("#success", true);
				$("#tx-id").text("Transaction Id: " + data.transaction_id);
				setTimeout(function(){toggleHide("#success", false); getInfo(account);}, 4000);
			});
		}
	})
});

$("#send-all").on("click", function(){
	$("#amount").val(eosBalance);
});

$("#lookupacct").on("click", function() {
	toggleHide(".lookup-box", true);
});

function toggleHide(target, check) {
	if (check) {
		$(target).removeClass("hide");
		$(target).addClass("show");
	} else {
		$(target).removeClass("show");
		$(target).addClass("hide");
	}
};

$(".lookup-but").on("click", function() {
	let targetAcct = $(".lookup-val").val();
	$.post('/lookupacct', {targetAcct: targetAcct}, function(data, status) {
		$("#account-name-lookup").text("Account name: " + data.account);
		$("#ram-lookup").text("Ram quota: " + data.ram);
		$("#bandwidth-lookup").text("Delegated bandwidth: " + data.bandwidth);
		$("#creation-lookup").text("Creation date: " + data.created);
		$.post('/getbalance', {targetAcct: targetAcct}, function(data){
			console.log(data[0].balance);
			$("#balance-lookup").text("Balance: " + data[0].balance);
		})
	});
});

$("#createacct").on("click", function(){
	toggleHide(".create-box", true);
});

$("#lookup-done").on("click", function(){
	toggleHide(".lookup-box", false);
});

let pubkeys;

$("#createacct").on('click', function() {
	let seed = $("#userrand").val();
	pubkeys = "";
	let privkeys;
	ecc.PrivateKey.randomKey().then(res=>{
		toggleHide(".create-box", true); 
		let lekey = res.toWif();
		privkeys = lekey;
		let pub = ecc.privateToPublic(lekey);
		pubkeys = pub;
		$("#pubkeydis").text(pubkeys);
		$("#privkeydis").text(privkeys);
	});
});


$("#generate-but").on("click", function(){
	$.post('/createaccount', {pubkey: pubkeys}, function(res, res, status){
		console.log(res);
	});
});


