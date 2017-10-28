/**
 * UI utilities.
 */
let UiUtils = {
		
	setupContentDiv: function(div) {
		div.empty();
		div.attr("class", "page_div");
	},

	getCryptoName: function(state) {
		if (state.mix) return state.mix.length > 1 ? "mixed" : state.mix[0].plugin.getName();
		else {
			let name;
			for (let key of state.keys) {
				if (!name) name = key.getPlugin().getName();
				else if (name !== key.getPlugin().getName()) return "mixed";
			}
			return name;
		}
	},
	
	getCryptoLogo: function(state) {
		if (state.mix) return state.mix.length === 1 ? state.mix[0].plugin.getLogo() : this.getMixLogo();
		else {
			let ticker;
			for (let key of state.keys) {
				if (!ticker) ticker = key.getPlugin().getTicker();
				else if (ticker !== key.getPlugin().getTicker()) return this.getMixLogo();
			}
			return CryptoUtils.getCryptoPlugin(ticker).getLogo();
		}
	},
	
	getMixLogo: function() {
		return $("<img src='img/mix.png'>");
	},
	
	getProgressBar: function(div) {
		return new ProgressBar.Line(div.get(0), {
			strokeWidth: 2.5,
			color: 'rgb(96, 178, 198)',	// cryptostorage teal
			duration: 0,
			svgStyle: {width: '100%', height: '100%'},
			text: {
				className: 'progresbar-text',
				style: {
					color: 'black',
          position: 'absolute',
          left: '50%',
          top: '50%',
          padding: 0,
          margin: 0,
          transform: {
              prefix: true,
              value: 'translate(-50%, -50%)'
          }
				}
			}
		});
	},
	
	getCurrencyRow: function(plugins, isMajor, onCurrencyClicked) {
		let row = $("<div class='currency_row'>");
		for (let plugin of plugins) {
			let item = $("<div>").appendTo(row);
			item.attr("class", isMajor ? "currency_row_item_major" : "currency_row_item_minor");
			item.click(function() { onCurrencyClicked(plugin); });
			let img = $("<img src='" + plugin.getLogo().get(0).src + "'>").appendTo(item);
			img.attr("class", isMajor ? "currency_row_logo_major" : "currency_row_logo_minor");
			img.append(plugin.getLogo());
			let label = $("<div>").appendTo(item);
			label.attr("class", isMajor ? "currency_row_label_major" : "currency_row_label_minor");
			label.html(plugin.getName());
		}
		return row;
	},
	
	// --- relative weights of key generation derived from experimentation and used for representative progress bar ---
	
	getCreateKeyWeight: function() { return 63; },
	
	getEncryptWeight: function(scheme) {
		switch (scheme) {
			case CryptoUtils.EncryptionScheme.BIP38:
				return 4187;
			case CryptoUtils.EncryptionScheme.CRYPTOJS:
				return 10;
			default: throw new Error("Unrecognized encryption scheme: " + scheme);
		}
	},
	
	getDecryptWeight: function(scheme) {
		switch (scheme) {
			case CryptoUtils.EncryptionScheme.BIP38:
				return 4581;
			case CryptoUtils.EncryptionScheme.CRYPTOJS:
				return 100;
			default: throw new Error("Unrecognized encryption scheme: " + scheme);
		}
	},
	
	getQrWeight: function() {
		return 15;
	},
	
	getLogoWeight: function() {
		return 15;
	}
}

/**
 * Base class to render and control a div.
 */
function DivController(div) {
	this.div = div;
}
DivController.prototype.getDiv = function() { return this.div; }
DivController.prototype.render = function(onDone) { }	// callback called with rendered div
DivController.prototype.onShow = function() { }
DivController.prototype.onHide = function() { }

/**
 * Slider main features.
 */
function SliderController(div, onSelectGenerate, onSelectRecover) {
	DivController.call(this, div);
	this.render = function(onDone) {
		div.empty();
		div.attr("class", "intro_div");
		
		// intro slider
		let sliderContainerDiv = $("<div class='slider_container'>").appendTo(div);
		let sliderDiv = $("<div class='single-item'>").appendTo(sliderContainerDiv);
		getSlide($("<img src='img/mix.png'>"), "Generate secure storage for multiple cryptocurrencies.").appendTo(sliderDiv);
		getSlide($("<img src='img/security.png'>"), "Keys are generated in your browser so funds are never entrusted to a third party.").appendTo(sliderDiv);
		getSlide($("<img src='img/printer.png'>"), "Export to digital and printable formats for safe storage and easy recovery.").appendTo(sliderDiv);
		getSlide($("<img src='img/search_file.png'>"), "100% open source and free to use.  No account necessary.").appendTo(sliderDiv);
		getSlide($("<img src='img/password_protected.png'>"), "Private keys can be password protected and split into pieces.").appendTo(sliderDiv);
		sliderDiv.slick({autoplay:true, arrows:false, dots:true, autoplaySpeed:4000});
		
		function getSlide(img, text) {
			let slide = $("<div class='slide'>");
			let slideContent = $("<div class='slide_content'>").appendTo(slide);
			if (img) {
				let imgDiv = $("<div>").appendTo(slideContent);
				img.appendTo(imgDiv);
				img.attr("class", "slide_img");
			}
			let labelDiv = $("<div class='slide_label'>").appendTo(slideContent);
			labelDiv.html(text);
			return slide;
		}
		
		// call to action is overlaid
		let ctaDiv = $("<div class='cta_div'>").appendTo(div);
		
		// button to generate keys
		let btnGenerate = $("<div class='btn btn_start_generate'>").appendTo(ctaDiv);
		btnGenerate.append("Generate New Keys");
		btnGenerate.click(function() { onSelectGenerate(); });
		
		// button to recover keys
		let btnRecover = $("<div class='btn btn_recover'>").appendTo(ctaDiv);
		btnRecover.append("or Recover Existing Keys");
		btnRecover.click(function() { onSelectRecover(); });
		
		if (onDone) onDone(div);
	}
}
inheritsFrom(SliderController, DivController);

