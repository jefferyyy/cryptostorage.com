function debug() {
	console.log("MemLeak");
	
	let REPEAT = 10;
	
	let funcs = [];
	for (let i = 0; i < REPEAT; i++) {
		funcs.push(getNonLeakFunc());
	}
	console.log("Executing");
	async.series(funcs, function(err, result) {
		console.log("Returned");
		console.log(err);
		console.log(result);
	});
	
		
	function getLeakFunc() {
		return function(callback) {
			let passwd = "abctesting123";
			let salt = [236,37,238,244,127,110,228,155];
			let N = 16384;
			let r = 8;
			let p = 8;
			let dkLen = 32;
			Crypto_scrypt(passwd, salt, N, r, p, dkLen, function(resp) {
				callback(null, resp);
			});
		}
	}
	
	function getNonLeakFunc() {
		return function(callback) {
			let passwd = [3,52,115,225,93,101,43,10,145,237,162,123,83,189,56,166,158,68,87,202,169,201,125,210,90,119,196,150,144,134,195,41,74];
			let salt = [113,6,227,15,236,37,238,244,127,110,228,155];
			let N = 1024;
			let r = 1;
			let p = 1;
			let dkLen = 64;
			Crypto_scrypt(passwd, salt, N, r, p, dkLen, function(resp) {
				callback(null, resp);
			});
		}
	}
	
//	function getNonLeakFunc() {
//		return function(callback) {
//			let passwd = [3,52,115,225,93,101,43,10,145,237,162,123,83,189,56,166,158,68,87,202,169,201,125,210,90,119,196,150,144,134,195,41,74];
//			let salt = [113,6,227,15,236,37,238,244,127,110,228,155];
//			let N = 1024;
//			let r = 1;
//			let p = 1;
//			let dkLen = 64;
//			Crypto_scrypt(passwd, N, r, p, dkLen);
//		}
//	}
	
	//Crypto_scrypt([abctesting123], 92,106,85,110,182,105,144,200, 16384, 8, 8, 32)
	//Crypto_scrypt([3,52,115,225,93,101,43,10,145,237,162,123,83,189,56,166,158,68,87,202,169,201,125,210,90,119,196,150,144,134,195,41,74], 184,225,21,133,92,106,85,110,182,105,144,200, 1024, 1, 1, 64)
}