let ecc = require('./eosjs-ecc/eosjs-ecc/eosjs-ecc/src/index'); //Using eosjs-ecc https://github.com/EOSIO/eosjs-ecc

$(document).ready(function() {

let priv;
let pub;
let account;
let foundScatter = false;
let scatter;
let scatterUnlocked = false;

//Using Scatter https://github.com/EOSEssentials/Scatter
document.addEventListener('scatterLoaded', scatterExtension => {
    scatter = window.scatter;
    foundScatter = true;
    window.scatter = null;
});

$("#start-offline").on("click", function(){
	toggleHide(".offline-1st", true);
});

let getAccountLink;

$(".1-but").on("click", function(){
	toggleHide(".offline-1st", false);
	toggleHide(".offline-2nd", true);
});

let offlinesignbuf;
let offlinesig;
let offlinepackedTr;

$("#generate-tx-offline-but").on("click", function(){
	let from = $("#offline-from").val();
	let to = $("#offline-to").val();
	let amount = $("#offline-amount").val();
	let splitCheck = amount.split(" ");
	$("#offline-from-dis").text("From Account: " + from);
	$("#offline-to-dis").text("To Account: " + to);
	$("#offline-amount-dis").text("Amount: " + amount);
	if (from.length !== 12 || to.length !== 12) {
		$("#generate-error").text("Error - Due to the new Dawn4.2.0 standard accounts must be exactly 12 characters long");
		toggleHide("#generate-error", true);
	} else if (splitCheck.length !== 2) {
		$("#generate-error").text("Error - Please include a space between the amount and the token name e.g. '1 EOS' or '2.36 JUNGLE'");
		toggleHide("#generate-error", true);
	} else {
		$.post('/transaction', {from: from, to: to, amount: amount}, function(data, status) {
			//signs serialized tx
			if (data.packedTr) {
					offlinesignbuf = Buffer.from(JSON.parse(data.buf).data);
					offlinepackedTr = data.packedTr;
					$("#raw-tx-text").text(offlinepackedTr);
					toggleHide(".offline-2nd", false);
					toggleHide(".offline-3rd", true);
				} else if (data.e) {
					$("#generate-error").text("Error - " + data.e);
					toggleHide("#generate-error", true);
				} else {
					$("#generate-error").text(data.e);
				}
		});
	}
});

$(".3-but").on("click", function(){
	let offlinepriv = $("#offline-private").val();
	offlinesig = ecc.sign(offlinesignbuf, offlinepriv);
	toggleHide(".offline-3rd", false);
	toggleHide(".offline-4th", true);
});


$("#offline-broadcast").on("click", function(){
	$.post('/pushtransaction', {sigs: offlinesig, packedTr: offlinepackedTr}, function(data){
		if (data.transaction_id) {
			toggleHide("#offline-success", true);
			$("#offline-success").text("Tx Id - " + data.transaction_id);
		} else {
			toggleHide("#offline-error", true);
			$("#offline-error").text("Error - " + data.e);
		}
	});
});

$(".offline-cancel").on("click", function(){
	toggleHide(".offline-tx-box", false);
});

$(".4-but").on("click", function(){
	toggleHide(".offline-tx-box", false);
})

$(".explorer").on("click", function(){
	window.open(`http://eospark.com`,'_blank');
});




$("#scatter-unlock").on("click", function() {
	if(foundScatter) {

		//returns public key
		scatter.getIdentity({accounts:[{blockchain:'eos', host:'192.99.200.155', port:8888, chainId: "01750cf763fbac963c344639d96ce503eadbf045aa7e4da67813290673112fd7"}]}).then(identity => {
			if (identity.accounts) {
				let account_arr = identity.accounts;
				toggleHide("#account-pick-box", true);
				$("#account-list").empty();
				if (account_arr.length >= 1){
					toggleHide("#no-account", false);
					for (let i = 0; i < account_arr.length; i++) {
						$("#account-list").append(`<li class="lili" id=${account_arr[i].name}>${account_arr[i].name} <button class='button-blue pick-account-buts'>Use This Account</button></li>`);
						$(`#${account_arr[i].name}`).on("click", function(){
							toggleHide(".login", false);
							scatterUnlocked = true;
							toggleHide(".main-wallet", true);
							toggleHide("#account-pick-box", false);
							$("#account-name").text(`Account: ${account_arr[i].name}`);
							console.log(account_arr[i].name);
							getInfo(account_arr[i].name);
							account = account_arr[i].name;
						});
					}
					} else {

				}
			}
    	}).catch(err => {console.log(err)});



    	//post request to get public key to account


    	//take to next page
    	//set signWithScatter to 'true'


    	//THEN write if(signWithScatter){scatter.sign(buf)};

	} else {
	}
})

$("#welcome-done").on("click", function(){
	$(".welcome-box").toggleClass("hide");
});

$("#qr-but").on("click", function(){
	getInfo(account);
});



$("#loginbut").on('click', function() {
	priv = $('#privkey').val();
	if (priv.length !== 51) {
		$("#error-account").text("Error - Invalid private key");
		toggleHide("#error-account", true);
	}
	else { pub = ecc.privateToPublic(priv)
	if (pub[0] === "E") {
		account = $("#account-set").val();
		/*if (account.length !== 12) {
			$("#error-account").text("Error - Due to the new Dawn 4.2.0 standard, account names must now be exactly 12 characters long");
			toggleHide("#error-account", true);
		} else {*/
		$.post('/getkeyaccount', {pubkey: pub}, function(data){
			if (data.accounts) {
				let account_arr = data.accounts;
				toggleHide("#account-pick-box", true);
				$("#account-list").empty();
				if (account_arr.length >= 1){
								toggleHide("#no-account", false);
								for (let i = 0; i < account_arr.length; i++) {
									$("#account-list").append(`<li class="lili" id=${account_arr[i]}>${account_arr[i]} <button class='button-blue pick-account-buts'>Use This Account</button></li>`);
									$(`#${account_arr[i]}`).on("click", function(){
										toggleHide(".login", false);
										toggleHide(".main-wallet", true);
										toggleHide("#account-pick-box", false);
										$("#account-name").text(`Account: ${account_arr[i]}`);
										getAccountLink = account_arr[i]
										$("#get-account").on("click", function(){
											window.open(`http://eospark.com/Jungle/account/${account_arr[i]}`,'_blank');
										});
										getInfo(account_arr[i]);
										account = account_arr[i];
									});
								}
							} else {

							}
			}
		});
	}

	}
});

$("#x-account").on("click", function(){
	toggleHide("#account-pick-box", false);
})

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
		pub = data.returnkey;

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
					$("#column2").append(`<li id=${i} class=${tokenTarget[1]}  value=${i}>${balanceArray[i].balance} <button class='button-blue column-but'>Trade</button></li>`);
				} else {
					$("#column1").append(`<li id=${i} class=${tokenTarget[1]} value=${i}>${balanceArray[i].balance} <button class='button-blue column-but'>Trade</button></li>`);				} count = 0; count += balanceArray.length
			} else {
				$(`#${i}`).text(`${balanceArray[i].balance}`);
				$(`#${i}`).append(`<button class='button-blue column-but'>Trade</button>`);
			}
		};
	});
}