/**
 * Home page content.
 * 
 * @param div is the div to render to
 * @param onCurrencyClicked(plugin) is called when the user clicks a currency
 */
function HomeController(div, onCurrencyClicked) {
	DivController.call(this, div);
	this.render = function(onDone) {
		div.empty();
		div.attr("class", "page_div home_div");
		
		// supported currencies
		div.append("Supports these popular cryptocurrencies");
		let plugins = CryptoUtils.getCryptoPlugins();
		div.append(UiUtils.getCurrencyRow(plugins.slice(0, 3), true, onCurrencyClicked));
		for (let i = 3; i < plugins.length; i += 4) {
			div.append(UiUtils.getCurrencyRow(plugins.slice(i, i + 4), false, onCurrencyClicked));
		}
		
		if (onDone) onDone(div);
	}
}
inheritsFrom(HomeController, DivController);

/**
 * FAQ page.
 */
function FaqController(div) {
	DivController.call(this, div);
	this.render = function(onDone) {
		UiUtils.setupContentDiv(div);
		
		let titleDiv = $("<div class='title'>").appendTo(div);
		titleDiv.html("Frequently Asked Questions");
		
		$("<div class='question'>").html("What is cryptostorage.com?").appendTo(div);
		$("<div class='answer'>").html("Cryptostorage.com is an open source application to generate public/private key pairs for multiple cryptocurrencies.  This site runs only in your device's browser.").appendTo(div);
		$("<div class='question'>").html("How should I use cryptostorage.com to generate secure storage for my cryptocurrencies?").appendTo(div);
		$("<div class='answer'>").html("<ol><li>Download the source code and its signature file to a flash drive.</li><li>Verify the source code has not been tampered with: TODO</li><li>Test before using by sending a small transaction and verifying that funds can be recovered from the private key.</li></ol>").appendTo(div);
		$("<div class='question'>").html("How can I trust this service?").appendTo(div);
		$("<div class='answer'>").html("Cryptostorage.com is 100% open source and verifiable.  Downloading and verifying the source code will ensure the source code matches what is publicly audited.  See \"How do I generate secure storage using cryptostorage.com?\" for instructions to download and verify the source code.").appendTo(div);
		$("<div class='question'>").html("Do I need internet access to recover my private keys?").appendTo(div);
		$("<div class='answer'>").html("No.  The source code is everything you need to recover the private keys.  Users should save a copy of this site for future use so there is no dependence on third parties to access this software.  Further, the source code for this site is hosted on GitHub.com. (TODO)").appendTo(div);
		$("<div class='question'>").html("Can I send funds from private keys using cryptostorage.com?").appendTo(div);
		$("<div class='answer'>").html("Not currently.  Cryptostorage.com is a public/private key generation and recovery service.  It is expected that users will import private keys into the wallet software of their choice after keys have been recovered using crypstorage.com.  Support to send funds from cryptostorage.com may be considered in the future.").appendTo(div);
		$("<div class='question'>").html("What formats can I export to?").appendTo(div);
		$("<div class='answer'>").html("TODO").appendTo(div);
		
		// done rendering
		if (onDone) onDone(div);
	}
}
inheritsFrom(FaqController, DivController);

/**
 * Donate page.
 */
