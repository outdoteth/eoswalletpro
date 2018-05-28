let ecc = require('./eosjs-ecc/src/index');

$(document).ready(function() {

let priv;
let pub;
let account;
let foundScatter = false;
let scatter;
let scatterUnlocked = false;

document.addEventListener('scatterLoaded', scatterExtension => {
    // Scatter will now be available from the window scope.
    // At this stage the connection to Scatter from the application is 
    // already encrypted. 
    scatter = window.scatter;
    foundScatter = true;
    
    // It is good practice to take this off the window once you have 
    // a reference to it.
    window.scatter = null;
     
    // If you want to require a specific version of Scatter
    
    //...
});

$("#scatter-unlock").on("click", function() {
	if(foundScatter) {
		console.log("HELLO!");


		//returns public key
		scatter.getIdentity({accounts:[{blockchain:'eos', host:'http://192.99.200.155', port:8888, chainId: "a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca"}]}).then(identity => {
			console.log("blabla")
			console.log(identity);
			console.log(pub);
			console.log(scatter.identity);
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
    	}).catch(err => {console.log("err")});



    	//post request to get public key to account


    	//take to next page
    	//set signWithScatter to 'true'


    	//THEN write if(signWithScatter){scatter.sign(buf)};

	} else {
		console.log("FAIL!");
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
		console.log(pub);
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
										console.log(account_arr[i]);
										getInfo(account_arr[i]);
										account = account_arr[i];
									});
								}
							} else {

							}
			}
		});
		/*$.post('/login', {pubkeys: pub, account: account}, function(data) {
			if (data.login) {
				console.log(pub);
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

			} else {
				$("#error-account").text("Error - Private key does not match account permissions");
				toggleHide("#error-account", true);
			}
		})*/
	//}
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
		console.log(stringNum);
		let checkNumArr = stringNum.split(" ");
		console.log(checkNumArr);
		let _amountAgainst = Number(checkNumArr[0]);

		console.log(_amountAgainst);

		//if (_amountInput <= _amountAgainst) {

		let _amount = $('#amount').val() + " " + _token;
		console.log(_amount);
		console.log(account);
		$.post('/transaction', {from: account, to: _to, amount: _amount, pubkeys: pub}, function(data, status) {
			//signs serialized tx
			let bufferOriginal = Buffer.from(JSON.parse(data.buf).data);
			let packedTr = data.packedTr;
			console.log(packedTr);
			//let sig = []
			//sig.push(ecc.sign(bufferOriginal, priv));
			//console.log(sig);

			if (!data.e) {
				console.log(pub);
				scatter.getArbitrarySignature(
					pub, 
					bufferOriginal, 
					whatfor = 'Sign Transaction', 
					isHash = false
				).then(result3=>{

					$.post('/pushtransaction', {sigs: result3, packedTr: packedTr}, function(data, status){
						console.log(data);
						toggleHide("#success", true);
						$("#tx-id").text("Transaction Id: " + data.transaction_id);
						setTimeout(function(){isValid=true;}, 1000);
						setTimeout(function(){toggleHide("#success", false); getInfo(account);}, 4000);
					});


					console.log(result3)

				});

				//sends sig back to server

			} else {
				$("#error-tx").text("Error - The account you are trying to send to does not exist");
				toggleHide("#error-tx", true);
			}
		})
		
	
	//} else {
		console.log("NEED TIMER");
	//}
			
		}
	} else {

	if (isValid) {
		isValid = false;
		let _token = $("#selector").val()
		let _to = $('#to').val();
		let _amountInput = $('#amount').val();
		let _amountCheck = $(`.${_token}`);
		let stringNum = _amountCheck.text();
		console.log(stringNum);
		let checkNumArr = stringNum.split(" ");
		console.log(checkNumArr);
		let _amountAgainst = Number(checkNumArr[0]);

		console.log(_amountAgainst);

		//if (_amountInput <= _amountAgainst) {

		let _amount = $('#amount').val() + " " + _token;
		console.log(_amount);
		console.log(account);
		$.post('/transaction', {from: account, to: _to, amount: _amount, pubkeys: pub}, function(data, status) {
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

});


