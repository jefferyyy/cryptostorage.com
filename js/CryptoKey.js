/**
 * Maintains a single private key.
 * 
 * @param plugin is a plugin for a specific cryptocurrency
 * @param state defines the initial state (optional)
 */
function CryptoKey(plugin, state) {
	
	this.copy = function() {
		return new CryptoKey(this.plugin, this.state);
	}
	
	this.equals = function(cryptoKey) {
		return mapsEqual(this.getState(), cryptoKey.getState());
	}
	
	this.getPlugin = function() {
		return this.plugin;
	}
	
	this.getState = function() {
		return this.state;
	}
	
	this.random = function() {
		this.setPrivateKey(this.plugin.newUnencryptedPrivateKeyHex());
	}
	
	this.setPrivateKey = function(str) {
		this.setState({privateKey: str});
	}
	
	this.toAddress = function() {
		return this.state.address;
	}
	
	this.toHex = function() {
		return this.state.hex;
	}

	this.toWif = function() {
		return this.state.wif;
	}
	
	this.encrypt = function(scheme, password, callback) {
		this.plugin.encrypt(scheme, this, password, function(encrypted, error) {
			if (encrypted) that.setState({privateKey: encrypted, address: that.toAddress(), encryption: scheme});
			callback(error);
		});
	}
	
	this.decrypt = function(password, callback) {
		this.plugin.decrypt(this.getEncryptionScheme(), this, password, function(decrypted, error) {
			if (decrypted) that.setState({privateKey: decrypted, address: that.toAddress()});
			callback(error);
		});
	}
	
	this.isEncrypted = function() {
		return isInitialized(this.state.encryption);
	}
	
	this.getEncryptionSchemes = function() {
		return this.plugin.getEncryptionSchemes();
	}
	
	this.getEncryptionScheme = function() {
		return this.state.encryption;
	}
	
	this.setState = function(state) {
		
		// copy state
		this.state = Object.assign({}, state);
		
		// set private key
		if (state.privateKey) {
			if (plugin.isPrivateKeyHex(state.privateKey)) {
				this.state.hex = state.privateKey;
				this.state.wif = plugin.privateKeyHexToWif(state.privateKey);
			} else if (plugin.isPrivateKeyWif(state.privateKey)) {
				this.state.hex = plugin.privateKeyWifToHex(state.privateKey);
				this.state.wif = state.privateKey;
			} else throw new Error("Unrecognized private key: " + state.privateKey);
		}
		
		// set encryption
		let encryption = plugin.getEncryptionScheme(state.privateKey);
		if (state.encryption && state.encryption !== encryption) throw new Error("state.encryption does not match detected encryption");
		this.state.encryption = encryption;
		
		// set address
		if (!this.state.encryption) {
			let address = plugin.getAddress(this);
			if (state.address && state.address !== address) throw new Error("state.address does not match address derived from private key");
			this.state.address = address;
		}
	}
	
	// initialize key
	if (!isObject(plugin, 'CryptoPlugin')) throw new Error("Must provide crypto plugin");
	this.plugin = plugin;
	var that = this;
	this.state = {};
	if (state) {
		if (isString(state)) this.setPrivateKey(state);
		else this.setState(state);
	}
	else this.random();
}