function DonateController(div, appController) {
	DivController.call(this, div);
	
	this.render = function(onDone) {
		UiUtils.setupContentDiv(div);
		
		// load qr code dependency
		loader.load("lib/qrcode.js", function() {
			
			// build donate section
			let titleDiv = $("<div class='title'>").appendTo(div);
			titleDiv.html("Donate");
			let values = [];
			for (let plugin of CryptoUtils.getCryptoPlugins()) {
				values.push({
					logo: plugin.getLogo(),
					label: plugin.getName(),
					value: plugin.getDonationAddress()
				});
			}
			renderValues(values, null, null, function(valuesDiv) {
				div.append(valuesDiv);
				
				// build credits section
				div.append("<br><br>");
				titleDiv = $("<div class='title'>").appendTo(div);
				titleDiv.html("Credits");
				let values = [];
				values.push({
					logo: CryptoUtils.getCryptoPlugin("BTC").getLogo(),
					label: "bitaddress.org",
					value: "1NiNja1bUmhSoTXozBRBEtR8LeF9TGbZBN"
				});
				values.push({
					logo: CryptoUtils.getCryptoPlugin("XMR").getLogo(),
					label: "moneroaddress.org",
					value: "4AfUP827TeRZ1cck3tZThgZbRCEwBrpcJTkA1LCiyFVuMH4b5y59bKMZHGb9y58K3gSjWDCBsB4RkGsGDhsmMG5R2qmbLeW"
				});
				renderValues(values, null, null, function(valuesDiv) {
					div.append(valuesDiv);
					if (onDone) onDone(div);
				});
			});
		});
		
		/**
		 * Renders the given values.
		 * 
		 * @param values are [{logo: <logo>, label: <label>, value: <value>}, ...].
		 * @param config is the config to render (TODO)
		 * @param onProgress(done, total, label) is invoked as progress is made (TODO)
		 * @param onDone(div) is invoked when done
		 */
		function renderValues(values, config, onProgress, onDone) {
			
			// div to render to
			let valuesDiv = $("<div>");
			
			// collect functions to render values
			let left = true;
			let funcs = [];
			for (let value of values) {
				let valueDiv = $("<div>").appendTo(valuesDiv); 
				if (left) {
					funcs.push(function(onDone) { renderLeft(valueDiv, value, onDone); });
				} else {
					funcs.push(function(onDone) { renderRight(valueDiv, value, onDone); });
				}
				left = !left;
			}
			
			// render addresses in parallel
			async.parallel(funcs, function(err, results) {
				if (err) throw err;
				onDone(valuesDiv);
			});
		}
		
		function renderLeft(div, value, onDone) {
			div.attr("class", "value_left");
			let qrDiv = $("<div>").appendTo(div);
			let labelValueDiv = $("<div class='value_label_value'>").appendTo(div);
			let logoLabelDiv = $("<div class='value_left_logo_label'>").appendTo(labelValueDiv);
			let logo = $("<img src='" + value.logo.get(0).src + "'>").appendTo(logoLabelDiv);
			logo.attr("class", "value_logo");
			let valueLabelDiv = $("<div class='value_label'>").appendTo(logoLabelDiv);
			valueLabelDiv.append(value.label);
			let valueDiv = $("<div class='value_left_value'>").appendTo(labelValueDiv);
			valueDiv.append(value.value);
			
			// render qr code
			CryptoUtils.renderQrCode(value.value, null, function(img) {
				img.attr("class", "value_qr");
				qrDiv.append(img);
				onDone();
			});
		}
		
		function renderRight(div, value, onDone) {
			div.attr("class", "value_right");
			let labelValueDiv = $("<div class='value_label_value'>").appendTo(div);
			let logoLabelDiv = $("<div class='value_right_logo_label'>").appendTo(labelValueDiv);
			let logo = $("<img src='" + value.logo.get(0).src + "'>").appendTo(logoLabelDiv);
			logo.attr("class", "value_logo");
			let valueLabelDiv = $("<div class='value_label'>").appendTo(logoLabelDiv);
			valueLabelDiv.append(value.label);
			let valueDiv = $("<div class='value_right_value'>").appendTo(labelValueDiv);
			valueDiv.append(value.value);
			let qrDiv = $("<div>").appendTo(div);
			
			// render qr code
			CryptoUtils.renderQrCode(value.value, null, function(img) {
				img.attr("class", "value_qr");
				qrDiv.append(img);
				onDone();
			});
		}
		
		function renderValuePairs(values, config, onProgress, onDone) {
			// TODO: reconcile with PieceRenderer
		}
	}
}
inheritsFrom(DonateController, DivController);

/**
 * Form page.
 */
