// ==UserScript==
// @name           HV - Item Menu (Salvage quality)
// @namespace      HVIM 
// @match          http://hentaiverse.org/*
// @description	   鼠标中键物品快捷菜单
// @run-at         document-end
// ==/UserScript==

var xhr = null;

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
	
	/**
	 * 装备品质 : 
	 * Average 
	 * Superior 
	 * 
	 */
	 // 分解掉指定品质的装备
	function salvageAll(name,id,key,item) {
		if (xhr != null || !confirm('Salvage **E+**?')) return;
		var itemList=document.getElementById("item_pane").getElementsByClassName("eqdp");
		for(i=0;i<itemList.length;i++){
			var currentItem=itemList[i];
			var data = currentItem.getAttribute('onmouseover');
			var temp = data.match(/equips.set\((\d+),\s?'(.+?)'\)/);
			var name = data.match(/'[^']+'/g)[1].slice(1,-1), id = temp[1], key = temp[2];
			salvage(name,id,key,currentItem);
		}
	}
	/// 分解所有Superior级别
	function salvageAllSuperior(name,id,key,item) {
		if (xhr != null || !confirm('Salvage ALL Superior ?')) return;
		var itemList=document.getElementById("item_pane").getElementsByClassName("eqdp");
		for(i=0;i<itemList.length;i++){
			var currentItem=itemList[i];
			var data = currentItem.getAttribute('onmouseover');
			var temp = data.match(/equips.set\((\d+),\s?'(.+?)'\)/);
			var quality =  data.match(/Superior/); ///指定的品质
			if (quality==null) {
				continue;
			}
			var name = data.match(/'[^']+'/g)[1].slice(1,-1), id = temp[1], key = temp[2];
			salvage(name,id,key,currentItem);
		}
	}
	/// 分解所有Exquisite级别
	function salvageAllExquisite(name,id,key,item) {
		if (xhr != null || !confirm('Salvage ALL Exquisite ?')) return;
		var itemList=document.getElementById("item_pane").getElementsByClassName("eqdp");
		for(i=0;i<itemList.length;i++){
			var currentItem=itemList[i];
			var data = currentItem.getAttribute('onmouseover');
			var temp = data.match(/equips.set\((\d+),\s?'(.+?)'\)/);
			var quality =  data.match(/Exquisite/); ///指定的品质
			if (quality==null) {
				continue;
			}
			var name = data.match(/'[^']+'/g)[1].slice(1,-1), id = temp[1], key = temp[2];
			salvage(name,id,key,currentItem);
		}
	}
	function salvage(name,id,key,item) {
	
		//if (xhr != null || /Salvaged/.test(item.textContent) || !confirm('Salvage ' + name + '?')) return;
		
		var target = item.querySelector('.fd2 > div');
		var xhr = [target,target.textContent,new XMLHttpRequest()];
		xhr[2].open('POST','/?s=Forge&ss=sa&filter=' + getType(name),true);
		xhr[2].setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		xhr[2].onload = function(x) {
		
			if (xhr[2].readyState != 4) return;
			
			var temp = document.createElement('div'), result;
			temp.innerHTML = xhr[2].responseText;
			
			var message = temp.querySelector('#messagebox');
			if (message) {
				var results = temp.querySelector('#messagebox .cmb6:last-child').textContent.trim();
				result = 'Salvaged: ' + ( /No usable/.test(results) ? ' no usable materials ' : results.replace(/^Salvaged\s/,'') );
			} else {
				xhr[0].parentNode.parentNode.removeAttribute('class');
				result = xhr[1]
			}
			
			xhr[0].textContent = result;			
			xhr = null;
			
		}
		
		xhr[0].textContent = 'Salvaging...';		
		xhr[0].parentNode.parentNode.className = 'salvaging';
		xhr[2].send('select_item=' + id + '&select_action=salvage');

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
		'Salvage': salvage,
		'Link': link,
		'Upgrade': upgrade,
		'Enchant': enchant,
		'Item World': itemWorld,
		'Salvage ALL': salvageAll,
		'Salvage ALL Superior': salvageAllSuperior,
		'Salvage ALL Exquisite': salvageAllExquisite
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
			hideMenu('Salvage','Upgrade','Enchant','Item World');
			hideMenu('Salvage ALL');
			hideMenu('Salvage ALL Superior');
			hideMenu('Salvage ALL Exquisite');
		}
			
		if (currentItem.id == 'slot_pane'){
			hideMenu('Salvage ALL');
			hideMenu('Salvage ALL Superior');
			hideMenu('Salvage ALL Exquisite');
		}
			
		if (document.evaluate('ancestor::div[starts-with(@class,"eqp")][1]//img[contains(@src,"_closed.png")]',currentItem,null,9,null).singleNodeValue){
			hideMenu('Salvage ALL');
			hideMenu('Salvage ALL Superior');
			hideMenu('Salvage ALL Exquisite');
		}
			
		menu.style.top = (e.clientY+2) + 'px';
		menu.style.left = (e.clientX+2) + 'px';
		handleMenu(true);
		document.body.appendChild(menu);
		
	},false);

}
