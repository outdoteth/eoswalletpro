let ecc = require('./eosjs-ecc/src/index');

let userAccounts = [];
let priv;
let pub;

$("#loginbut").on('click', function() {
	priv = $('#privkey').val();
	pub = ecc.privateToPublic(priv);
	if (pub[0] === "E") {
		console.log(pub);
		userAccounts.push(pub);
		toggleHide(".login", false);
		toggleHide(".main-wallet", true);
		getInfo(pub);

			/*$("#sendtx").click(function(){
				let _from = $('#from').val();
				let _to = $('#to').val();
				let _amount = $('#amount').val();

				//sends tx params
				$.post('/transaction', {from: _from, to: _to, amount: _amount}, function(data, status) {
					$("h1").text("Transaction is being signed");
					//signs serialized tx
					let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
					let sig = []
					sig.push(ecc.sign(bufferOriginal, priv));
					console.log(sig);

					//sends sig back to server
					$.post('/pushtransaction', {sigs: ecc.sign(bufferOriginal, priv)}, function(data, status){
						console.log(data);
					});
				})
			});

			$("#sendtokenbut").on('click', function(){
				let _tokentarget = $("#token-name").val();
				let _from = $("#token-from").val();
				let _to = $("#token-to").val();
				let _amount = $("#token-amount").val();

				$.post('/tokentransaction', {token: _tokentarget, from: _from, to: _to, amount: _amount}, function(data, status){
					//signs serialized tx
					let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
					let sig = [];
					sig.push(ecc.sign(bufferOriginal, priv));
					console.log(sig);


				})

			})*/


	} else {
		alert("Invalid Private Key - Please Try Again");
	};
});

$("#cross").on("click", function(){
	toggleHide(".create-box", false);
});

let count = 0;
let eosBalance;

function getInfo(pubkey) {
	$.post('/pubtoacct', {pubkey: pubkey}, function(data){
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
	$.post('/transaction', {from: "dylan", to: _to, amount: _amount}, function(data, status) {
		//signs serialized tx
		let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
		let sig = []
		sig.push(ecc.sign(bufferOriginal, priv));
		console.log(sig);

		//sends sig back to server
		$.post('/pushtransaction', {sigs: ecc.sign(bufferOriginal, priv)}, function(data, status){
			console.log(data);
			getInfo(pub);
			toggleHide("#success", true);
			$("#tx-id").text("Transaction Id: " + data.transaction_id);
			setTimeout(function(){toggleHide("#success", false)}, 4000);
		});
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