function FormController(div) {
	DivController.call(this, div);
	
	let passphraseCheckbox;
	let passphraseInput;
	let splitCheckbox;
	let numPiecesInput;
	let minPiecesInput;
	let currencyInputsDiv;	// container for each currency input
	let currencyInputs;			// tracks each currency input
	let decommissioned;
	let progressDiv;
	let progressBar;
	
	this.render = function(onDone) {
		
		// initial state
		UiUtils.setupContentDiv(div);
		decommissioned = false;
		
		// currency inputs
		currencyInputs = [];
		let currencyDiv = $("<div class='form_section_div'>").appendTo(div);
		currencyInputsDiv = $("<div class='currency_inputs_div'>").appendTo(currencyDiv);
		
		// link to add currency
		let addCurrencyDiv = $("<div class='add_currency_div'>").appendTo(currencyDiv);
		let addCurrencySpan = $("<span class='add_currency_span'>").appendTo(addCurrencyDiv);
		addCurrencySpan.html("+ Add another currency");
		addCurrencySpan.click(function() {
			addCurrency();
		});
		
		// add first currency input
		addCurrency();
		
		// passphrase checkbox
		let passphraseDiv = $("<div class='form_section_div'>").appendTo(div);
		passphraseCheckbox = $("<input type='checkbox' id='passphrase_checkbox'>").appendTo(passphraseDiv);
		let passphraseCheckboxLabel = $("<label for='passphrase_checkbox'>").appendTo(passphraseDiv);
		passphraseCheckboxLabel.html("&nbsp;Do you want to protect your private keys with a passphrase?");
		passphraseCheckbox.click(function() {
			if (passphraseCheckbox.prop('checked')) {
				passphraseInputDiv.show();
				passphraseInput.focus();
			} else {
				passphraseInputDiv.hide();
			}
		});
		
		// passphrase input
		let passphraseInputDiv = $("<div class='passphrase_input_div'>").appendTo(passphraseDiv);
		let passphraseWarnDiv = $("<div class='passphrase_warn_div'>").appendTo(passphraseInputDiv);
		passphraseWarnDiv.append("This passphrase is required to access funds later on.  Don’t lose it!");
		passphraseInputDiv.append("Passphrase");
		passphraseInput = $("<input type='password' class='passphrase_input'>").appendTo(passphraseInputDiv);
		let showPassphraseCheckboxDiv = $("<div class='passphrase_checkbox_div'>").appendTo(passphraseInputDiv);
		let showPassphraseCheckbox = $("<input type='checkbox' id='show_passphrase'>").appendTo(showPassphraseCheckboxDiv);
		let showPassphraseCheckboxLabel = $("<label for='show_passphrase'>").appendTo(showPassphraseCheckboxDiv);
		showPassphraseCheckboxLabel.html("&nbsp;Show passphrase");
		showPassphraseCheckbox.click(function() {
			if (showPassphraseCheckbox.prop('checked')) {
				passphraseInput.attr("type", "text");
			} else {
				passphraseInput.attr("type", "password");
			}
			passphraseInput.focus();
		});
		
		// split checkbox
		let splitDiv = $("<div class='form_section_div'>").appendTo(div);
		splitCheckbox = $("<input type='checkbox' id='split_checkbox'>").appendTo(splitDiv);
		let splitCheckboxLabel = $("<label for='split_checkbox'>").appendTo(splitDiv);
		splitCheckboxLabel.html("&nbsp;Do you want to split your private keys into separate pieces?");
		splitCheckbox.click(function() {
			if (splitCheckbox.prop('checked')) {
				splitInputDiv.show();
			} else {
				splitInputDiv.hide();
			}
		});
		
		// split input
		let splitInputDiv = $("<div class='split_input_div'>").appendTo(splitDiv);
		let splitQr = $("<img class='split_qr' src='img/qr_code.png'>").appendTo(splitInputDiv);
		let splitLines3 = $("<img class='split_lines_3' src='img/split_lines_3.png'>").appendTo(splitInputDiv);
		let splitNumDiv = $("<div class='split_num_div'>").appendTo(splitInputDiv);
		let splitNumLabelTop = $("<div class='split_num_label_top'>").appendTo(splitNumDiv);
		splitNumLabelTop.html("Split Each Key Into");
		numPiecesInput = $("<input type='number' value='3'>").appendTo(splitNumDiv);
		let splitNumLabelBottom = $("<div class='split_num_label_bottom'>").appendTo(splitNumDiv);
		splitNumLabelBottom.html("Pieces");
		let splitLines2 = $("<img class='split_lines_2' src='img/split_lines_2.png'>").appendTo(splitInputDiv);
		let splitMinDiv = $("<div class='split_min_div'>").appendTo(splitInputDiv);
		let splitMinLabelTop = $("<div class='split_min_label_top'>").appendTo(splitMinDiv);
		splitMinLabelTop.html("Require");
		minPiecesInput = $("<input type='number' value='2'>").appendTo(splitMinDiv);
		let splitMinLabelBottom = $("<div class='split_min_label_bottom'>").appendTo(splitMinDiv);
		splitMinLabelBottom.html("To Recover");		
		
		// apply default configuration
		passphraseCheckbox.prop('checked', false);
		passphraseInputDiv.hide();
		showPassphraseCheckbox.prop('checked', false);
		splitCheckbox.prop('checked', false);
		splitInputDiv.hide();
		
		// add generate button
		let generateDiv = $("<div class='generate_div'>").appendTo(div);
		let btnGenerate = $("<div class='btn_generate'>").appendTo(generateDiv);
		btnGenerate.append("Generate keys");
		btnGenerate.click(function() { onGeneratePieces() });
		
		// under development warning
		let warningDiv = $("<div class='app_header_warning'>").appendTo(div);
		warningDiv.append("Under Development: Not Ready for Use");
		
		// add progress bar and div
		progressDiv = $("<div>").appendTo(div);
		progressDiv.hide();
		progressBar = UiUtils.getProgressBar(progressDiv);
		
		// done rendering
		if (onDone) onDone(div);
	}
	
	this.setSelectedCurrency = function(plugin) {
		assertTrue(currencyInputs.length === 1);
		currencyInputs[0].setSelectedCurrency(plugin.getName());
	}
	
	// -------------------------------- PRIVATE ---------------------------------
	
	/**
	 * Generates pieces based on the current configuration and updates the GUI.
	 */
	function onGeneratePieces(onDone) {
		generateKeys(function(done, total, label) {
			progressBar.set(done / total);
			if (label) progressBar.setText(label);
			progressDiv.show();
		}, function(keys, pieces, pieceDivs) {
			progressDiv.hide();
			let window = newWindow(null, "Export Storage", null, "css/style.css", getInternalStyleSheetText());
			let body = $("body", window.document);
			new ExportController(body, window, pieces, pieceDivs).render(function(div) {
				if (onDone) onDone();
			});
		});
	}
	
	function getConfig() {
		let config = {};
		config.passphraseChecked = passphraseCheckbox.prop('checked');
		config.passphrase = passphraseInput.val();
		config.splitChecked = splitCheckbox.prop('checked');
		config.numPieces = config.splitChecked ? parseFloat(numPiecesInput.val()) : 1;
		config.minPieces = config.splitChecked ? parseFloat(minPiecesInput.val()) : null;
		config.currencies = [];
		for (let currencyInput of currencyInputs) {
			config.currencies.push({
				plugin: currencyInput.getSelectedPlugin(),
				numKeys: currencyInput.getNumKeys(),
				encryption: config.passphraseChecked ? CryptoUtils.EncryptionScheme.CRYPTOJS : null	// TODO: collect encryption scheme from UI
			});
		}
		return config;
	}
	
	function addCurrency() {
		if (DEBUG) console.log("addCurrency()");
		
		// create input
		let currencyInput = new CurrencyInput($("<div>"), CryptoUtils.getCryptoPlugins(), function() {
			removeCurrency(currencyInput);
		});
		
		// add to page and track
		currencyInputs.push(currencyInput);
		currencyInput.getDiv().appendTo(currencyInputsDiv);
	}
	
	function removeCurrency(currencyInput) {
		let idx = currencyInputs.indexOf(currencyInput);
		if (idx < 0) throw new Error("Could not find currency input");
		currencyInputs.splice(idx, 1);
		currencyInput.getDiv().remove();
	}
	
	/**
	 * Encapsulate a currency input.
	 * 
	 * @param div is the div to render to
	 * @param onDelete is invoked when the user delets this input
	 */
	function CurrencyInput(div, plugins, onDelete) {
		assertInitialized(div);
		assertInitialized(plugins);
		
		let selectedPlugin;
		let numKeysInput;
		let selector;
		let selectorData;
		
		this.getDiv = function() {
			return div;
		}
		
		this.getSelectedPlugin = function() {
			return selectedPlugin;
		}
		
		this.setSelectedCurrency = function(name) {
			selector = $("#currency_selector");
			for (let i = 0; i < selectorData.length; i++) {
				if (selectorData[i].text === name) {
					selector.ddslick('select', {index: i});
					selectedPlugin = plugins[i];
					break;
				}
			}
		}
		
		this.getNumKeys = function() {
			return parseFloat(numKeysInput.val());
		}
		
		// render input
		render();
		function render() {
			div.empty();
			div.attr("class", "currency_input_div");
			
			// format pull down plugin data
			selectorData = [];
			for (let plugin of plugins) {
				selectorData.push({
					text: plugin.getName(),
					imageSrc: plugin.getLogo().get(0).src
				});
			}
			
			// create pull down
			selector = $("<div id='currency_selector'>").appendTo(div);
			selector.ddslick({
				data:selectorData,
				background: "white",
				imagePosition: "left",
				selectText: "Select a Currency",
				//defaultSelectedIndex: 0,
				onSelected: function(selection) {
					selectedPlugin = plugins[selection.selectedIndex];
					loader.load(selectedPlugin.getDependencies());	// start loading dependencies
				},
			});
			selector = $("#currency_selector");	// ddslick requires id reference
			
			// create right div
			let rightDiv = $("<div class='currency_input_right_div'>").appendTo(div);
			rightDiv.append("Number of keys&nbsp;&nbsp;");
			numKeysInput = $("<input type='number'>").appendTo(rightDiv);
			numKeysInput.attr("value", 1);
			rightDiv.append("&nbsp;&nbsp;");
			let trashDiv = $("<div class='trash_div'>").appendTo(rightDiv);
			trashDiv.click(function() { onDelete(); });
			let trashImg = $("<img class='trash_img' src='img/trash.png'>").appendTo(trashDiv);
		}
	}
	
	/**
	 * Generates keys, pieces, rendered pieces.
	 * 
	 * @param onProgress(done, total, label) is invoked as progress is made
	 * @param onDone(keys, pieces, pieceDivs) is invoked when done
	 */
	function generateKeys(onProgress, onDone) {
		
		// get current configuration
		let config = getConfig();

		// load dependencies
		let dependencies = new Set(COMMON_DEPENDENCIES);
		for (let currency of config.currencies) {
			for (let dependency of currency.plugin.getDependencies()) {
				dependencies.add(dependency);
			}
		}
		loader.load(Array.from(dependencies), function() {
			
			// compute total weight for progress bar
			let totalWeight = 0;
			let numKeys = 0;
			for (let currency of config.currencies) {
				numKeys += currency.numKeys;
				totalWeight += currency.numKeys * UiUtils.getCreateKeyWeight();
				if (currency.encryption) totalWeight += currency.numKeys * (UiUtils.getEncryptWeight(currency.encryption) + (VERIFY_ENCRYPTION ? UiUtils.getDecryptWeight(currency.encryption) : 0));
			}
			let piecesRendererWeight = PieceRenderer.getPieceWeight(numKeys, config.numPieces, null);
			totalWeight += piecesRendererWeight;
			
			// collect key creation functions
			let funcs = [];
			for (let currency of config.currencies) {
				for (let i = 0; i < currency.numKeys; i++) {
					funcs.push(newKeyFunc(currency.plugin));
				}
			}
			
			// generate keys
			let progressWeight = 0;
			if (onProgress) onProgress(progressWeight, totalWeight, "Generating keys");
			async.series(funcs, function(err, keys) {
				if (decommissioned) {
					if (onDone) onDone();
					return;
				}
				if (err) throw err;
				let originals = keys;
				
				// collect encryption functions
				funcs = [];
				let keyIdx = 0;
				let passphrases = [];
				for (let currency of config.currencies) {
					for (let i = 0; i < currency.numKeys; i++) {
						if (currency.encryption) {
							funcs.push(encryptFunc(originals[keyIdx].copy(), currency.encryption, config.passphrase));
							passphrases.push(config.passphrase);
						}
						keyIdx++;
					}
				}
				
				// no encryption
				if (!funcs.length) {
					
					// convert keys to pieces
					let pieces = CryptoUtils.keysToPieces(originals, config.numPieces, config.minPieces);
					
					// validate pieces can recreate originals
					let keysFromPieces = CryptoUtils.piecesToKeys(pieces);
					assertEquals(originals.length, keysFromPieces.length);
					for (let i = 0; i < originals.length; i++) {
						assertTrue(originals[i].equals(keysFromPieces[i]));
					}
					
					// render pieces to divs
					if (onProgress) onProgress(progressWeight, totalWeight, "Rendering");
					renderPieceDivs(pieces, function(err, pieceDivs) {
						if (err) throw err;
						assertEquals(pieces.length, pieceDivs.length);
						if (onProgress) onProgress(1, 1, "Complete");
						if (onDone) onDone(keys, pieces, pieceDivs);
					});
				}
				
				// handle encryption
				else {
					
					// encrypt keys
					onProgress(progressWeight, totalWeight, "Encrypting keys");
					async.series(funcs, function(err, encryptedKeys) {
						if (decommissioned) {
							if (onDone) onDone();
							return;
						}
						if (err) throw err;
						
						// convert keys to pieces
						let pieces = CryptoUtils.keysToPieces(encryptedKeys, config.numPieces, config.minPieces);
						
						// validate pieces can recreate originals
						let keysFromPieces = CryptoUtils.piecesToKeys(pieces);
						assertEquals(encryptedKeys.length, keysFromPieces.length);
						for (let i = 0; i < encryptedKeys.length; i++) {
							assertTrue(encryptedKeys[i].equals(keysFromPieces[i]));
						}
						
						// verify encryption
						if (VERIFY_ENCRYPTION) {
							
							// collect decryption functions
							funcs = [];
							for (let i = 0; i < encryptedKeys.length; i++) {
								funcs.push(decryptFunc(encryptedKeys[i].copy(), passphrases[i]));
							}
							
							// decrypt keys
							onProgress(progressWeight, totalWeight, "Verifying encryption");
							async.series(funcs, function(err, decryptedKeys) {
								if (decommissioned) {
									if (onDone) onDone();
									return;
								}
								if (err) throw err;
								
								// verify equivalence
								assertEquals(originals.length, decryptedKeys.length);
								for (let i = 0; i < originals.length; i++) {
									assertTrue(originals[i].equals(decryptedKeys[i]));
								}
								
								// render pieces to divs
								onProgress(progressWeight, totalWeight, "Rendering");
								renderPieceDivs(pieces, function(err, pieceDivs) {
									if (err) throw err;
									assertEquals(pieces.length, pieceDivs.length);
									if (onProgress) onProgress(1, 1, "Complete");
									if (onDone) onDone(encryptedKeys, pieces, pieceDivs);
								});
							});
						}
						
						// don't verify encryption
						else {
							
							// render pieces to divs
							onProgress(progressWeight, totalWeight, "Rendering");
							renderPieceDivs(pieces, function(err, pieceDivs) {
								if (err) throw err;
								assertEquals(pieces.length, pieceDivs.length);
								onProgress(1, 1, "Complete");
								onDone(encryptedKeys, pieces, pieceDivs);
							});
						}
					});
				}
			});
			
			function newKeyFunc(plugin, callback) {
				return function(callback) {
					if (decommissioned) {
						callback();
						return;
					}
					setTimeout(function() {
						let key = plugin.newKey();
						progressWeight += UiUtils.getCreateKeyWeight();
						if (onProgress) onProgress(progressWeight, totalWeight, "Generating keys");
						callback(null, key);
					}, 0);	// let UI breath
				}
			}
			
			function encryptFunc(key, scheme, password) {
				return function(callback) {
					if (decommissioned) {
						callback();
						return;
					}
					key.encrypt(scheme, password, function(err, key) {
						progressWeight += UiUtils.getEncryptWeight(scheme);
						if (onProgress) onProgress(progressWeight, totalWeight, "Encrypting");
						setTimeout(function() { callback(err, key); }, 0);	// let UI breath
					});
				}
			}
			
			function decryptFunc(key, password) {
				return function(callback) {
					if (decommissioned) {
						callback();
						return;
					}
					let scheme = key.getEncryptionScheme();
					key.decrypt(password, function(err, key) {
						progressWeight += UiUtils.getDecryptWeight(scheme);
						if (onProgress) onProgress(progressWeight, totalWeight, "Decrypting");
						setTimeout(function() { callback(err, key); }, 0);	// let UI breath
					});
				}
			}
			
			function renderPieceDivs(pieces, onDone) {
				PieceRenderer.renderPieces(pieces, null, null, function(percent) {
					if (onProgress) onProgress(progressWeight + (percent * piecesRendererWeight), totalWeight, "Rendering");
				}, onDone);
			}
		});
	}
}
inheritsFrom(FormController, DivController);