//toggleHide("#0", false);

let isValid = true;

$("#send-but").on("click", function() {
	if (scatterUnlocked) {
		if (isValid) {
		isValid = false;
		let _token = $("#selector").val()
		let _to = $('#to').val();
		let _amountInput = $('#amount').val();
		let _amountCheck = $(`.${_token}`);
		let stringNum = _amountCheck.text();
		let checkNumArr = stringNum.split(" ");
		let _amountAgainst = Number(checkNumArr[0]);

		//if (_amountInput <= _amountAgainst) {

		let _amount = $('#amount').val() + " " + _token;
		let _memo = $("#memo").val();
		$.post('/transaction', {from: account, to: _to, amount: _amount, memo: _memo, pubkeys: pub}, function(data, status) {
			//signs serialized tx
			let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
			let packedTr = data.packedTr;
			//let sig = []
			//sig.push(ecc.sign(bufferOriginal, priv));
			//console.log(sig);

			if (!data.e) {
				scatter.getArbitrarySignature(
					pub, 
					bufferOriginal, 
					whatfor = `Transaction --- From: ${account} --- To: ${_to} --- Amount: ${_amount}`, 
					isHash = false
				).then(result3=>{

					$.post('/pushtransaction', {sigs: result3, packedTr: packedTr}, function(data, status){
						toggleHide("#success", true);
						$("#tx-id").text("Transaction Id: " + data.transaction_id);
						setTimeout(function(){isValid=true;}, 1000);
						setTimeout(function(){toggleHide("#success", false); getInfo(account);}, 4000);
					});

				});

				//sends sig back to server

			} else {
				$("#error-tx").text("Error - The account you are trying to send to does not exist");
				toggleHide("#error-tx", true);
			}
		})
		
	
	//} else {
		//console.log("NEED TIMER");
	//}
			
		}
	} else {

	if (isValid) {
		isValid = false;
		let _token = $("#selector").val()
		let _to = $('#to').val();
		let _memo = $("#memo").val();
		let _amountInput = $('#amount').val();
		let _amountCheck = $(`.${_token}`);
		let stringNum = _amountCheck.text();
		let checkNumArr = stringNum.split(" ");
		let _amountAgainst = Number(checkNumArr[0]);

		//if (_amountInput <= _amountAgainst) {

		let _amount = $('#amount').val() + " " + _token;
		$.post('/transaction', {from: account, to: _to, amount: _amount, memo: _memo, pubkeys: pub}, function(data, status) {
			//signs serialized tx
			let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
			let packedTr = data.packedTr;
			let sig = []
			sig.push(ecc.sign(bufferOriginal, priv));

			if (!data.e) {
				//sends sig back to server
				$.post('/pushtransaction', {sigs: ecc.sign(bufferOriginal, priv), packedTr: packedTr}, function(data, status){
					toggleHide("#success", true);
					$("#tx-id").text("Transaction Id: " + data.transaction_id);
					setTimeout(function(){toggleHide("#success", false); getInfo(account);}, 4000);
				});
			} else {
				$("#error-tx").text("Error - The account you are trying to send to does not exist");
				toggleHide("#error-tx", true);
			}
		})
		setTimeout(function(){isValid=true;}, 1000);
	//} else {
		//console.log("NEED TIMER");
	//}
			
		}

	}

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
	//$.post('/createaccount', {pubkey: pubkeys}, function(res, res, status){

	//});
});

});


