// ==UserScript==
// @name           HV - Send to R
// @namespace      HVS2FS_R
// @match          http://hentaiverse.org/*
// @match          http://alt.hentaiverse.org/*
// @description    Send to FreeShop at Equipment Shop Screen. base on "HV - Item Menu" .Press Middle mouse button,Move to 'Send to Freeshop',Release  Middle mouse button.
// @run-at         document-end
// ==/UserScript==

var xhr = null;
var xhr_send =null;

// =====   maybe you can modify something there  =====
var FREESHOPID = ''; 
var MM_SUBJECT = '';
var MM_BODY = '';

// localStorage.MM_POST_KEY (will save in the brower localStorage)

if (document.querySelector('.eqdp, .eqde')) {
	
	function link(name,id,key) {
		prompt(name,'[url=http://hentaiverse.org/pages/showequip.php?eid=' + id + '&key=' + key + ']' + name + '[/url]');
	}

	function enchant(name,id,key,item) {
		var div = document.body.appendChild(document.createElement('div'));
		div.style.display = 'none';
		div.innerHTML = '<form action="/?s=Bazaar&ss=fr&filter=' + getType(name) + '" method="POST"><input name="select_item" value="' + id + '" /><input name="select_action" value="enchant" /></form>';
		div.querySelector('form').submit();
	}
	
	function upgrade(name,id,key,item) {
		var div = document.body.appendChild(document.createElement('div'));
		div.style.display = 'none';
		div.innerHTML = '<form action="/?s=Bazaar&ss=fr&filter=' + getType(name) + '" method="POST"><input name="select_item" value="' + id + '" /><input name="select_action" value="upgrade" /></form>';
		div.querySelector('form').submit();
	}
	function freeshop(name,id,key,item) {
		//if (xhr != null || /Salvaged/.test(item.textContent) || !confirm('Salvage ' + name + '?')) return;
		var target = item.querySelector('.fd2 > div');
		var xhr = [target,target.textContent,new XMLHttpRequest()];
		/// first time send,need get the post key
		if (localStorage.MM_POST_KEY==null
			|| localStorage.MM_POST_KEY.match(/[0-9a-z]{32}/)==null){
			xhr[2].open('POST','/?s=Bazaar&ss=mm&filter=new',true);
			xhr[2].setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xhr[2].onload = function(x) {
				if (xhr[2].readyState != 4) return;
				var temp = document.createElement('div'), result;
				temp.innerHTML = xhr[2].responseText;
				temp.querySelector('#postkey');
				localStorage.MM_POST_KEY=temp.querySelector('#postkey').value;
				xhr[0].textContent = "Please Reload page,Postkey:"+localStorage.MM_POST_KEY;			
				xhr = null;
			}
			xhr[0].textContent = 'First Time,get Post_key...';		
			xhr[0].parentNode.parentNode.className = 'salvaging';
			xhr[2].send("");
			return true;
		}
		xhr[2].open('POST','/?s=Bazaar&ss=mm&filter=new',true);
		xhr[2].setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		xhr[2].onload = function(x) {
			if (xhr[2].readyState != 4) return;
			window.location.href="/?s=Bazaar&ss=mm&filter=new";
		};
		xhr[0].textContent = 'Add Attach...';		
		xhr[0].parentNode.parentNode.className = 'salvaging';
		xhr[2].send(""
			+'postkey='+localStorage.MM_POST_KEY
			+'&action=attach_add'
			+'&action_value=0'
			+'&select_item=' + id 
			+'&select_count=1'
			+'&select_pane=equip'
			+'&message_to_name=' + FREESHOPID
			+'&message_subject=' + MM_SUBJECT
			+'&message_body=' +MM_BODY
			+'&credhath_count=0'
		);
	}
	/*
	 * postkey:xxx
		action:send
		action_value:0
		select_item:0
		select_count:0
		select_pane:0
		message_to_name:FREESHOPID
		message_subject:Free Shop Donation
		message_body:nobody
		credhath_count:0
*/
	function salvage(name,id,key,item) {
		var WWidth = 450;
		var WHeight = 520;
		//var WLeft = Math.ceil((window.screen.width - WWidth) / 2);
		//var WTop = Math.ceil((window.screen.height - WHeight) / 2);
		var features = "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=" ;
		features+= WWidth + ",height=" + WHeight + ",left=" ;
		features+= ((screen.width - WWidth) / 2) + ",top=" + ((screen.height - WHeight) / 2)
		var MAIN_URL="http://"+location.host;
		var elink=MAIN_URL+"/pages/showequip.php?eid="+id+"&key="+key;
		window.open (elink, "_pu" + (Math.random() + "").replace(/0\./, ""), features);
		 window.focus();
	}
	
	function itemWorld(name,id,key,item) {
		if (!confirm('Enter Item World of ' + name + '?')) return;
		var div = document.body.appendChild(document.createElement('div'));
		div.style.display = 'none';
		div.innerHTML = '<form action="/?s=Battle&ss=iw&filter=' + getType(name) + '" method="POST"><input name="select_item" value="' + id + '" /><input name="select_reward" value="0" /></form>';
		div.querySelector('form').submit();
	}
	
	function getType(name) {
		return /Longsword|Mace|Scythe|Katana|Estoc/.test(name)?'2handed':
			/Staff/.test(name)?'staff':
			/Buckler|Kite Shield|Force Shield/.test(name)?'shield':
			/Cotton|Gossamer|Phase|Silk/.test(name)?'acloth':
			/Leather|Kevlar|Shade|Dragon/.test(name)?'alight':
			/Plate|Power|Shield (?!of)|Chainmail/.test(name)?'aheavy':
			'1handed';
	}
	
	// * * * * * * * * * *
	
	var items = {
		'Popup': salvage,
		'Link': link,
		'Upgrade': upgrade,
		'Enchant': enchant,
		'Item World': itemWorld,
		'Send': freeshop,
	}
	
	// * * * * * * * * * *
	
	var currentItem = null;
	
	function getRoot(x) {
		return document.evaluate('ancestor::div[@class="eqdp" or @class="eqde"]',x,null,9,null).singleNodeValue;
	}
	
	function getMenu() {
	
		if (getMenu.menu) {
			for (var x in getMenu.items) 
				getMenu.items[x].style.display = 'block';
			return getMenu.menu;
		}
		
		getMenu.menu = document.createElement('div');
		getMenu.menu.id = 'itemMenu';
		getMenu.items = { };
		
		for (var x in items) {
			var div = getMenu.menu.appendChild(document.createElement('div'));
			div.className = 'item';
			div.innerHTML = x;
			getMenu.items[x]  = div;
		}
		
		var style = document.createElement('style');
		style.innerHTML =
			'#itemMenu {  background-color: #EDEBDF; position: fixed; border-top: 1px solid #5c0D11; z-index: 100; text-align: left; }' +
			'.item { padding: 3px 6px; color: #5C0D11; border: 1px solid #5C0D11; border-top: none !important; cursor: pointer; }' +
			'.item:hover { background-color: #F2EFDF !important; text-decoration: underline; }' +
			'.salvaging ~ div { visibility: hidden; }';
		document.head.appendChild(style);
		
		return getMenu.menu;
		
	}
	
	function handleMenu(what) {
		
		if (what == true) {
			handleMenu(false);
			document.addEventListener('mouseup',handleMenu,false);
		} else if (what == false) {
			document.removeEventListener('mouseup',handleMenu,false);
		} else {
			if (what.target.className == 'item' && currentItem) {
				var data = currentItem.getAttribute('onmouseover');
				var temp = data.match(/equips.set\((\d+),\s?'(.+?)'\)/);
				var name = data.match(/'[^']+'/g)[1].slice(1,-1), id = temp[1], key = temp[2];
				items[what.target.textContent](name,id,key,currentItem);
				currentItem = null;
			}
			handleMenu(false);
			document.body.removeChild(getMenu());
		}
	
	}
	
	function hideMenu() {
		for (var i=0;i<arguments.length;i++) {
			if (getMenu.items[arguments[i]])
				getMenu.items[arguments[i]].style.display = 'none';
		}
	}
	
	document.addEventListener('mousedown',function(e) {
		if (e.which != 2) return;
		currentItem = getRoot(e.target);
		if (!currentItem) return;
		
		var menu = getMenu();

		if (document.evaluate('ancestor::div[@id="shop_pane"]',currentItem,null,9,null).singleNodeValue){
			hideMenu('Popup','Upgrade','Enchant','Item World');
			hideMenu('Send');
		}
			
		if (currentItem.id == 'slot_pane'){
			hideMenu('Popup');
			hideMenu('Send');
		}
			
		if (document.evaluate('ancestor::div[starts-with(@class,"eqp")][1]//img[contains(@src,"_closed.png")]',currentItem,null,9,null).singleNodeValue){
			hideMenu('Popup');
			hideMenu('Send');
		}
			
		menu.style.top = (e.clientY+2) + 'px';
		menu.style.left = (e.clientX+2) + 'px';
		handleMenu(true);
		document.body.appendChild(menu);
		
	},false);

}