/**
 * Recover page.
 */
function RecoverController(div) {
	DivController.call(this, div);
	this.render = function(onDone) {
		div.empty();
		div.attr("class", "recover_page");
		
		$("<div class='recover_filler'>").appendTo(div);
		let importDiv = $("<div class='import_div'>").appendTo(div);
		let tabsDiv = $("<div class='import_tabs_div'>").appendTo(importDiv);
		let importFromFileTab = $("<div class='import_tab_div'>").appendTo(tabsDiv);
		importFromFileTab.html("Import From File");
		importFromFileTab.click(function() { selectTab("file"); });
		let importFromTextTab = $("<div class='import_tab_div'>").appendTo(tabsDiv);
		importFromTextTab.html("Import From Text");
		importFromTextTab.click(function() { selectTab("text"); });
		let importContentDiv = $("<div class='import_content_div'>").appendTo(importDiv);
		importContentDiv.append("Content");
		
		// start on file tab by default
		selectTab("file");
		
		// done rendering
		if (onDone) onDone(div);
		
		function selectTab(selected) {
			switch (selected) {
			case "file":
				importFromFileTab.addClass("active_tab");
				importFromTextTab.removeClass("active_tab");
				console.log("Import From File");
				break;
			case "text":
				importFromFileTab.removeClass("active_tab");
				importFromTextTab.addClass("active_tab");
				console.log("Import From Text");
				break;
			default: throw new Error("Unrecognized selection: " + selected);
			}
		}
	}
}
inheritsFrom(RecoverController, DivController);

