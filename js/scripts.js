(function() {
	'use strict';
	var getSourceName, getSourceURL, xmlToJson, closeModal, loadSources, loadStories,
	saveActiveSource;
	var storage, container, settingsURL, settingsLink, close, selectSource, sources;

	storage = chrome.storage.local;
	container = document.querySelector('#container');
	close = document.querySelector('.close');
	selectSource = document.getElementById('change-source');
	settingsURL = chrome.extension.getURL('settings.html');
	settingsLink = document.querySelector('.settings-link').href = settingsURL;
	sources = new Array();

	getSourceName = function( shortName ) {
		var r = [
			{cnn: 'CNN'},
			{wapo: 'Washington Post'},
			{npr: 'NPR'},
			{deadspin: 'Deadspin'},
			{root: 'The Root'},
			{jezebel: 'Jezebel'},
			{mashable: 'Mashable'},
			{reuters: 'Reuters'},
			{gizmodo: 'Gizmodo'},
			{nytimes: 'New York Times'},
			{seattle: 'Seattle Times'},
			{latimes: 'LA Times'},
			{denver: 'Denver Post'},
			{chicago: 'Chicago Times'},
			{gothamist: 'The Gothamist'},
			{abc: 'ABC News'},
			{guardian: 'The Guardian'},
			{pbs: 'PBS'},
			{npr: 'NPR'},
			{bbc: 'BBC'},
			{slashdot: 'Slashdot'},
			{economist: 'The Economist'},
			{slate: 'Slate'},
			{salon: 'Salon'},
			{techcrunch: 'Techcrunch'},
			{hacker: 'Hacker News'},
			{wired: 'Wired'},
			{espn: 'ESPN'},
			{propublica: 'ProPublica'},
			{time: 'Time Magazine'},
			{wallstreet: 'The Wall Street Journal'}
		];

		for (var key in r ) {
			if( r[key].hasOwnProperty(shortName) ) {
				return Object.getOwnPropertyDescriptor(r[key],shortName).value;
				break;
			}
		}
	}

	getSourceURL = function( shortName ) {
		var r = [
			{cnn: 'http://rss.cnn.com/rss/edition.rss'},
			{wapo: 'http://feeds.washingtonpost.com/rss/national'},
			{mashable: 'http://feeds.mashable.com/Mashable'},
			{deadspin: 'http://deadspin.com/rss'},
			{root: 'http://www.theroot.com/rss'},
			{jezebel: 'http://jezebel.com/rss'},
			{reuters: 'http://feeds.reuters.com/reuters/topNews'},
			{gizmodo: 'https://gizmodo.com/rss'},
			{slashdot: 'http://rss.slashdot.org/Slashdot/slashdotMain'},
			{gothamist: 'http://feeds.gothamistllc.com/gothamist05'},
			{nytimes: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'},
			{seattle: 'https://www.seattletimes.com/feed/'},
			{latimes: 'http://www.latimes.com/rss2.0.xml'},
			{denver: 'http://feeds.denverpost.com/dp-news-topstories'},
			{chicago: 'http://www.chicagotribune.com/rss2.0.xml'},
			{miami: 'http://www.miamiherald.com/news/?widgetName=rssfeed&widgetContentId=712015&getXmlFeed=true'},
			{abc: 'http://abcnews.go.com/abcnews/topstories'},
			{guardian: 'https://www.theguardian.com/uk/rss'},
			{pbs: 'http://feeds.feedburner.com/NationPBSNewsHour'},
			{npr: 'http://www.npr.org/rss/rss.php?id=1001'},
			{bbc: 'http://feeds.bbci.co.uk/news/rss.xml'},
			{nbc: 'http://rss.nbcnews.com/'},
			{economist: 'http://www.economist.com/sections/united-states/rss.xml'},
			{slate: 'http://feeds.slate.com/slate'},
			{techcrunch: 'http://feeds.feedburner.com/TechCrunch/'},
			{hacker: 'https://news.ycombinator.com/rss'},
			{wired: 'https://www.wired.com/feed/rss'},
			{espn: 'http://www.espn.com/espn/rss/news'},
			{propublica: 'http://feeds.propublica.org/propublica/main'},
			{time: 'http://feeds2.feedburner.com/time/topstories'},
			{wallstreet: 'http://www.wsj.com/xml/rss/3_7085.xml'}
		];

		for (var key in r ) {
			if( r[key].hasOwnProperty(shortName) ) {
				return Object.getOwnPropertyDescriptor(r[key],shortName).value;
				break;
			}
		}
	}

	saveActiveSource = function() {
		var select = document.getElementById('change-source');
		var activeSource = select.options[select.selectedIndex].innerHTML;
		storage.set({'active_source': activeSource }, function() {});
	}

	loadSources = function() {
		var select = document.getElementById('change-source');

		storage.get('custom_sources', function(obj) {
			if( Object.keys(obj).length !== 0 ) {
				obj.custom_sources.forEach( function(v) {
					var src = {};
					src.name = v.name;
					src.url = v.url;
					sources.push(src);
				});
			}
		});

		storage.get('news_sources', function(obj) {
			if( Object.keys(obj).length !== 0 ) {
				obj.news_sources.forEach( function(v) {
					var src = {};
					src.name = getSourceName( v );
					src.url = getSourceURL( v );
					sources.push(src);
				});
			}

			if( sources.length >= 1 ) {
				var output = '';
				for (var i = 0; i < sources.length; i++) {
					var selector = document.getElementById('change-source');
					output += '<option value="' + sources[i].url + '">' + sources[i].name + '</option>';
				}

				selectSource.innerHTML = output;

				storage.get('active_source', function(obj) {
					if( Object.keys(obj).length !== 0 ) {
						for (var i = 0; i < select.options.length; i++) {
							if( select.options[i].innerHTML == obj.active_source ) {
								select.selectedIndex = i;
								loadStories();
								break;
							}
						}
					} else {
						loadStories();
					}
				});

			} else {
				var msg = 'Please visit the <a target="_blank" href="' + settingsLink + '"">Settings</a> panel to select sources';
				document.querySelector('.news-list').innerHTML = '<p class="no-sources">' + msg + '</p>';
				return false;
			}
		});
	}

	xmlToJson = function(xml) {
		
		var obj = {};

		if (xml.nodeType == 1) {
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	}

	closeModal = function() {
		window.close();
	}

	loadStories = function() {
	
		var select = document.getElementById('change-source');
		var feedURL = select.options[select.selectedIndex].value;
		var xhr = new XMLHttpRequest();

		document.querySelector('.news-list').innerHTML = '<img class="spinning" src="assets/spin.svg" />';

		xhr.open('GET', 'https://allorigins.me/get?url=' + feedURL );
		xhr.send(null);

		xhr.onreadystatechange = function () {
			var DONE = 4;
			var OK = 200;
			if (xhr.readyState === DONE) {
				if (xhr.status === OK ) {
					var parse = JSON.parse(xhr.responseText);
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(parse.contents, "text/xml");
						var r = [];
						var x = xmlDoc.getElementsByTagName('item');
						for (var i = 0; i < x.length; i++) {

							if( i > 20 ) {
								break;
							}

							var obj, title, description, link;
								obj = {};
								for (var c = 0; c < x[i].children.length; c++) {
									if( x[i].children[c].nodeName == "title" ) {
										// Fixes feedburner label
										var processTitle = x[i].children[c].innerHTML.replace("<![CDATA[", "").replace("]]>", "");
										var processLink = 
										obj.title = processTitle;
									} else if( x[i].children[c].nodeName == "link" ) {
										obj.link = x[i].children[c].innerHTML.replace("<![CDATA[", "").replace("]]>", "");
									} else if( x[i].children[c].nodeName == "description" ) {
										obj.description = x[i].children[c].innerHTML;
									}
								}
								r.push(obj);
						}

						var str = '<ul>';

						if( r.length < 1 ) {
							document.querySelector('.news-list').innerHTML = '<p class="no-sources">Whoops! Something went wrong with this feed.</p>';
							return false;
						}

						r.forEach( function( obj ) {
							str += '<li><a target="_blank" href="' + obj.link + '">' + obj.title + '</a></li>';
						});

						str += '</ul>';
						document.querySelector('.news-list').innerHTML = str;

				} else {
					document.querySelector('.news-list').innerHTML = '<p class="no-sources">Whoops! Something went wrong with this feed.</p>';
					return false;
				}
			} else {
				document.querySelector('.news-list').innerHTML = '<p class="no-sources">Whoops! Something went wrong with this feed.</p>';	
				return false;
			}
		}	
	}

	/**
	 * Event listeners
	 */

	close.addEventListener('click', closeModal);
	selectSource.addEventListener('change', saveActiveSource);
	selectSource.addEventListener('change', loadStories);
	document.addEventListener('DOMContentLoaded', loadSources);

})();