/**
 * Export page.
 * 
 * @param div is the div to render to
 * @param pieces are the pieces to export
 * @param pieceDivs are pre-rendered piece divs for display
 */
function ExportController(div, window, pieces, pieceDivs) {
	DivController.call(this, div);
	
	let printButton;
	let showPublicCheckbox;
	let showPrivateCheckbox;
	let showLogosCheckbox;
	let currentPiece;
	let pieceSelector;
	let printEnabled;
	
	this.render = function(onDone) {
		div.empty();
		
		// export header
		let exportHeader = $("<div class='export_header'>").appendTo(div);
		
		// export buttons
		let exportButtons = $("<div class='export_buttons'>").appendTo(exportHeader);
		printButton = $("<div class='export_button'>").appendTo(exportButtons);
		printButton.html("Print All");
		printButton.click(function() { printAll(); });
		let exportButton = $("<div class='export_button'>").appendTo(exportButtons);
		exportButton.html("Export All");
		exportButton.click(function() { console.log("Export All"); });
		let savePublicButton = $("<div class='export_button'>").appendTo(exportButtons);
		savePublicButton.html("Save Public Addresses");
		savePublicButton.click(function() { console.log("Save Public Addresses"); });
		let moreButton = $("<div class='export_button'>").appendTo(exportButtons);
		moreButton.html("...");
		moreButton.click(function() { console.log("More button clicked"); });
		
		// export checkboxes
		let exportCheckboxes = $("<div class='export_checkboxes'>").appendTo(exportHeader);
		showPublicCheckbox = $("<input type='checkbox' class='export_checkbox' id='showPublicCheckbox'>").appendTo(exportCheckboxes);
		let showPublicCheckboxLabel = $("<label class='export_checkbox_label' for='showPublicCheckbox'>").appendTo(exportCheckboxes);
		showPublicCheckboxLabel.html("Show public addresses");
		exportCheckboxes.append("&nbsp;&nbsp;&nbsp;");
		showPrivateCheckbox = $("<input type='checkbox' class='export_checkbox' id='showPrivateCheckbox'>").appendTo(exportCheckboxes);
		let showPrivateCheckboxLabel = $("<label class='export_checkbox_label' for='showPrivateCheckbox'>").appendTo(exportCheckboxes);
		showPrivateCheckboxLabel.html("Show private keys");
		exportCheckboxes.append("&nbsp;&nbsp;&nbsp;");
		showLogosCheckbox = $("<input type='checkbox' class='export_checkbox' id='showLogosCheckbox'>").appendTo(exportCheckboxes);
		let showLogosCheckboxLabel = $("<label class='export_checkbox_label' for='showLogosCheckbox'>").appendTo(exportCheckboxes);
		showLogosCheckboxLabel.html("Show currency logos");
		
		// apply default state
		showPublicCheckbox.prop('checked', true);
		showPrivateCheckbox.prop('checked', true);
		showLogosCheckbox.prop('checked', true);
		
		// piece selection
		let exportPieceSelection = $("<div class='export_piece_selection'>").appendTo(exportHeader);
		pieceSelector = $("<select class='piece_selector'>").appendTo(exportPieceSelection);
		for (let i = 0; i < pieces.length; i++) {
			let option = $("<option value='" + i + "'>").appendTo(pieceSelector);
			option.html("Piece " + (i + 1));
		}
		
		// currently showing piece
		currentPiece = $("<div class='export_current_piece'>").appendTo(div);
		
		// update pieces
		update(pieceDivs);
		
		// register events
		showPublicCheckbox.click(function() { update(); });
		showPrivateCheckbox.click(function() { update(); });
		showLogosCheckbox.click(function() { update(); });
		pieceSelector.change(function() {
			setVisible(pieceDivs, parseFloat(pieceSelector.find(":selected").val()));
		});

		// done rendering
		if (onDone) onDone(div);
	}
	
	// --------------------------------- PRIVATE --------------------------------
	
	function getPieceRendererConfig() {
		return {
			showPublic: showPublicCheckbox.prop('checked'),
			showPrivate: showPrivateCheckbox.prop('checked'),
			showCurrencyLogos: showLogosCheckbox.prop('checked')
		};
	}
	
	function printAll() {
		if (!printEnabled) return;
		let window = newWindow(currentPiece, "Print Test", null, null, getInternalStyleSheetText());
		//window.print();
	}
	
	function setPrintEnabled(bool) {
		printEnabled = bool;
		if (bool) {
			printButton.addClass("export_button");
			printButton.removeClass("export_button_disabled");
		} else {
			printButton.addClass("export_button_disabled");
			printButton.removeClass("export_button");
		}
	}
	
	function update(existingPieceDivs, onDone) {
		updateHeader();
		pieceDivs = existingPieceDivs;
		
		// handle pieces already exist
		if (pieceDivs) {
			setVisible(pieceDivs, parseFloat(pieceSelector.find(":selected").val()));
			setPieceDivs(pieceDivs);
			setPrintEnabled(true);
			if (onDone) onDone();
			return;
		}
		
		// render pieces
		pieceDivs = [];
		for (piece of pieces) pieceDivs.push($("<div>"));
		setVisible(pieceDivs, parseFloat(pieceSelector.find(":selected").val()));
		setPieceDivs(pieceDivs);
		setPrintEnabled(false);
		PieceRenderer.renderPieces(pieces, pieceDivs, getPieceRendererConfig(), null, function(err, pieceDivs) {
			setPrintEnabled(true);
			if (onDone) onDone();
		});
	}
	
	function setPieceDivs(pieceDivs) {
		currentPiece.empty();
		for (let pieceDiv of pieceDivs) currentPiece.append(pieceDiv);
	}
	
	/**
	 * Adds the hidden class to each of the given divs except at the given idx.
	 */
	function setVisible(divs, idx) {
		console.log("setVisible(" + idx + ")");
		for (let i = 0; i < divs.length; i++) {
			if (i === idx) divs[i].removeClass("hidden");
			else divs[i].addClass("hidden");
		}
	}
	
	function updateHeader() {
		showPrivateCheckbox.prop('checked') ? showPublicCheckbox.removeAttr('disabled') : showPublicCheckbox.attr('disabled', 'disabled');
		showPublicCheckbox.prop('checked') ? showPrivateCheckbox.removeAttr('disabled') : showPrivateCheckbox.attr('disabled', 'disabled');
		showLogosCheckbox.removeAttr('disabled');
	}
}
inheritsFrom(ExportController, DivController);