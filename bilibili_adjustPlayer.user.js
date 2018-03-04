// ==UserScript==
// @name        ����������bilibili.com������������
// @namespace   micky7q7
// @author      mickey7q7
// @license     MIT License
// @supportURL  https://github.com/mickey7q7/bilibili_adjustPlayer/issues
// @include     http*://www.bilibili.com/video/av*
// @include     http*://www.bilibili.com/watchlater/*
// @include     http*://www.bilibili.com/bangumi/play/ep*
// @include     http*://www.bilibili.com/bangumi/play/ss*
// @include     http*://bangumi.bilibili.com/anime/*/play*
// @include     http*://bangumi.bilibili.com/movie/*
// @exclude     http*://bangumi.bilibili.com/movie/
// @description ����Bվ���������ã�����һЩʵ�õĹ��ܡ�
// @version     1.0
// @grant       GM.setValue
// @grant       GM_setValue
// @grant       GM.getValue
// @grant       GM_getValue
// @grant       unsafeWindow
// @run-at      document-end
// ==/UserScript==
(function () {
	'use strict';
	var adjustPlayer = {
		doubleClickFullScreen: function (set,delayed) {
			if (typeof set !== 'undefined' && typeof delayed !== 'undefined') {
				try{
					if (delayed === 0 ) {
						var video = isBangumi('.bilibili-player-video video');
						video.addEventListener('dblclick', function () {
							var fullScreenBtn = isBangumi('div[name="browser_fullscreen"]');
							if (fullScreenBtn !== null) {
								doClick(fullScreenBtn);
							}
						});
					} else {
						var videoParentNodeEvent = function() {
							var dblclickTimer = null;
							var videoParentNode = isBangumi('.bilibili-player-video');
							videoParentNode.addEventListener('click', function () {
								clearTimeout(this.dblclickTimer);
								this.dblclickTimer = window.setTimeout(function() {
									var playPauseBtn = isBangumi('.bilibili-player-video-control > div.bilibili-player-video-btn-start');
									if (playPauseBtn !== null) {
										doClick(playPauseBtn);
									}
								}, delayed);
							});

							videoParentNode.addEventListener('dblclick', function () {
								clearTimeout(this.dblclickTimer);
								var fullScreenBtn = isBangumi('div[name="browser_fullscreen"]');
								if (fullScreenBtn !== null) {
									doClick(fullScreenBtn);
								}
							});
						};

						var iframePlayer = document.querySelector('iframe.bilibiliHtml5Player');
						if (iframePlayer === null) {
							window.eval( [
								'$(".bilibili-player-video").unbind("click");',
								'window.bilibiliPlayerVideoEvents = $(".bilibili-player-video").data("events")'
							].join(''));
						} else {
							iframePlayer.contentWindow.window.eval( [
								'$(".bilibili-player-video").unbind("click");',
								'top.window.bilibiliPlayerVideoEvents = $(".bilibili-player-video").data("events")'
							].join(''));
						}

						//console.log(unsafeWindow.bilibiliPlayerVideoEvents);
						if (typeof unsafeWindow.bilibiliPlayerVideoEvents === 'undefined') {
							videoParentNodeEvent();
						} else {
							if (typeof unsafeWindow.bilibiliPlayerVideoEvents.click === 'undefined') {
								videoParentNodeEvent();
							} else {
								console.log('doubleClickFullScreen�� unbind click event failed');
								return;
							}
							console.log('doubleClickFullScreen�� unbind click event failed');
						}
					}
				} catch (e) {console.log('doubleClickFullScreen��'+e);}
			}
		},
		autoWide: function (set,fullscreen) {
			if (typeof set !== 'undefined') {
				var player = isPlayer();
				if (player === "flashPlayer") {
					var flashPlayer = isBangumi('#bofqi');
					var newPlayer = isBangumi('param[name="flashvars"]');
					var oldPlayer = isBangumi('iframe[class="player"]');
					if (flashPlayer.getAttribute('class') !== 'scontent wide') {
						if (newPlayer !== null) {
							newPlayer.value += '&as_wide=1';
							flashPlayer.innerHTML = flashPlayer.innerHTML;
						} else if (oldPlayer !== null) {
							oldPlayer.src += '&as_wide=1';
						}
					}
				} else if (player === "html5Player") {
					var autoWidescreen = function () {
						var widescreenBtn = isBangumi('i[name="widescreen"]');
						if (widescreenBtn !== null) {
							if (widescreenBtn.getAttribute('data-text') !== '�˳�����') {
								doClick(widescreenBtn);
							}
						}
					};
					autoWidescreen();

					if (typeof fullscreen !== 'undefined' ) {
						if (fullscreen === 'on') {
							function fullscreenEvent(e) {
								var element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
								if(typeof element === 'undefined') {
									autoWidescreen();
								}
							}
							document.addEventListener("fullscreenchange", fullscreenEvent);
							document.addEventListener("webkitfullscreenchange", fullscreenEvent);
							document.addEventListener("mozfullscreenchange", fullscreenEvent);
							document.addEventListener("MSFullscreenChange", fullscreenEvent);
						}
					}
				}
			}
		},
		autoFocus: function (set,type,value,position,shortcuts) {
			if (typeof set !== 'undefined') {
				try{
					var scrollToY;
					var currentScrollToY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
					var playerHeight = document.querySelector('#bofqi .player').offsetHeight;

					if (matchURL.isWatchlater() === true) {
						scrollToY = document.querySelector('.video-box-module').offsetTop;
					} else if (matchURL.isBangumiMovie() === true) {
						var moviePlayWrapper = document.querySelector('.movie_play_wrapper');
						scrollToY = moviePlayWrapper.offsetParent.offsetTop + moviePlayWrapper.offsetTop;
					} else {
						var oldPlayerWrapper= document.querySelector('.player-wrapper');
						var newPlayerWrapper= document.querySelector('.player-box');
						if(oldPlayerWrapper !== null) {
							scrollToY = oldPlayerWrapper.offsetTop;
						} else {
							scrollToY = newPlayerWrapper.offsetTop;
						}
					}

					if(shortcuts === true){
						unsafeWindow.scrollTo(0, 0);
					}

					window.setTimeout(function() {
						if (typeof position !== 'undefined' ) {
							if (position === "video") {
								if (matchURL.isWatchlater()) {
									scrollToY = scrollToY + document.querySelector('#bofqi').offsetParent.offsetTop;
								} else if (matchURL.isBangumiMovie()) {
									scrollToY = scrollToY + document.querySelector('.movie_play').offsetTop - document.querySelector('.movie_play_wrapper').offsetTop;
								} else if (matchURL.isNewBangumi()) {
									scrollToY = scrollToY + document.querySelector('.bangumi-player').offsetTop;
								} else {
									scrollToY = scrollToY + document.querySelector('#bofqi').offsetTop;
								}
							}
						}

						if (typeof value !== 'undefined' && typeof type !== 'undefined') {
							if (type === "add") {
								scrollToY += value;
							} else if (type === "sub") {
								scrollToY -= value;
							}
						}

						if((scrollToY <= (currentScrollToY - playerHeight)) && shortcuts !== true){
							return;
						} else {
							unsafeWindow.scrollTo(0, scrollToY);
						}

					}, 200);

				} catch (e) {console.log('autoFocus��'+e);}
			}
		},
		autoPlay: function (set,video) {
			if (typeof set !== 'undefined' && video !== null) {
				var controlBtn = isBangumi('.bilibili-player-video-control div[name="pause_screen"]');
				var playButton = isBangumi('i[name="play_button"]');
				if (controlBtn === null) {
					if (video.play) {
						video.play();
					} else {
						doClick(playButton);
					}
				}
			}
		},
		hideDanmuku: function (set,type) {
			if (typeof set !== 'undefined') {
				var hideDanmuku = function () {
					var controlBtn = isBangumi('.bilibili-player-video-control > div[name="ctlbar_danmuku_on"] i');
					if (controlBtn !== null) {
						doClick(controlBtn);
					}
				};

				if (typeof type !== 'undefined') {
					if (type === "all") {
						hideDanmuku();
					} else if (type === "bangumi") {
						if (matchURL.isOldBangumi()) {
							hideDanmuku();
						} else if (matchURL.isNewBangumi()){
							hideDanmuku();
						}
					}
				} else {
					hideDanmuku();
				}
			}
		},
		danmukuPreventShade: function (set,type) {
			if (typeof set !== 'undefined' && typeof type !== 'undefined') {
				try{
					var controlBtn = isBangumi('.bilibili-player-panel-setting input.bilibili-player-setting-preventshade + label');
					if(controlBtn !== null) {
						doClick(controlBtn);
						window.setTimeout(function() {
							if (type === "on") {
								if (controlBtn.getAttribute("data-pressed") === "false") {
									doClick(controlBtn);
								}
							} else if (type === "off") {
								if (controlBtn.getAttribute("data-pressed") === "true") {
									doClick(controlBtn);
								}
							}
						}, 200);
					}
				} catch (e) {console.log('danmukuPreventShade��'+e);}
			}
		},
		autoNextPlist: function (set,video) {
			if (typeof set !== 'undefined' && video !== null) {
				try{
					if (isBangumi('.bilibili-player-video-btn-next > i') === null) { return; }

					var nextPlist = function(){
						if (isBangumi('.bilibili-player-video-btn-repeat > i').getAttribute("data-text") === "�ر�ϴ��ѭ��") { return; }
						var controlBtn = isBangumi('.bilibili-player-video-btn-next > i');
						if (controlBtn !== null) {
							doClick(controlBtn);
						}
					};

					video.addEventListener('ended',function () {
						nextPlist();
					}, false);

					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
					if (matchURL.isVideoAV() ) {
						var observer = new MutationObserver(function (records) {
							records.map(function (record) {
								var targetNode = record.target.getAttribute("class");
								if (targetNode.search("video-state-pause") !== -1) {
									var controlBtn = isBangumi('.bilibili-player-electric-panel');
									if (controlBtn !== null) {
										nextPlist();
									}
								}
							});
						});
						observer.observe(document.querySelector('#bofqi .bilibili-player-area'), {
							attributes: true,
							attributeFilter:['class'],
							childList: true
						});
					} else if (matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
						var observer = new MutationObserver(function (records) {
							records.map(function (record) {
								var targetNode = record.target.getAttribute("style");
								if (targetNode.search("display: block;") !== -1) {
									nextPlist();
								}
							});
						});
						observer.observe(document.querySelector('#bofqi .bilibili-player-bangumipay-panel'), {
							attributes: true,
							attributeFilter:['style'],
							childList: true
						});
					}
				} catch (e) {console.log('autoNextPlist��'+e);}
			}
		},
		autoLoopVideo: function (set) {
			if (typeof set !== 'undefined') {
				var controlBtn = isBangumi('.bilibili-player-video-btn-repeat > i');
				if (controlBtn !== null) {
					doClick(controlBtn);
				}
			}
		},
		autoWebFullScreen: function (set) {
			if (typeof set !== 'undefined') {
				var controlBtn = isBangumi('.bilibili-player-video-web-fullscreen > i');
				if (controlBtn !== null) {
					if (controlBtn.getAttribute("data-text") === "��ҳȫ��") {
						doClick(controlBtn);
					}
				}
			}
		},
		autoFullScreen: function (set,video) {
			if (typeof set !== 'undefined') {
				try{
					var fullScreen = function() {
						var controlBtn = isBangumi('div[name="browser_fullscreen"] > i[data-text="����ȫ��"]');
						if (controlBtn !== null) {
							doClick(controlBtn);
						}
					};
					fullScreen();
					document.addEventListener("keydown", function(e) {
						if (e.keyCode == 122) {
							fullScreen();
							return false;
						}
					}, false);
				}
				catch(e) {console.log('autoFullScreen��'+e);}
			}
		},
		autoVideoSpeed: function (set,video) {
			if (typeof set !== 'undefined' && video !== null) {
				switch (set) {
					case "0.5":
						video.playbackRate = 0.5;
						break;
					case "0.75":
						video.playbackRate = 0.75;
						break;
					case "1":
						break;
					case "1.25":
						video.playbackRate = 1.25;
						break;
					case "1.5":
						video.playbackRate = 1.5;
						break;
					case "2":
						video.playbackRate = 2;
						break;
					default:
						break;
				}
			}
		},
		autoLightOn: function (set) {
			if (typeof set !== 'undefined') {
				try{
					var heimu = document.querySelector('#heimu').getAttribute("style");
					if (heimu !== null && heimu.search("display: block;") !== -1) {
						return;
					}

					var isActiveContextMenu = isBangumi('.bilibili-player-context-menu-container.black');
					if (isActiveContextMenu.getAttribute("class").search("active") !== -1) {
						return;
					}

					if (isBangumi('#adjustMiniPlayerlightOnOff') === null ) {
						var css ='.bilibili-player-context-menu-container.black.active {opacity: 0; !important;}';
						var node = document.createElement('style');
						node.type = 'text/css';
						node.id = 'adjustPlayerlightOnOff';
						node.appendChild(document.createTextNode(css));
						isBangumi('.player').appendChild(node);
					}

					var contextMenu = isBangumi('.bilibili-player-area > .bilibili-player-video-wrap');
					contextMenuClick(contextMenu);

					clearTimeout(this.contextMenuTimer);
					this.contextMenuTimer = window.setTimeout(function() {
						var controlBtn = isBangumi('.bilibili-player-context-menu-container.black ul');
						if (controlBtn !== null) {
							var contextMenuItem = controlBtn.querySelectorAll('li > a'), i;
							for (i = 0; i < contextMenuItem.length; ++i) {
								if (contextMenuItem[i].innerHTML === "�ص�") {
									doClick(contextMenuItem[i]);
									break;
								}
							}
							var adjustPlayerlightOnOff = isBangumi('#adjustPlayerlightOnOff');
							adjustPlayerlightOnOff.parentNode.removeChild(adjustPlayerlightOnOff);
						}
					}, 200);
				}
				catch(e) {console.log('autoLightOn��'+e);}
			}
		},
		resizePlayer: function (set,width,height) {
			if (typeof set !== 'undefined' && typeof width !== 'undefined' && typeof height !== 'undefined') {
				try{
					var css = [
						'.bgray-btn-wrap { margin-left: calc('+ width +' / 2) !important; } ',
						'.player-wrapper .player-content, .video-box-module .bili-wrapper , .moviescontent, .widescreen .movie_play, #bofqi { width: '+ width +' !important; } ',
						'#bofqi .player, .moviescontent { width: '+ width +' !important; height: calc('+ height +' + 68px) !important; } ',
						'.player-wrapper .bangumi-player, #__bofqi.bili-wrapper { width: '+ width +' !important; background: none !important; height: auto !important;} ',
						'#bofqi.wide .autohide-controlbar, .wide.autohide-controlbar-movies { width: '+ width +' !important; height: calc('+ height +' + 0px) !important; } '
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerSize';

					var player = isPlayer();
					if (player === "flashPlayer") {
						//�޸� flash ������ ��ҳȫ���������Ͻ�
						css.push(
							'body[style$="position: fixed; width: 100%; height: 100%; padding: 0px; margin: 0px;"] #bofqi .player{ width: 100% !important; height: 100% !important; } ',
							'body[style$="position: fixed; width: 100%; height: 100%; padding: 0px; margin: 0px;"] .player-wrapper .player-content ,body[style$="position: fixed; width: 100%; height: 100%; padding: 0px; margin: 0px;"] #bofqi { width: 100% !important; } '
						);

						if (isBangumi('#adjustPlayerSize')) {
							return;
						} else {
							node.appendChild(document.createTextNode(css.join('')));
							document.documentElement.appendChild(node);
						}
					} else if (player === "html5Player") {
						var fixResize= function(){
							//�޸��ڼ�ർ�µ� ���ڱߡ�
							isBangumi('.bilibili-player-video video').parentNode.setAttribute("style","padding: 0px !important;");

							//�޸� Firefox ��bangumi ҳ��Ļ����ʧ
							isBangumi('.bilibili-player-video-inputbar').setAttribute("style","float:none !important;");

							//�޸����Զ�����ģʽ�� û�й�ѡ�����޷�������С
							var evt = document.createEvent('Event');
							evt.initEvent('resize', true, true);
							isBangumi('.bilibili-player-video video').dispatchEvent(evt);
						};
						if (isBangumi('#adjustPlayerSize')) {
							fixResize();
							return;
						} else {
							node.appendChild(document.createTextNode(css.join('')));
							document.documentElement.appendChild(node);
							fixResize();
						}
					}

					//�޸��������ߴ����ù���ʱ������������Ԫ���ڵ�
					var gotop;
					if (matchURL.isVideoAV()) {
						var oldNav= document.querySelector('#index_nav');
						var newNav= document.querySelector('.fixed-nav-m');
						if(oldNav !== null) {
							gotop = oldNav;
						} else {
							gotop = newNav;
						}
					} else if (matchURL.isNewBangumi()) {
						gotop = document.querySelector('.bangumi-nav-right');
					} else if (matchURL.isOldBangumi()) {
						gotop = document.querySelector('#index_nav');
					} else if (matchURL.isWatchlater()) {
						gotop = document.querySelector('.fixed-nav-m');
					}

					if (gotop !== null) {
						gotop.style.visibility = "hidden";
						var last_known_scroll_position = 0;
						var ticking = false;
						var mainInner;
						if (matchURL.isVideoAV()) {
							mainInner = document.querySelector('.player-wrapper + .main-inner');
						} else if (matchURL.isNewBangumi()) {
							mainInner = document.querySelector('.main-container .bangumi-info-wrapper');
						} else if (matchURL.isOldBangumi()) {
							mainInner = document.querySelector('.b-page-body + .main-inner');
						} else if (matchURL.isWatchlater()) {
							mainInner = document.querySelector('.view-later-module .video-ex-info');
						}
						if (typeof mainInner !== 'undefined' && mainInner !== null ) {
							mainInner = mainInner.offsetTop;
							window.addEventListener('scroll', function(e) {
								last_known_scroll_position = window.scrollY;
								if (!ticking) {
									window.requestAnimationFrame(function() {
										if (last_known_scroll_position >= mainInner) {
											gotop.style.visibility = "visible";
										} else {
											gotop.style.visibility = "hidden";
										}
										ticking = false;
									});
								}
								ticking = true;
							});
						}
					}
				} catch (e) {console.log('resizePlayer��'+e);}
			}
		},
		resizeMiniPlayer: function (set,width) {
			if (typeof set !== 'undefined' && typeof width !== 'undefined') {
				var ratio = 16 / 9;
				var height = Number(width / ratio).toFixed();
				var css = [
					'#bofqi.mini-player:before, #bofqi.float, #bofqi.float:before, #bofqi.float .move + .player, .player-wrapper .mini-player { width: '+ width +'px !important; height: '+ height +'px !important; }',
					'#bofqi.mini-player, #bofqi.newfloat .move, #bofqi.float .move { width: '+ width +'px !important; }',
					'#bofqi.mini-player:before, #bofqi.float:before, #bofqi.newfloat:before, .player-wrapper .mini-player:before {box-shadow: none !important;}',
					'#bofqi.mini-player > .player, #bofqi.newfloat, #bofqi.newfloat:before, #bofqi.newfloat .move + .player, .player-wrapper .mini-player > #bofqi .player { width: '+ width +'px !important; height: '+ height +'px !important; }'
				];
				var node = document.createElement('style');
				node.type = 'text/css';
				node.id = 'adjustMiniPlayerSize';
				node.appendChild(document.createTextNode(css.join('')));
				document.documentElement.appendChild(node);
			}
		},
		autoHideControlBar: function (set,focusDanmakuInput,video) {
			if (typeof set !== 'undefined') {
				try{
					if (isBangumi('#adjustPlayerAutoHideControlBar')) {return;}

					//α�޸� macOS �� Chrome ͸����ʧЧ https://greasyfork.org/zh-CN/forum/discussion/30243/x
					var fixSendbarOpacity = function(){
						var opacity = "1";
						if (navigator.userAgent.indexOf('Mac OS X') !== -1 && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
							opacity = "1";
						} else {
							opacity = "0.9";
						}
						return opacity;
					};

					//�����ˡ��Զ����ز��������������������ˡ���λ����Ļ��Ŀ�ݼ���֮������ƶ�����Ļ��ʱ����ʾ����Ļ�� https://greasyfork.org/zh-CN/forum/post/quote/30243/Comment_42612
					var isFocusDanmakuInput = function(){
						var css = '';
						if (focusDanmakuInput) {
							css = '#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar { visibility: hidden; }';
						}
						return css;
					};

					var css = [ //Modify the https://userstyles.org/styles/131642/bilibili-html5
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-wrap, #bilibiliPlayer.mode-widescreen .bilibili-player-video-wrap { height: 100% !important; width: 100% !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-control, #bilibiliPlayer.mode-widescreen .bilibili-player-video-control { display: block; opacity: 0 !important; transition: 0.2s; position: absolute; bottom: 0px; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-control:hover, #bilibiliPlayer.mode-widescreen .bilibili-player-video-control:hover { opacity: '+ fixSendbarOpacity() +' !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar { display: block; opacity: 0 !important; transition: 0.2s; position: absolute; top: 0px; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar:hover, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar:hover { opacity: '+ fixSendbarOpacity() +' !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar .bilibili-player-mode-selection-container, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar .bilibili-player-mode-selection-container { height: 120px; border-radius: 5px; top: 100%; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar .bilibili-player-color-picker-container, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar .bilibili-player-color-picker-container { height: 208px; border-radius: 5px; top: 100%; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-info-container, #bilibiliPlayer.mode-widescreen .bilibili-player-video-info-container { top: 40px; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-float-lastplay, #bilibiliPlayer.mode-widescreen .bilibili-player-video-float-lastplay { bottom: 30px; }',
						isFocusDanmakuInput()
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerAutoHideControlBar';
					node.appendChild(document.createTextNode(css.join('')));
					isBangumi('.player').appendChild(node);
					document.querySelector('#bofqi > .player').classList.add("autohide-controlbar");

					//�޸��������Ӱ��ҳ��ṹ��һ�µ��µġ��ױߡ�
					if (matchURL.isBangumiMovie()) {
						document.querySelector('.moviescontent').classList.add("autohide-controlbar-movies");
					}

					//���п��(��)����ʱ����������
					video.addEventListener("seeking", function() {
						var controlBar = isBangumi('#bilibiliPlayer[class*="mode-"] .bilibili-player-video-control');
						if (controlBar !== null ) {
							controlBar.style = "opacity: 1 !important;";
							var timer = null;
							clearTimeout(this.timer);
							this.timer = window.setTimeout(function() {
								controlBar.style = "opacity: 0;";
							}, 3000);
						}
					}, true);
				} catch (e) {console.log('adjustPlayerAutoHideControlBar��'+e);}
			}
		},
		skipSetTime : function (set,skipTime,video) {
			if (typeof set !== 'undefined' && video !== null) {
				var setTime = function () {
					var vLength = video.duration.toFixed();
					//console.log(skipTime);
					try {
						if (skipTime === 0) {
							video.currentTime = set;
						}
						else if (skipTime > vLength) {
							return;
						}
						else {
							video.currentTime += skipTime;
						}
					} catch (e) {
						console.log('skipSetTime��' + e);
					}
				};
				setTime();
			}
		},
		shortcuts : function (set) {
			var shortcut = {
				showHideDanmuku : function () {
					var controlBtn = isBangumi('.bilibili-player-video-control .bilibili-player-video-btn-danmaku ');
					var settingPanel = isBangumi('.bilibili-player-danmaku-setting-lite-panel');
					if (controlBtn !== null) {
						doClick(controlBtn);
						settingPanel.style.display = "none";

						var tipsValue = function() {
							if (controlBtn.getAttribute("name") === "ctlbar_danmuku_close") {
								return "�رյ�Ļ";
							} else {
								return "�򿪵�Ļ";
							}
						};

						shortcut.shortcutsTips("��Ļ",tipsValue());
					}
				},
				videoSpeed : function (type) {
					var video = isBangumi('.bilibili-player-video video');
					var videoSpeed ;
					var speed = [0.5,0.75,1,1.25,1.5,2.0];

					if (video !== null) {
						videoSpeed = video.playbackRate;

						if (type === "add") {
							var index = speed.indexOf(videoSpeed);
							if (index < speed.length -1) {
								index++;
								video.playbackRate = speed[index];
							}
							shortcut.shortcutsTips("�����ٶ�", speed[index] + "����");
						} else if (type === "sub") {
							var index = speed.indexOf(videoSpeed);
							if (index > 0) {
								index--;
								video.playbackRate = speed[index];
							}
							shortcut.shortcutsTips("�����ٶ�", speed[index] + "����");
						}
					}
				},
				playerWide : function () {
					var controlBtn = isBangumi('i[name="widescreen"]');
					var fullscreenBtn = isBangumi('div[name="browser_fullscreen"] > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") === "����ģʽ" && fullscreenBtn.getAttribute("data-text") === "����ȫ��") {
								return "�˳�����";
							} else if (controlBtn.getAttribute("data-text") === "����ģʽ" && fullscreenBtn.getAttribute("data-text") === "�˳�ȫ��") {
								return "ȫ��״̬���޷�ʹ��";
							} else {
								return "����ģʽ";
							}
						};

						shortcut.shortcutsTips("����ģʽ",tipsValue());
					}
				},
				fullscreen : function () {
					var controlBtn = isBangumi('div[name="browser_fullscreen"] > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") === "����ȫ��") {
								return "�˳�ȫ��";
							} else {
								return "����ȫ��";
							}
						};

						shortcut.shortcutsTips("ȫ��",tipsValue());
					}
				},
				webfullscreen : function () {
					var controlBtn = isBangumi('.bilibili-player-video-web-fullscreen > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") === "��ҳȫ��") {
								return "�˳�ȫ��";
							} else {
								return "ȫ��";
							}
						};

						shortcut.shortcutsTips("��ҳȫ��",tipsValue());
					}
				},
				gotoPlist : function (type) {
					var video = isBangumi('.bilibili-player-video video');
					if (video !== null) {
						var plist,nextPlist,prevPlist,curPage;
						if (matchURL.isVideoAV()) {
							plist = document.querySelector('#plist');
							curPage = document.querySelector('#plist .curPage ');
							if (curPage !== null ) {
								nextPlist = curPage.nextSibling;
								prevPlist = curPage.previousSibling;
							}

						} else if (matchURL.isOldBangumi()) {
							plist = document.querySelector('ul.slider-list');
							curPage = document.querySelector('.video-slider-list-wrapper ul.slider-list .cur');
							if (curPage !== null ) {
								nextPlist = curPage.nextSibling;
								prevPlist = curPage.previousSibling;
							}

						} else if (matchURL.isWatchlater()) {
							plist = document.querySelector('.bilibili-player .mCSB_container > ul');
							curPage = document.querySelector('.bilibili-player .mCSB_container > ul li[data-state-play=true]');
							if (curPage !== null ) {
								if (curPage.nextElementSibling !== null) {
									nextPlist = curPage.nextElementSibling.querySelector('div');
								}
								if (curPage.previousElementSibling !== null) {
									prevPlist = curPage.previousElementSibling.querySelector('div');
								}
							}
						} else if (matchURL.isNewBangumi()) {
							plist = document.querySelector('.bangumi-list-wrapper .bottom-block .episode-list');
							curPage = document.querySelector('.bangumi-list-wrapper .bottom-block .episode-list > .episode-item.on');
							if (curPage !== null ) {
								if (curPage.nextElementSibling !== null) {
									nextPlist = curPage.nextElementSibling;
								}
								if (curPage.previousElementSibling !== null) {
									prevPlist = curPage.previousElementSibling;
								}
							}
						}

						if (type === "prev") {
							if (typeof plist !== 'undefined' && typeof prevPlist !== 'undefined' && prevPlist !== null) {
								var heimu = document.querySelector('#heimu').getAttribute("style");
								if (heimu !== null && heimu.search("display: block;") !== -1) {
									shortcut.shortcutsTips("�ּ��л�","�ص�״̬���޷�ʹ��");
								} else {
									doClick(prevPlist);
								}
							} else {
								shortcut.shortcutsTips("�ּ��л�","û����һ����");
							}
						} else if (type === "next") {
							if (typeof plist !== 'undefined' && typeof nextPlist !== 'undefined' && nextPlist !== null) {
								var heimu = document.querySelector('#heimu').getAttribute("style");
								if (heimu !== null && heimu.search("display: block;") !== -1) {
									shortcut.shortcutsTips("�ּ��л�","�ص�״̬���޷�ʹ��");
								} else {
									doClick(nextPlist);
								}
							} else {
								shortcut.shortcutsTips("�ּ��л�","û����һ����");
							}
						}
					}
				},
				videoMute : function () {
					var controlBtn = isBangumi('div[name="vol"]');
					if (controlBtn !== null) {
						doClick(controlBtn.querySelector('i'));

						var tipsValue = function() {
							if (controlBtn.className.search("video-state-volume-min") !== -1) {
								return "����";
							} else {
								return "�ָ�����";
							}
						};

						shortcut.shortcutsTips("����",tipsValue());
					}
				},
				lightOnOff : function () {
					var isActiveContextMenu = isBangumi('.bilibili-player-context-menu-container.black');
					if (isActiveContextMenu.getAttribute("class").search("active") !== -1) {
						return;
					}

					if (isBangumi('#adjustMiniPlayerlightOnOff') === null ) {
						var css ='.bilibili-player-context-menu-container.black.active {opacity: 0; !important;}';
						var node = document.createElement('style');
						node.type = 'text/css';
						node.id = 'adjustPlayerlightOnOff';
						node.appendChild(document.createTextNode(css));
						isBangumi('.player').appendChild(node);
					}

					var contextMenu = isBangumi('.bilibili-player-area > .bilibili-player-video-wrap');
					contextMenuClick(contextMenu);

					clearTimeout(this.contextMenuTimer);
					this.contextMenuTimer = window.setTimeout(function() {
						var controlBtn = isBangumi('.bilibili-player-context-menu-container.black ul');
						if (controlBtn !== null) {
							var contextMenuItem = controlBtn.querySelectorAll('li > a'), i;
							var lightOnOffItem = null;
							for (i = 0; i < contextMenuItem.length; ++i) {
								if (contextMenuItem[i].innerHTML === "�ص�" || contextMenuItem[i].innerHTML === "����") {
									lightOnOffItem = contextMenuItem[i];
									doClick(contextMenuItem[i]);
									break;
								}
							}
							var adjustPlayerlightOnOff = isBangumi('#adjustPlayerlightOnOff');
							adjustPlayerlightOnOff.parentNode.removeChild(adjustPlayerlightOnOff);

							var tipsValue = function() {
								if (lightOnOffItem.innerHTML !== "����") {
									return "�ص�";
								} else {
									return "����";
								}
							};
							shortcut.shortcutsTips("��/�ص�",tipsValue());
						}
					}, 200);
				},
				loopVideoOnOff : function () {
					var controlBtn = isBangumi('.bilibili-player-video-btn-repeat > i');
					if (controlBtn !== null) {
						doClick(controlBtn);

						window.setTimeout(function() {
							var controllTooltip = isBangumi('div.player-tooltips');
							if(controllTooltip !== null){
								controllTooltip.style.display = "none";
							}
						}, 200);

						var tipsValue = function() {
							if (controlBtn.getAttribute("data-text") !== "��ϴ��ѭ��") {
								return "����";
							} else {
								return "�ر�";
							}
						};
						shortcut.shortcutsTips("ѭ������",tipsValue());
					}
				},
				focusPlayer : function () {
					var controlBtn = document.body.getAttribute("adjustPlayerScrollToY");
					if (controlBtn === null) {
						var scrollToY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
						document.body.setAttribute("adjustPlayerScrollToY",scrollToY);
						if (typeof GM_getValue === 'function') {
							var setting = config.read();
							var autoFocusOffsetType = setting.autoFocusOffsetType;
							var autoFocusOffsetValue= setting.autoFocusOffsetValue;
							var autoFocusPosition = setting.autoFocusPosition;
							adjustPlayer.autoFocus(true,autoFocusOffsetType,autoFocusOffsetValue,autoFocusPosition,true);
							shortcut.shortcutsTips("��λ","������������");
						} else {
							var setting = config.read();
							setting.then(function(value){
								var autoFocusOffsetType = value.autoFocusOffsetType;
								var autoFocusOffsetValue= value.autoFocusOffsetValue;
								var autoFocusPosition = value.autoFocusPosition;
								adjustPlayer.autoFocus(true,autoFocusOffsetType,autoFocusOffsetValue,autoFocusPosition,true);
								shortcut.shortcutsTips("��λ","������������");
							});
						}
					} else {
						var scrollToY = document.body.getAttribute("adjustPlayerScrollToY");
						unsafeWindow.scrollTo(0, scrollToY);

						shortcut.shortcutsTips("��λ","�ص�֮ǰλ��");
						document.body.removeAttribute("adjustPlayerScrollToY");
					}
				},
				focusDanmakuInput : function (e) {
					var controlBtn = isBangumi("input.bilibili-player-video-danmaku-input");
					if (controlBtn !== null) {
						var adjustPlayerAutoHideControlBar = isBangumi("#adjustPlayerAutoHideControlBar");
						if (adjustPlayerAutoHideControlBar !== null ) {
							var sendbar = isBangumi(".bilibili-player-video-sendbar");
							sendbar.style = "opacity: 1 !important; visibility: visible;!important;outline: none;";
							sendbar.setAttribute("tabindex","-1");

							var sendbarBlurEvent = function (e) {
								controlBtn.focus();
								sendbar.removeEventListener('blur', sendbarBlurEvent, false);
							};
							var danmakuInputKeydownEvent = function (e) {
								if (e.keyCode == 9) {
									isBangumi('.bilibili-player-video video').focus();
									isBangumi(".bilibili-player-video-sendbar").style = "opacity: 1;";
									e.preventDefault();
									controlBtn.removeEventListener('keydown', danmakuInputKeydownEvent, false);
								}
							};
							sendbar.addEventListener("blur",sendbarBlurEvent, false);
							controlBtn.addEventListener("keydown", danmakuInputKeydownEvent, false);
						}
						e.preventDefault();

						setTimeout(function() {
							controlBtn.focus();
						},200);

						shortcut.shortcutsTips("��λ","����Ļ�򽹵�");
					}
				},
				shortcutsTips : function (type,value) {
					try{
						var timeoutID ;
						clearTimeout(this.timeoutID);

						var tips = isBangumi('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap > #adjust-player-shortcuts-tips');
						if (tips === null ) {
							var tipsElement = document.createElement('div');
							tipsElement.id = "adjust-player-shortcuts-tips";
							tipsElement.style = "display: block; width:auto; opacity: 0;";
							tipsElement.className = "bilibili-player-volumeHint";
							tipsElement.innerHTML = type + ":" + value;
							isBangumi('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap ').appendChild(tipsElement);
							tipsElement.style = "display: block; width:auto; opacity: 1; margin-left:-"+(tipsElement.offsetWidth / 2)+"px";
						} else {
							tips.innerHTML = type + ":" + value;
							tips.style = "display: block; width:auto; opacity: 1; margin-left:-"+(tips.offsetWidth / 2)+"px";
						}

						this.timeoutID = window.setTimeout(function() {
							isBangumi('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap > #adjust-player-shortcuts-tips').style = "display: block;width:auto;opacity: 0;";
						}, 1000);
					} catch (e) {console.log('shortcutsTips��'+e);}
				},
				shortcutsEvent : function(type,kCode,event) {
					if (typeof kCode === 'undefined' || kCode === "" || kCode === null ) {
						return ;
					}

					var isCombinationKey = function() {
						var keys = kCode.split("+");
						if (keys.length > 1 ) {
							keys[1] = parseInt(keys[1]);
							return {CombinationKey: true,keys:keys};
						} else {
							return {CombinationKey: false,keys:parseInt(kCode)};
						}
					};

					var executeEvent = function() {
						switch (type) {
							case "showHideDanmuku":
								shortcut.showHideDanmuku();
								break;
							case "addVideoSpeed":
								shortcut.videoSpeed("add");
								break;
							case "subVideoSpeed":
								shortcut.videoSpeed("sub");
								break;
							case "playerWide":
								shortcut.playerWide();
								break;
							case "fullscreen":
								shortcut.fullscreen();
								break;
							case "webfullscreen":
								shortcut.webfullscreen();
								break;
							case "prevPlist":
								shortcut.gotoPlist("prev");
								break;
							case "nextPlist":
								shortcut.gotoPlist("next");
								break;
							case "videoMute":
								shortcut.videoMute();
								break;
							case "lightOnOff":
								shortcut.lightOnOff();
								break;
							case "loopVideoOnOff":
								shortcut.loopVideoOnOff();
								break;
							case "focusPlayer":
								shortcut.focusPlayer();
								break;
							case "focusDanmakuInput":
								shortcut.focusDanmakuInput(event);
								break;
							default:
								break;
						}
					};

					var k = isCombinationKey(kCode);
					if (k.CombinationKey) {
						if (event.altKey || event.altKey || event.shiftKey) {
							if (k.keys[0] === "shift") {
								if (event.shiftKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							} else if (k.keys[0] === "ctrl") {
								if (event.ctrlKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							} else if (k.keys[0] === "alt") {
								if (event.altKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							}
						}
					} else {
						if (event.altKey || event.altKey || event.shiftKey) {
							return;
						} else {
							if (event.keyCode === k.keys) {
								executeEvent(type);
								return;
							}
						}
					}
				},
				init : function (set) {
					if (typeof set !== 'undefined') {
						//console.log(set);
						try{
							if (set.shortcutsSwitch !== true) {
								return;
							}
							function bindEvent(event) {
								if (event.target.nodeName === "INPUT") {
									return;
								}
								if (set.showHideDanmuku === true) {
									shortcut.shortcutsEvent("showHideDanmuku",set.showHideDanmukuKeyCode,event);
								}
								if (set.addVideoSpeed === true) {
									shortcut.shortcutsEvent("addVideoSpeed",set.addVideoSpeedKeyCode,event);
								}
								if (set.addVideoSpeed === true) {
									shortcut.shortcutsEvent("subVideoSpeed",set.subVideoSpeedKeyCode,event);
								}
								if (set.playerWide === true) {
									shortcut.shortcutsEvent("playerWide",set.playerWideKeyCode,event);
								}
								if (set.fullscreen === true) {
									shortcut.shortcutsEvent("fullscreen",set.fullscreenKeyCode,event);
								}
								if (set.webfullscreen === true) {
									shortcut.shortcutsEvent("webfullscreen",set.webfullscreenKeyCode,event);
								}
								if (set.prevPlist === true) {
									shortcut.shortcutsEvent("prevPlist",set.prevPlistKeyCode,event);
								}
								if (set.nextPlist === true) {
									shortcut.shortcutsEvent("nextPlist",set.nextPlistKeyCode,event);
								}
								if (set.videoMute === true) {
									shortcut.shortcutsEvent("videoMute",set.videoMuteKeyCode,event);
								}
								if (set.lightOnOff === true) {
									shortcut.shortcutsEvent("lightOnOff",set.lightOnOffKeyCode,event);
								}
								if (set.loopVideoOnOff === true) {
									shortcut.shortcutsEvent("loopVideoOnOff",set.loopVideoOnOffKeyCode,event);
								}
								if (set.focusPlayer === true) {
									shortcut.shortcutsEvent("focusPlayer",set.focusPlayerKeyCode,event);
								}
								if (set.focusDanmakuInput === true) {
									shortcut.shortcutsEvent("focusDanmakuInput",set.focusDanmakuInputKeyCode,event);
								}
							}
							document.addEventListener("keydown",bindEvent , false);

							//fix bangumi
							var iframe = document.querySelector('iframe.bilibiliHtml5Player');
							if (iframe !== null) {
								iframe.contentWindow.document.addEventListener("keydown",function(event) {
									if (event.target.nodeName === "INPUT") {
										return;
									}
									var focused = document.activeElement;
									if (focused.nodeName === "IFRAME") {
										window.top.focus();
										bindEvent(event);
									}
								} , false);
							}
						} catch (e) {console.log('shortcuts��'+e);}
					}
				}
			};
			shortcut.init(set);
		},
		init: function(firstrun,setting) {
			//�޸���̨����Ƶҳ��ű�����ʧЧ
			var documentState = document.visibilityState;
			if(documentState === "visible") {
				//��ʼ��
				console.log('adjustPlayer:\n' + 'loadPage:' + location.href);
				//console.log('settingInfo:\n' + JSON.stringify(setting));
				//��ʾ������ʾ
				var isFirstrun = function() {
					if (firstrun) {
						config.setValue('player_firstrun', false);
						configWindow.help();
					}
				};
				//�ܼ�ʱ��
				var timerCount = 0;
				var timer = window.setInterval(function callback() {
					var player = isPlayer();
					if (player === "flashPlayer") {
						try {
							setTimeout(function () {
								createConfigBtn();
								isFirstrun();
								adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
								adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
								adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerHeight);
								if (setting.resizePlayer === true && typeof setting.resizeMiniPlayer === 'undefined') {
									adjustPlayer.resizeMiniPlayer(true,320);
								} else {
									adjustPlayer.resizeMiniPlayer(setting.resizeMiniPlayer,setting.resizeMiniPlayerSize);
								}
								reloadPList.init();
							}, 500);
							console.log('adjustPlayer:\nflashPlayer init success');
						} catch (e) {
							clearInterval(timer);
							console.log('adjustPlayer:\nflashPlayer init error\n' + e);
						} finally {
							clearInterval(timer);
						}
					} else if (player === "html5Player") {
						var readyState = isBangumi('.bilibili-player-video-panel').getAttribute('style');
						var video = isBangumi('.bilibili-player-video video');
						if (video !== null && readyState !== null ) {
							if (readyState.search("display: none;") !== -1) {
								try {
									createConfigBtn();
									isFirstrun();

									//���ϰ汾��ʼ����˫��ȫ����ʱ����Ĭ��ֵ
									if (setting.doubleClickFullScreen === true && typeof setting.doubleClickFullScreenDelayed === 'undefined') {
										adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,200);
									} else {
										adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,setting.doubleClickFullScreenDelayed);
									}

									//�����Զ�ȫ������ʾ�������Զ�ȫ���������ȿ���
									var autoFullScreen = function(){
										var tipsAutoFullScreen = config.getValue('player_tips_autoFullScreen', true);
										if (tipsAutoFullScreen) {
											configWindow.tipsAutoFullScreen();
										}
										adjustPlayer.autoFullScreen(setting.autoFullScreen,video);
									};
									if (setting.autoWebFullScreen === true && setting.autoFullScreen === true) {
										autoFullScreen();
									} else if (setting.autoWebFullScreen === true) {
										adjustPlayer.autoWebFullScreen(setting.autoWebFullScreen);
									} else if (setting.autoFullScreen === true) {
										autoFullScreen();
									} else {
										//��������ҳȫ�����������Զ�ȫ�����󣬲����صĹ���
										adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
										adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
										adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerHeight);
									}

									//��ʼ�������㲥�����ߴ硱��Ĭ��ֵ
									if (setting.resizePlayer === true && typeof setting.resizeMiniPlayer === 'undefined') {
										adjustPlayer.resizeMiniPlayer(true,320);
									} else {
										adjustPlayer.resizeMiniPlayer(setting.resizeMiniPlayer,setting.resizeMiniPlayerSize);
									}

									//������ѭ�����š��󣬲����ء��Զ�������һ����Ƶ��
									if (setting.autoNextPlist === true && setting.autoLoopVideo === true) {
										adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
									} else if (setting.autoNextPlist === true) {
										adjustPlayer.autoNextPlist(setting.autoNextPlist,video);
									} else {
										adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
									}

									adjustPlayer.danmukuPreventShade(setting.danmukuPreventShade,setting.danmukuPreventShadeType);

									//�޸�û�������Զ�����ģʽ���Զ��ص�ʧЧ
									window.setTimeout(function() {adjustPlayer.autoLightOn(setting.autoLightOn);}, 200);

									adjustPlayer.hideDanmuku(setting.danmuku,setting.danmukuType);
									adjustPlayer.autoHideControlBar(setting.autoHideControlBar,setting.shortcuts.focusDanmakuInput,video);
									adjustPlayer.autoPlay(setting.autoPlay,video);
									adjustPlayer.autoVideoSpeed(setting.autoVideoSpeed,video);
									adjustPlayer.skipSetTime(setting.skipSetTime,setting.skipSetTimeValue,video);
									adjustPlayer.shortcuts(setting.shortcuts);

									reloadPList.init();
									console.log('adjustPlayer:\nhtml5Player init success');
								}
								catch (e) {
									clearInterval(timer);
									console.log('adjustPlayer:\nhtml5Player init error\n' + e);
								}
								finally {
									clearInterval(timer);
								}
							}
						} else {
							//console.log(timerCount);
							timerCount++;
							if (timerCount >= 120) {
								timerCount = 0 ;
								clearInterval(timer);
								console.log('adjustPlayer:\n html5Player init error: not find video');
							}
						}
					} else {
						//console.log(timerCount);
						timerCount++;
						if (timerCount >= 120) {
							timerCount = 0 ;
							clearInterval(timer);
							console.log('adjustPlayer:\n html5Player init error: timeout');
						}
					}
				}, 800);
			} else if(documentState === "hidden"){
				//�޸���̨����Ƶҳ��ű�����ʧЧ
				var hidden, visibilityChange;
				if (typeof document.hidden !== "undefined") {
					hidden = "hidden";
					visibilityChange = "visibilitychange";
				} else if (typeof document.msHidden !== "undefined") {
					hidden = "msHidden";
					visibilityChange = "msvisibilitychange";
				} else if (typeof document.webkitHidden !== "undefined") {
					hidden = "webkitHidden";
					visibilityChange = "webkitvisibilitychange";
				}
				function visibilitychangeEvent() {
					if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
						console.log("adjustPlayer:\n nonsupport the Page Visibility API.");
					} else {
						if(document.visibilityState === "visible") {
							init();
							document.removeEventListener(visibilityChange,visibilitychangeEvent, false);
						}
					}
				}
				document.addEventListener(visibilityChange, visibilitychangeEvent, false);
			} else {
				console.log("adjustPlayer:\n nonsupport the Page Visibility API.");
			}
		},
		reload: function(setting) {
			//��Pҳ���ؼ���
			console.log('adjustPlayer:\n' + 'reloadPage:' + location.href);
			//�ܼ�ʱ��
			var timerCount = 0;
			var timer = window.setInterval(function callback() {
				var player = isPlayer();
				if (player === "flashPlayer") {
					try {
						setTimeout(function () {
							adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
							adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
							adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerHeight);
							reloadPList.init();
						}, 500);
						console.log('adjustPlayer:\nflashPlayer reload success');
					} catch (e) {
						clearInterval(timer);
						console.log('adjustPlayer:\nflashPlayer reload error\n' + e);
					} finally {
						clearInterval(timer);
					}
				} else if (player === "html5Player") {
					var readyState = isBangumi('.bilibili-player-video-panel').getAttribute('style');
					var video = isBangumi('.bilibili-player-video video');
					if (video !== null && readyState !== null ) {
						if (readyState.search("display: none;") !== -1) {
							try {
								//���ϰ汾��ʼ����˫��ȫ����ʱ����Ĭ��ֵ
								if (setting.doubleClickFullScreen === true && typeof setting.doubleClickFullScreenDelayed === 'undefined') {
									adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,200);
								} else {
									adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen,setting.doubleClickFullScreenDelayed);
								}
								//�����Զ�ȫ������ʾ�������Զ�ȫ���������ȿ���
								var autoFullScreen = function(){
									var tipsAutoFullScreen = config.getValue('player_tips_autoFullScreen', true);
									if (tipsAutoFullScreen) {
										configWindow.tipsAutoFullScreen();
									}
									adjustPlayer.autoFullScreen(setting.autoFullScreen,video);
								};
								if (setting.autoWebFullScreen === true && setting.autoFullScreen === true) {
									autoFullScreen();
								} else if (setting.autoWebFullScreen === true) {
									adjustPlayer.autoWebFullScreen(setting.autoWebFullScreen);
								} else if (setting.autoFullScreen === true) {
									autoFullScreen();
								} else {
									//��������ҳȫ�����������Զ�ȫ�����󣬲����صĹ���
									adjustPlayer.autoFocus(setting.autoFocus,setting.autoFocusOffsetType,setting.autoFocusOffsetValue,setting.autoFocusPosition);
									adjustPlayer.autoWide(setting.autoWide,setting.autoWideFullscreen);
									adjustPlayer.resizePlayer(setting.resizePlayer,setting.adjustPlayerWidth,setting.adjustPlayerHeight);
								}
								//������ѭ�����š��󣬲����ء��Զ�������һ����Ƶ��
								if (setting.autoNextPlist === true && setting.autoLoopVideo === true) {
									adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
								} else if (setting.autoNextPlist === true) {
									adjustPlayer.autoNextPlist(setting.autoNextPlist,video);
								} else {
									adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
								}
								adjustPlayer.danmukuPreventShade(setting.danmukuPreventShade,setting.danmukuPreventShadeType);
								//�޸�û�������Զ�����ģʽ���Զ��ص�ʧЧ
								window.setTimeout(function() {adjustPlayer.autoLightOn(setting.autoLightOn);}, 200);
								adjustPlayer.hideDanmuku(setting.danmuku,setting.danmukuType);
								adjustPlayer.autoHideControlBar(setting.autoHideControlBar,setting.shortcuts.focusDanmakuInput,video);
								window.setTimeout(function() {adjustPlayer.autoVideoSpeed(setting.autoVideoSpeed,video);}, 200);
								window.setTimeout(function() {adjustPlayer.skipSetTime(setting.skipSetTime,setting.skipSetTimeValue,video);}, 200);
								adjustPlayer.autoPlay(setting.autoPlay,video);
								reloadPList.init();
								console.log('adjustPlayer:\nhtml5Player reload success');
							}
							catch (e) {
								clearInterval(timer);
								console.log('adjustPlayer:\nhtml5Player reload error\n' + e);
							}
							finally {
								clearInterval(timer);
							}
						}
					} else {
						//console.log(timerCount);
						timerCount++;
						if (timerCount >= 120) {
							timerCount = 0 ;
							clearInterval(timer);
							console.log('adjustPlayer:\n html5Player reload error: not find video');
						}
					}
				} else {
					//console.log(timerCount);
					timerCount++;
					if (timerCount >= 120) {
						timerCount = 0 ;
						clearInterval(timer);
						console.log('adjustPlayer:\n html5Player reload error: timeout');
					}
				}
			}, 800);
		}
	};
	var reloadPList = {
		getPListId: function(href) {
			var id;
			if(typeof href !== 'undefined'){
				id = href.match(/ep\d*/g) || href.match(/p=\d*/g) || href.match(/#page=\d*/g) || href.match(/ss\d*#\d*/g);
				if (id !== null) {
					id = id[0].replace(/\D/g,'');
				} else {
					id = '';
				}
			}
			return id;
		},
		getCurrentPListId: function(id) {
			if(typeof id !== 'undefined') {
				var currentPListId = document.body.querySelector('#adjust-player-currentPListId');
				if(currentPListId === null){
					var node = document.createElement('div');
					node.id = 'adjust-player-currentPListId';
					node.setAttribute("style","display: none;");
					node.innerHTML = id;
					document.body.appendChild(node);
				} else{
					currentPListId.innerHTML = id;
				}
			} else {
				console.log("reloadPList: Can't get CurrentPListId");
			}
		},
		init: function(){
			var pListId = reloadPList.getPListId(location.href);
			reloadPList.getCurrentPListId(pListId);

			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
			var observer = new MutationObserver(function (records) {
				for (var i = 0; i < records.length; i++) {
					var targetNode = records[i].target;
					if (targetNode !== null) {
						var isReload = false;
						var reloadTimer = null;
						clearTimeout(this.reloadTimer);
						this.reloadTimer = window.setTimeout(function() {
							if(isReload === false){
								var newPlistId,oldPListId;
								newPlistId = reloadPList.getPListId(targetNode.baseURI);
								oldPListId = document.querySelector('#adjust-player-currentPListId').innerHTML;
								if(newPlistId !== oldPListId){
									console.log('reloadPList:\nnewPlistId:' + newPlistId + "\noldPListId:" +oldPListId);
									isReload = true;
									observer.disconnect();
									if (typeof GM_getValue === 'function') {
										var setting = config.read();
										adjustPlayer.reload(setting);
									} else {
										var setting = config.read();
										setting.then(function(value){
											adjustPlayer.reload(value);
										});
									}
								}
							} else {
								return;
							}
						}, 200);
					}
				}
			});
			observer.observe(document.querySelector('#bofqi'), {
				attributes: true,
				childList: true
			});
		}
	};
	var config = {
		storageType: function () {
			if(window.localStorage) {
				var type = localStorage.getItem('adjustPlayer_storageType');
				if(type === "localStorage") {
					return "localStorage";
				} else if(type === null || type === "extension" ) {
					return "extension";
				} else {
					return "unknown";
				}
			} else {
				console.log("adjustPlayer:��ȡ����ʧ�ܣ���֧��localStorage");
			}
		},
		getValue: function (value,defalutValue) {
			var storageType = config.storageType();
			if(storageType === "localStorage"){
				var item;
				if(typeof defalutValue !== "undefined" && item === null){
					item = localStorage.getItem('adjustPlayer_localStorage_' + value);
					localStorage.setItem('adjustPlayer_localStorage_' + value,defalutValue);
				} else {
					item = localStorage.getItem('adjustPlayer_localStorage_' + value);
				}
				item = JSON.parse(item);
				return item;
			} else if(storageType === "extension"){
				if (typeof GM_getValue === 'function') {
					var item;
					if(typeof defalutValue !== 'undefined'){
						item = GM_getValue(value,defalutValue);
					} else {
						item = GM_getValue(value);
					}
					return item;
				} else {
					if(typeof defalutValue !== 'undefined'){
						return GM.getValue(value,defalutValue);
					} else {
						return GM.getValue(value);
					}
				}
			} else {
				console.log("adjustPlayer:��ȡ"+ value +"ʧ�ܣ�δ֪�洢����");
				item = null;
				return item;
			}
		},
		setValue: function (name,value) {
			var storageType = config.storageType();
			if(storageType === "localStorage"){
				value = JSON.stringify(value);
				localStorage.setItem('adjustPlayer_localStorage_' + name,value);
			} else if(storageType === "extension"){
				if (typeof GM_getValue === 'function') {
					GM_setValue(name,value);
				} else {
					GM.setValue(name,value);
				}
			} else {
				console.log("adjustPlayer:����"+ value +"ʧ�ܣ�δ֪�洢����");
			}
		},
		read: function () {
			if (typeof GM_getValue === 'function') {
				var adjustPlayerSetting = config.getValue('player_adjustPlayer');
				if(typeof adjustPlayerSetting !== "undefined" && adjustPlayerSetting !== null){
					return adjustPlayerSetting;
				} else {
					var defaultConfig = config.restore();
					if (defaultConfig !== null) {
						return defaultConfig;
					} else {
						console.log("adjustPlayer:��ȡ����ʧ��");
					}
				}
			} else {
				return new Promise (function(resolve, reject) {
					var adjustPlayerSetting = config.getValue('player_adjustPlayer');
					adjustPlayerSetting.then(function(value) {
						if(typeof value !== "undefined" && value !== null){
							resolve(value);
						} else {
							var defaultConfig = config.restore();
							defaultConfig.then(function(value) {
								if (value !== null) {
									resolve(value);
								} else {
									console.log("adjustPlayer:��ȡ����ʧ��");
								}
							});
						}
					});
				});
			}
		},
		write: function (adjustPlayer) {
			config.setValue('player_adjustPlayer', adjustPlayer);
		},
		restore: function () {
			var defalutConfig = '{ "autoWide": true, "autoFocus": true, "shortcuts": {} }';
			config.setValue('player_adjustPlayer', JSON.parse(defalutConfig));
			config.setValue('player_firstrun', true);
			config.setValue('player_tips_autoFullScreen', true);
			if (typeof GM_getValue === 'function') {
				var item = config.getValue('player_adjustPlayer');
				return item;
			} else {
				return new Promise (function(resolve, reject) {
					var item = config.getValue('player_adjustPlayer');
					item.then(function(value) {
						resolve(value);
					});
				});
			}
		}
	};
	var dialog = {
		create: function (name, title, bar, content,isModal) {
			var isExist = document.querySelector('#adjust-player > #' + name);
			if (isExist === null) {
				var dialogElement = document.createElement('div');
				dialogElement.id = name;
				dialogElement.className = 'dialog';
				dialogElement.innerHTML = '<div class="title">' + title + '' + bar + '</div>' + content;
				if (isModal != null) {
					dialogElement.setAttribute("isModal", "true");
					dialogElement.setAttribute("modalParentId", isModal.getAttribute("id"));
					isModal.classList.add("modalWindow");
				}
				document.querySelector('#adjust-player').appendChild(dialogElement);
				dialog.eventBinding(dialogElement, name);
				//mask
				document.querySelector('#adjust-player .adjust-player-mask').setAttribute("style","display: block;");
			}
		},
		close: function (element) {
			if (element.getAttribute('isModal') === "true") {
				var modalParent = document.querySelector('#'+ element.getAttribute('modalParentId') +'');
				if (modalParent !== null) {
					modalParent.classList.remove("modalWindow");
				}
			}
			document.querySelector('#adjust-player').removeChild(element);
			//mask
			var adjustPlayer = document.querySelectorAll('#adjust-player > div.dialog').length;
			if (adjustPlayer < 1) {
				document.querySelector('#adjust-player .adjust-player-mask').removeAttribute("style");
			}
		},
		eventBinding: function (element, name) {
			element.addEventListener('click', function (e) {
				var action = e.target.getAttribute('action');
				if (e.target && action !== null) {
					if (name === "main") {
						switch (action) {
							case 'shortcuts':
								configWindow.shortcutsWindow(e);
								break;
							case 'adjustPlayerSize':
								configWindow.adjustPlayerSize();
								break;
							case 'restoreDef':
								configWindow.restore();
								break;
							case 'save':
								configWindow.save();
								break;
							case 'childElementDisabledEvent':
								configWindow.childElementDisabledEvent(e.target.getAttribute("name"),e.target.getAttribute("disabledchildelement"));
								break;
							case 'storageType':
								configWindow.storageTypeWindow(e);
								break;
							default:
								break;
						}
					} else if (name === "tipsAutoFullScreen") {
						switch (action) {
							case 'notTips':
								configWindow.tipsAutoFullScreenEvent(name);
								break;
							default:
								break;
						}
					} else if (name === "shortcutsSetting") {
						switch (action) {
							case 'clear':
								configWindow.shortcutsSettingClear();
								break;
							case 'save':
								configWindow.shortcutsSettingSave();
								break;
							case 'cancel':
								configWindow.shortcutsSettingCancel();
								break;
							default:
								break;
						}
					} else if (name === "storageType") {
						switch (action) {
							case 'save':
								configWindow.storageTypeSave();
								break;
							case 'cancel':
								dialog.close(this);
								break;
							default:
								break;
						}
					}
					switch (action) {
						case 'help':
							configWindow.help();
							break;
						case 'close':
							dialog.close(this);
							break;
						default:
							break;
					}
				}
			});
		}
	};
	var configWindow = {
		create: function () {
			var name = 'main';
			var title = '����������bilibili.com������������';
			var bar = '<span class="btn" action="help">?</span><span class="btn" action="close">X</span>';
			var content = commentToString(function () { /*
         <form>
            <div class="wrapper">
            	<div class="left">
            		<fieldset class="shortcutsGroup">
            			<legend><label>��ݼ�</label></legend>
            			<div class="block">
            				<label class="h5">
            					<input name="shortcutsSwitch" type="checkbox" list="shortcuts" action="childElementDisabledEvent" disabledChildElement="div,shortcutsItem" >���ÿ�ݼ�����<span title="ʹ�ð�����&#10;1����ݼ����ܿ��أ������󡰿�ݼ����ܡ��Ż���Ч" class="tipsButton">[?]</span>
            				</label>
            				<div class="shortcutsItem">
            					<label class="h5">
            						<input name="showHideDanmuku" type="checkbox" list="shortcuts">��ʾ/���ص�Ļ <span class="tipsButton" action="shortcuts" typeName="showHideDanmuku">[����]</span>
            						<input type="text" name="showHideDanmukuKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="showHideDanmukuKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="playerWide" type="checkbox" list="shortcuts">����ģʽ <span class="tipsButton" action="shortcuts" typeName="playerWide">[����]</span>
            						<input type="text" name="playerWideKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="playerWideKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="fullscreen" type="checkbox" list="shortcuts">ȫ��ģʽ <span class="tipsButton" action="shortcuts" typeName="fullscreen">[����]</span>
            						<input type="text" name="fullscreenKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="fullscreenKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="webfullscreen" type="checkbox" list="shortcuts">��ҳȫ��ģʽ <span class="tipsButton" action="shortcuts" typeName="webfullscreen">[����]</span>
            						<input type="text" name="webfullscreenKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="webfullscreenKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="videoMute" type="checkbox" list="shortcuts">����/�ָ�����  <span class="tipsButton" action="shortcuts" typeName="videoMute">[����]</span>
            						<input type="text" name="videoMuteKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="videoMuteKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="lightOnOff" type="checkbox" list="shortcuts">�������ص�/����  <span class="tipsButton" action="shortcuts" typeName="lightOnOff">[����]</span>
            						<input type="text" name="lightOnOffKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="lightOnOffKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="loopVideoOnOff" type="checkbox" list="shortcuts">ѭ������  <span class="tipsButton" action="shortcuts" typeName="loopVideoOnOff">[����]</span>
            						<input type="text" name="loopVideoOnOffKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="loopVideoOnOffKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="focusPlayer" type="checkbox" list="shortcuts">��λ��������<span title="ʹ�ð�����&#10;1������λ�ø��ݡ����ܵ����� - ���Զ���λ��XXX���ˡ� ���õ�ֵ����λ&#10��û���á����ܵ����� - ���Զ���λ��XXX���ˡ����ܵĻ���Ĭ�϶�λ�����������ˣ�&#10;2�����º���ڡ�������λ�á����͡�֮ǰ�����λ�á������л�" class="tipsButton">[?]</span>
									<span class="tipsButton" action="shortcuts" typeName="focusPlayer">[����]</span>
            						<input type="text" name="focusPlayerKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="focusPlayerKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="focusDanmakuInput" type="checkbox" list="shortcuts">��λ����Ļ��<span title="ʹ�ð�����&#10;1�������ڵ�Ļ��ʱ���̰� Tab �����ص�Ļ��&#10;2�������ˡ��Զ����ز��������������������ˡ���λ����Ļ��Ŀ�ݼ���֮�����ÿ�ݼ�����ʾ��Ļ��" class="tipsButton">[?]</span>
									<span class="tipsButton" action="shortcuts" typeName="focusDanmakuInput">[����]</span>
            						<input type="text" name="focusDanmakuInputKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="focusDanmakuInputKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="addVideoSpeed" type="checkbox" list="shortcuts">���Ӳ����ٶ� <span class="tipsButton" action="shortcuts" typeName="addVideoSpeed">[����]</span>
            						<input type="text" name="addVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="addVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="subVideoSpeed" type="checkbox" list="shortcuts">���ٲ����ٶ� <span class="tipsButton" action="shortcuts" typeName="subVideoSpeed">[����]</span>
            						<input type="text" name="subVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="subVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label class="h5">
            						<input name="prevPlist" type="checkbox" list="shortcuts">��һ����Ƶ  <span class="tipsButton" action="shortcuts" typeName="prevPlist">[����]</span>
            						<input type="text" name="prevPlistKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="prevPlistKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label class="h5">
            						<input name="nextPlist" type="checkbox" list="shortcuts">��һ����Ƶ <span class="tipsButton" action="shortcuts" typeName="nextPlist">[����]</span>
            						<input type="text" name="nextPlistKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="nextPlistKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            				</div>
            			</div>
            		</fieldset>
            		<fieldset class="otherGroup">
            			<legend><label>����</label></legend>
            			<div class="block">
            				<label class="h5">
            					<input name="danmuku" type="checkbox">Ĭ������
            					<select name="danmukuType">
            						<option value="all" selected="selected">����</option>
            						<option value="bangumi">����</option>
            					</select>��Ļ<span title="ʹ�ð�����&#10;1��ѡ��Ĭ�����ء����硱��Ļʱ��ֻ���� bangumi.bilibili.com ������www.bilibili.com/bangumi/play/ep ����Ƶ�ĵ�Ļ" class="tipsButton">[?]</span>
            				</label>
							<label class="h5">
								<input name="danmukuPreventShade" type="checkbox">Ĭ��
								<select name="danmukuPreventShadeType">
            						<option value="on" selected="selected">����</option>
            						<option value="off">�ر�</option>
            					</select>������Ļ<span title="ʹ�ð�����&#10;1�������硱ҳ�����ͨҳ��ġ�������Ļ��Ĭ�����þ�Ȼ��һ������������������һ�� " class="tipsButton">[?]</span>
							</label>
            				<label class="h5"><input name="autoLightOn" type="checkbox">�Զ��������ص�<span title="ʹ�ð�����&#10;1������Ƶ�����ڵ���Ҽ����п����صƲ���" class="tipsButton">[?]</span></label>
            		</div>
            	</fieldset>
            </div>
            <div class="right">
            	<fieldset class="modeGroup">
            		<legend><label>����ģʽ</label></legend>
            		<div class="block">
						<label><input name="autoWide" type="checkbox">�Զ�����</label>
						<label class="h5" style="margin-left: 24px;">�˳�ȫ����
							<select name="autoWideFullscreen">
            					<option value="off" selected="selected">�ر�</option>
            					<option value="on">����</option>
            				</select>�Զ�����
							<span title="ʹ�ð�����&#10;1���������Զ����������ܺ��˳�ȫ�����Ƿ�������" class="tipsButton">[?]</span>
						</label>
            			<label class="h5"><input name="autoWebFullScreen" type="checkbox">�Զ���ҳȫ��<span title="ʹ�ð�����&#10;1����Esc���˳���ҳȫ��&#10;3�������˹��ܺ󣬵�����С���Զ���������λ���ܲ�������" class="tipsButton">[?]</span></label>
            			<label class="h5"><input name="doubleClickFullScreen" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,doubleClickFullScreenDelayed" >˫��ȫ��<span title="ʹ�ð�����&#10;1��˫����Ƶ����ȫ��" class="tipsButton">[?]</span></label>
						<label class="h5" style="margin-left: 24px;">����/��ͣ��ʱ<input name="doubleClickFullScreenDelayed" type="number" min="0" max="500" placeholder="200" value="200" style="width: 45px;">����<span title="ʹ�ð�����&#10;1��������˫��ȫ�������ܺ�����Ƶ���򡰲���/��ͣ����������ʱ��ʹȫ�����ܸ�����&#10;2��������������ʱ�����µ����Ƶ���򡰲���/��ͣ�����ܲ��Ǽ�ʱ�ģ���ʱ�����ü��̿ո����ͣ&#10;3������������Ϊ0���ر���ʱ" class="tipsButton">[?]</span></label>
            			<label class="h5"><input name="autoFullScreen" type="checkbox">���Զ�ȫ��<span title="ʹ�ð�����&#10;1����Ϊ������������޷�ʹ�ýű�ģ���Զ�ȫ������Ҫ�ֶ����� F11 ��ȫ����&#10;3���˳�ȫ����Ҫ�ֶ��� F11 �����ٴΰ� Esc ���˳���ҳȫ����&#10;4��������䡰�Զ�������һ����Ƶ������ʹ�á�&#10;" class="tipsButton">[?]</span></label>
					</div>
            	</fieldset>
            	<fieldset class="playbackGroup">
            		<legend><label>������Ƶ</label></legend>
            		<div class="block">
            			<label class="h5"><input name="autoPlay" type="checkbox">�Զ�������Ƶ</label>
            			<label class="h5"><input name="autoNextPlist" type="checkbox">�Զ�������һ����Ƶ<span title="ʹ�ð�����&#10;1����ѡ�����ú����ӡ�Bվ��HTML5�������Դ��ġ��Զ���P���ܡ�&#10;2���Զ��������а��񡱡������������" class="tipsButton">[?]</span></label>
            			<label class="h5"><input name="autoLoopVideo" type="checkbox">�Զ�ѭ�����ŵ�ǰ��Ƶ<span title="ʹ�ð�����&#10;1�������˹��ܺ��Զ�������һ����Ƶ���������� &#10;" class="tipsButton">[?]</span></label>
						<label class="h5"><input name="skipSetTime" type="checkbox" action="childElementDisabledEvent" disabledChildElement="inputs,skipSetTimeValueMinutes;skipSetTimeValueSeconds" >�Զ���ָ��ʱ�俪ʼ����</label>
            			<label style="margin-left: 24px;">
            				<input name="skipSetTimeValueMinutes" type="number" min="0" max="60" placeholder="0" value="0" style="width: 45px;" disabled="">����
            				<input name="skipSetTimeValueSeconds" type="number" min="0" max="60" placeholder="0" value="0" style="width: 45px;" disabled="">��
            				<input type="hidden" name="skipSetTimeValue">
            			</label>
            			<label class="h5">ѡ��Ĭ�ϲ����ٶ�
            				<select name="autoVideoSpeed">
            					<option value="0.5">0.5����</option>
            					<option value="0.75">0.75����</option>
            					<option value="1" selected="selected">����</option>
            					<option value="1.25">1.25����</option>
            					<option value="1.5">1.5����</option>
            					<option value="2">2����</option>
            				</select>
            			</label>
            		</div>
            	</fieldset>
            	<fieldset class="functionGroup">
            			<legend><label>���ܵ���</label></legend>
            			<div class="block">
            				<label><input name="autoFocus" type="checkbox">�Զ���λ��
            					<select name="autoFocusPosition">
            						<option value="player" selected="selected">������</option>
            						<option value="video">��Ƶ</option>
            					</select>
            					����<span title="ʹ�ð�����&#10;1�����������λ�ã���������ƫ��λ�ã����ϻ������ƣ�����������λ�ã�����Ƶ����λ�ã��ǲ��գ���" class="tipsButton">[?]</span>
            				</label>
            				<label style="margin-left: 24px;">��λƫ��
            					<select name="autoFocusOffsetType">
            						<option value="defalut" selected="selected">Ĭ��</option>
            						<option value="sub">����</option>
            						<option value="add">����</option>
            					</select>
            					<input name="autoFocusOffsetValue" type="number" min="0" value="0" placeholder="0" style="width: 45px;" disabled="">����
            				</span>
            			</label>
            			<label class="h5"><input name="autoHideControlBar" type="checkbox">�Զ����ز�����������<span title="ʹ�ð�����&#10;1����Ҫ����������ģʽ������ҳȫ��ģʽ���Ż���Ч&#10;3������ƶ���������������ʾ��Ļ�����ƶ����ײ���ʾ������&#10;4��������ֻ�����֡��ڱߡ��뿪�����ֶ�ָ����������С������&#10; ��ʹ�� [������С] ���ܵ�����С&#10;5���˹����޸��ԣ�https://userstyles.org/styles/131642/bilibili-html5" class="tipsButton">[?]</span></label>
            			<label>
            				<input name="resizePlayer" type="checkbox">�ֶ�ָ����������С
            				<span class="tipsButton" action="adjustPlayerSize" title="ʹ�ð�����&#10;1�����[������С]���е���">[������С]</span>
            				<input type="hidden" name="adjustPlayerWidth">
            				<input type="hidden" name="adjustPlayerHeight">
            			</label>
            			<label>
            				<input name="resizeMiniPlayer" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,resizeMiniPlayerSize" >���㲥�������
            				<input name="resizeMiniPlayerSize" type="number" min="0" value="320" placeholder="320" style="width: 45px;" disabled="">����
            				<span title="ʹ�ð�����&#10;1���������۴����㲥������С��������ʵĿ�Ⱥ��Զ������´�С&#10;   �� �´�С����Ϊ 16��9��" class="tipsButton">[?]</span>
            			</label>
            		</div>
            	</fieldset>
            </div>
        </div>
        <div class="info">
          	<span class="ver"></span>
			<span class="storageType">
          		<a href="javascript:void(0);" action="storageType" title="�ű������޷�����ģ�������">�洢����</a>
           	</span>
			<span class="feedback">
          		<a href="https://greasyfork.org/zh-CN/scripts/21284-%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9-bilibili-com-%E6%92%AD%E6%94%BE%E5%99%A8%E8%B0%83%E6%95%B4/feedback">����</a>
           	</span>
        </div>
        <div class="btns">
           	<div class="btn" action="restoreDef">�ָ�Ĭ������</div>
           	<div class="btn" action="save">����</div>
           	<div class="btn btn-cancel" action="close">�ر�</div>
        </div>
        </form>
            */ });
			dialog.create(name, title, bar, content);
		},
		load: function (formData) {
			//loadData
			var form = document.querySelector('#adjust-player #main form');
			deserialize(form, formData);
			//init bindEvent
			configWindow.mainWindowResizeEvent();
			configWindow.autoFocusEvent();
			configWindow.childElementDisabledEvent("resizeMiniPlayer","input,resizeMiniPlayerSize");
			configWindow.childElementDisabledEvent("doubleClickFullScreen","input,doubleClickFullScreenDelayed");
			configWindow.childElementDisabledEvent("skipSetTime","inputs,skipSetTimeValueMinutes;skipSetTimeValueSeconds");
			configWindow.childElementDisabledEvent("shortcutsSwitch","div,shortcutsItem");
			//version
			try{
				var version = document.querySelector('#adjust-player form span.ver').innerHTML = "�汾:" + GM_info.script.version;
			} catch (e) {
				var version = document.querySelector('#adjust-player form span.ver').innerHTML = "�汾:�޷���ȡ";
			}
			//html5Player tips
			var player = isPlayer();
			if (player === "html5Player") {
				if (document.querySelector('#adjustPlayerMainIsHTML5') === null ) {
					var css ='#adjust-player .h5 { color:#222 !important;}';
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerMainIsHTML5';
					node.appendChild(document.createTextNode(css));
					document.documentElement.appendChild(node);
				}
			}
		},
		save: function () {
			try {
				var form = document.querySelector('#adjust-player #main form');
				var formData = serialize(form);
				//autoFocus
				if (formData.autoFocusOffsetType !== 'defalut' && formData.autoFocus === true) {
					var autoFocusOffsetValue = parseInt(formData.autoFocusOffsetValue.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(autoFocusOffsetValue)) {
						formData.autoFocusOffsetValue = autoFocusOffsetValue;
					} else {
						formData.autoFocusOffsetValue = 0;
					}
				} else {
					delete formData.autoFocusOffsetType;
					delete formData.autoFocusOffsetValue;
				}
				//skipSetTime
				if (formData.skipSetTime === true) {
					var skipSetTimeValueMinutes = parseInt(formData.skipSetTimeValueMinutes.match(/^\+?[0-9]*$/g) [0]);
					var skipSetTimeValueSeconds = parseInt(formData.skipSetTimeValueSeconds.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(skipSetTimeValueMinutes)) {
						formData.skipSetTimeValueMinutes = skipSetTimeValueMinutes;
						formData.skipSetTimeValue = skipSetTimeValueMinutes * 60;
					} else {
						delete formData.skipSetTimeValueMinutes;
					}
					if (!isNaN(skipSetTimeValueSeconds)) {
						formData.skipSetTimeValueSeconds = skipSetTimeValueSeconds;
						formData.skipSetTimeValue += skipSetTimeValueSeconds;
					} else{
						delete formData.skipSetTimeValueSeconds;
					}
				} else {
					delete formData.skipSetTimeValue;
					delete formData.skipSetTimeValueMinutes;
					delete formData.skipSetTimeValueSeconds;
				}
				//autoVideoSpeed
				if (formData.autoVideoSpeed === '1') {
					delete formData.autoVideoSpeed;
				}
				//resizePlayer
				if (formData.resizePlayer !== true ) {
					delete formData.adjustPlayerHeight;
					delete formData.adjustPlayerWidth;
				}
				//resizeMiniPlayer
				if (formData.resizeMiniPlayer === true ) {
					var resizeMiniPlayerSize = parseInt(formData.resizeMiniPlayerSize.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(resizeMiniPlayerSize)) {
						formData.resizeMiniPlayerSize = resizeMiniPlayerSize;
					} else {
						formData.autoFocusOffsetValue = 320;
					}
				} else {
					delete formData.resizeMiniPlayerSize;
				}
				//doubleClickFullScreenDelayed
				if (formData.doubleClickFullScreen === true ) {
					var doubleClickFullScreenDelayed = parseInt(formData.doubleClickFullScreenDelayed.match(/^\+?[0-9]*$/g) [0]);
					if (!isNaN(doubleClickFullScreenDelayed)) {
						formData.doubleClickFullScreenDelayed = doubleClickFullScreenDelayed;
					} else {
						formData.doubleClickFullScreenDelayed = 200;
					}
				} else {
					delete formData.doubleClickFullScreenDelayed;
				}
				//console.log(formData);
				config.write(formData);
				//alert
				unsafeWindow.alert('�������óɹ�');
				location.reload();
			} catch (e) {
				unsafeWindow.alert('��������ʧ��');
				location.reload();
				console.log("adjustPlayer:\nsave error\n " + e);
			}
		},
		restore: function () {
			var defaultConfig = config.restore();
			if (typeof defaultConfig !== 'undefined') {
				unsafeWindow.alert('�ָ����óɹ�');
			} else {
				unsafeWindow.alert('�ָ�����ʧ��');
			}
			location.reload();
		},
		mainWindowResizeEvent: function () {
			var wrapper = document.querySelector('#adjust-player #main form .wrapper');
			var mainWindow = document.querySelector('#adjust-player #main');
			var mainWindowHeight = mainWindow.offsetHeight;
			mainWindow.style = 'margin-top:-' + (mainWindowHeight / 2).toFixed(0) + 'px;';
			var windowHeight = window.outerHeight;
			if (windowHeight < (mainWindowHeight + 280)) {
				wrapper.style = "max-height:" + (windowHeight - 280) + 'px; padding-right:10px;';
				mainWindow.style = 'margin-top:-' + (mainWindow.offsetHeight /2) + 'px;';
			}
		},
		autoFocusEvent: function () {
			var autoFocusOffsetType = document.querySelector('#adjust-player form select[name="autoFocusOffsetType"]');
			var autoFocusOffsetValue = document.querySelector('#adjust-player form input[name="autoFocusOffsetValue"]');
			autoFocusOffsetType.onchange = function (e) {
				var autoFocusEvent = e.target.value ==="defalut" ? autoFocusOffsetValue.setAttribute('disabled', '') : autoFocusOffsetValue.removeAttribute('disabled');
			};
			var autoFocusEvent = autoFocusOffsetType.value ==="defalut" ? autoFocusOffsetValue.setAttribute('disabled', '') : autoFocusOffsetValue.removeAttribute('disabled');
		},
		childElementDisabledEvent: function (parent,childAndType) {
			var childAndType = childAndType.split(",");
			var type = childAndType[0];
			var child = childAndType[1];
			var disabledEvent;

			if (type === "input") {
				var parentElement = document.querySelector('#adjust-player form input[name="'+parent+'"]');
				var childElement = document.querySelector('#adjust-player form input[name="'+child+'"]');
				disabledEvent = parentElement.checked ? childElement.removeAttribute('disabled') : childElement.setAttribute('disabled', '');
			} else if (type === "inputs") {
				var parentElement = document.querySelector('#adjust-player form input[name="'+parent+'"]');
				var childElements = child.split(";");
				var setDisabled = function (disabled) {
					for (var i = 0; i < childElements.length; ++i) {
						if (disabled) {
							document.querySelector('#adjust-player form input[name="'+childElements[i]+'"]').setAttribute('disabled', '');
						} else {
							document.querySelector('#adjust-player form input[name="'+childElements[i]+'"]').removeAttribute('disabled');
						}
					}
				};
				disabledEvent = parentElement.checked ? setDisabled(false) : setDisabled(true);
			} else if (type === "div") {
				var parentElement = document.querySelector('#adjust-player form input[name="'+parent+'"]');
				var childElement = document.querySelector('#adjust-player form div.'+child+'');
				disabledEvent = parentElement.checked ? childElement.classList.remove("disabled") : childElement.classList.add("disabled");
			}
		},
		adjustPlayerSize: function () {
			//init
			if (matchURL.isWatchlater() || matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
				if (window.confirm('������С���ܲ�֧����\n���Ժ�ۿ�ҳ�桿��������ҳ�桿 ��ʹ�á�\n��ȷ������ת������ҳ�棬���ڲ���ҳ�������µ���\nȡ����������' )) {
					window.top.location = "http://www.bilibili.com/video/av120040/";
					return;
				} else {
					return;
				}
			}

			var adjustPlayerSizeCSS = document.querySelector('#adjustPlayerSize');
			if (adjustPlayerSizeCSS !== null) {
				document.documentElement.removeChild(document.querySelector('#adjustPlayerSize'));
			}
			document.querySelector('#adjust-player').setAttribute("style","visibility: hidden;");

			//tips
			var tips = document.createElement('div');
			tips.innerHTML =  commentToString(function () { /*
            <div class="info">
               <p>��ǰ��ȣ�<span class="width">853</span> px</p>
               <p>��ǰ�߶ȣ�<span class="height">480</span> px</p>
            </div>
            <div class="tips">
              <p>�ɵ��������б������ƣ�Ϊ16:9����Ϊ�˲��������򲻱��Σ�</p>
              <p>�ɵ�������߶�Ĭ������ 68px �����������ؼ��߶ȣ�</p>
            </div>
            <div class="tips" style="right: 16px;bottom: 60px;">
              <p style="color: red; font-size: 80px;">�K?</p>
            </div>
            <div class="content">
               <p class="bold">ʹ�ð���</p>
               <p>1.�϶����½ǡ���򡱵�����������С��<span style="color: red;">�K?</span> ������</p>
               <p>2.���������ʵĴ�С��������棨��ǰ��ɫ����Ĵ�С���������ǲ��������´�С����</p>
               <div class="btns">
                  <div class="btn b-btn" action="720P" style="width: 248px;">���ٱ���Ϊ720P</div>
                  <div class="btn b-btn" action="save">����</div>
                  <div class="btn b-btn-cancel" action="cancel">ȡ��</div>
               </div>
            </div>
            */});
			tips.id = "adjust-player-tips";
			tips.style = "width: 853px; height:480px";
			tips.onclick = function (e) {
				var adjustPlayerWidth = document.querySelector('#adjust-player form input[name="adjustPlayerWidth"]');
				var adjustPlayerHeight = document.querySelector('#adjust-player form input[name="adjustPlayerHeight"]');
				var resizePlayer = document.querySelector('#adjust-player form input[name="resizePlayer"]');

				var action = e.target.getAttribute('action');
				if (e.target && action !== null) {
					if (action === "save") {
						try {
							adjustPlayerWidth.value = this.style.width;
							adjustPlayerHeight.value = this.style.height;
							resizePlayer.checked = true;
							configWindow.save();
						} catch (ex) {
							unsafeWindow.alert('��������ʧ��');
							location.reload();
							console.log("adjustPlayer:\n adjustPlayerSize save error\n " + ex);
						}
					} else if (action === "cancel") {
						location.reload();
					} else if (action === "720P") {
						adjustPlayerWidth.value = "1280px";
						adjustPlayerHeight.value = "720px";
						resizePlayer.checked = true;
						configWindow.save();
					}
				}
			};

			//resize
			var playerContent = document.querySelector('#bofqi');
			var oldPlayerWrapper = document.querySelector('.player-wrapper .player');
			var newPlayerWrapper = document.querySelector('.bili-wrapper .player');
			if (oldPlayerWrapper !== null) {
				oldPlayerWrapper.setAttribute("style","visibility: hidden;");
			} else {
				newPlayerWrapper.setAttribute("style","visibility: hidden;");
				document.querySelector('#__bofqi').setAttribute("style","width: auto !important; background: none !important; height: auto !important; position: relative !important;");
			}
			playerContent.style = "position: relative;overflow: hidden;resize: both;box-shadow: #00a1d6 0 0 5px; width:853px; height: 480px; min-height: 480px;";
			playerContent.insertBefore(tips, playerContent.firstChild);

			//resize event
			var ratio = 16 / 9;
			var adjustPlayerTips = document.querySelector('#adjust-player-tips');
			var adjustPlayerTipsW = document.querySelector('#adjust-player-tips .info .width');
			var adjustPlayerTipsH = document.querySelector('#adjust-player-tips .info .height');

			var resizeEvent = function callback() {
				window.setTimeout(callback, 20);
				var width = playerContent.clientWidth;
				var height = playerContent.clientHeight;
				var newHeight = Number(width / ratio).toFixed();

				adjustPlayerTips.setAttribute("style","width: "+ width + "px; height:"+ newHeight +"px");
				adjustPlayerTipsW.innerHTML = width;
				adjustPlayerTipsH.innerHTML = newHeight;
			};

			window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

			var resizeEventID ;
			resizeEventID = window.requestAnimationFrame(resizeEvent);

			//window.cancelAnimationFrame(resizeEventID);
		},
		shortcutsWindow: function (e) {
			//create
			var name = 'shortcutsSetting';
			var title = '��ݼ�����';
			var bar = '<span class="btn" action="cancel">X</span>';
			var content = commentToString(function () { /*
			<p style="margin-bottom: 4px;font-size: 16px;">����������ڰ�����Ҫ�İ������ÿ�ݼ���<span id="tips" style="text-align: left; color: #ff81aa; margin-top: 33px; right: 22px; position: absolute;"></span></p>
			<p>
			  <input type="text" name="keyName" placeholder="֧�ֵ�����ϼ�ctrl��alt��shift" style="width: 556px;font-size: 16px;text-align: center;padding:4px 0;border: 1px solid #ccd0d7;border-radius: 4px;" >
			  <input type="hidden" name="keyCode" >
			  <input type="hidden" name="typeName" >
			</p>
			<p style="color: #99a2aa; border: 1px solid #e5e9ef;background-color: #f4f5f7; border-radius: 10px; margin: 10px 0; padding: 20px;">
			  <span style="padding: 0 10px;font-weight: bold;">* �벻Ҫ����Ӣ�ĵİ������ơ�<br/></span>
			  <span style="padding: 0 10px;font-weight: bold;">* ��ر����뷨�����á�<br/></span>
			  <span style="padding: 0 10px;font-weight: bold;">* Ĭ�ϵĿ�ݼ�����֪�ģ��У�</span><br/><span style="margin-left: 27px; display: inline-block;">�ո� ������/��ͣ��<br/>������ϡ��� ������+/����-��<br/>��������� ������/����� <br/>��ñܿ���Щ�������������Ĭ�ϵĿ�ݼ����ű�û����ֹĬ����Ϊ��</span>
			</p>
			<div class="btns" style="text-align: center;">
               <div class="btn" action="clear">����˿�ݼ�</div>
               <div class="btn" action="save">����</div>
               <div class="btn btn-cancel" action="cancel">ȡ��</div>
			</div>
			*/ });
			var isModal = e.target.offsetParent;
			dialog.create(name, title, bar, content,isModal);

			//onkeydown
			var tips = document.querySelector('#shortcutsSetting #tips');
			var kName = document.querySelector('#shortcutsSetting input[name="keyName"]');
			var kCode = document.querySelector('#shortcutsSetting input[name="keyCode"]');
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			typeName.value = e.target.getAttribute('typeName');

			function keydownEvent(event) {
				if (!event.metaKey) {
					event.preventDefault();
				}
				tips.innerHTML = "";
				var keyCode = getkeyCode(event.keyCode);
				if (typeof keyCode !== 'undefined') {
					if (event.altKey && event.shiftKey || event.ctrlKey && event.shiftKey ||  event.ctrlKey && event.altKey) {
						return;
					}
					if (event.shiftKey && event.keyCode !== 16) {
						kName.value = "shift + " + keyCode;
						kCode.value = "shift" + '+' +event.keyCode;
					} else if (event.ctrlKey && event.keyCode !== 17) {
						kName.value = "ctrl + " + keyCode;
						kCode.value = "ctrl" + '+' +event.keyCode;
					} else if (event.altKey && event.keyCode !== 18) {
						kName.value = "alt + " + keyCode;
						kCode.value = "alt" + '+' +event.keyCode;
					} else {
						kName.value = keyCode;
						kCode.value = event.keyCode;
					}
				} else {
					tips.innerHTML = "�����޷���ʶ��";
				}
			}
			kName.addEventListener("keydown",keydownEvent, false);

			//inputFocus
			function focusEvent(event) {
				document.removeEventListener("keydown",focusEvent, false);
				kName.focus();
				keydownEvent(event);
			}
			document.addEventListener("keydown",focusEvent, false);
			//console.log(e);
		},
		shortcutsSettingClear: function () {
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			var keyName = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyName"]');
			var keyCode = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');
			var type = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'"]');
			keyName.value = "";
			keyCode.value = "";
			type.checked = false;
			dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
		},
		shortcutsSettingSave: function () {
			try {
				var tips = document.querySelector('#shortcutsSetting #tips');
				var kName = document.querySelector('#shortcutsSetting input[name="keyName"]');
				var kCode = document.querySelector('#shortcutsSetting input[name="keyCode"]');
				var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
				var typeNameValue = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');

				if (kName.value !== "" && kCode.value !== "" && typeName.value !=="") {
					var keyCodes = document.querySelectorAll('#adjust-player #main form .shortcutsGroup input[KeyCode="true"]'), i;
					var isUsedkeyCode = false;
					for (i = 0; i < keyCodes.length; ++i) {
						if (kCode.value === keyCodes[i].value && kCode.value !== typeNameValue.value) {
							isUsedkeyCode = true;
							break;
						}
					}

					if (isUsedkeyCode) {
						tips.innerHTML = "������ͻ����ʹ�ù��Ŀ�ݼ�";
						kName.focus();
					} else if (kCode.value === "16" || kCode.value === "17" || kCode.value === "18") {
						tips.innerHTML = "��������Ϊ������ ctrl��alt��shift";
						kName.focus();
					} else {
						var shortcutsKeyName = document.querySelector('#adjust-player .shortcutsGroup input[name="'+typeName.value+'KeyName"]');
						var shortcutsKeyCode = document.querySelector('#adjust-player .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');
						var shortcutsTypeName = document.querySelector('#adjust-player .shortcutsGroup input[name="'+typeName.value+'"]');

						shortcutsKeyName.value = kName.value;
						shortcutsKeyCode.value = kCode.value;
						shortcutsTypeName.checked = true;

						dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
					}

				} else {
					tips.innerHTML = "��������Ϊ��";
					kName.focus();
				}
			} catch (ex) {
				unsafeWindow.alert('����ʧ��');
				console.log("shortcutsSettingSave\n " + ex);
			}
		},
		shortcutsSettingCancel: function () {
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			var keyCode = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'KeyCode"]');
			var type = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="'+typeName.value+'"]');
			if (keyCode.value !== "") {
				type.checked = true;
			} else {
				type.checked = false;
			}

			dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
		},
		storageTypeWindow: function (e) {
			var name = 'storageType';
			var title = '���Ľű����ݴ洢����';
			var bar = '<span class="btn" action="close">X</span>';
			var content = commentToString(function () { /*
			<p style="margin-bottom: 4px;font-size: 16px;">��ѡ��ű����ݴ洢���ͣ�<span id="tips" style="text-align: left; color: #ff81aa; margin-top: 33px; right: 22px; position: absolute;"></span></p>
			<p style="margin: 10px;font-size: 16px; text-align:center;">
			   <input type="radio" id="extension" name="storageType" value="extension" checked>
			      <label for="extension">extension���ͺ���չ�洢��</label>
			   <input type="radio" id="localStorage" name="storageType" value="localStorage">
			      <label for="localStorage">localStorage��������洢��</label>
			</p>
			<ol style="color: #99a2aa; border: 1px solid #e5e9ef;background-color: #f4f5f7; border-radius: 10px; margin: 10px 0; padding: 20px 20px 20px 40px;">
			   <li style="list-style: decimal;"><span style="font-weight: bold;color:red;">���û�г��֡��޷�����ű����ݡ��������������������ã�</span></li>
			   <li style="list-style: decimal;"><span style="font-weight: bold;">���֡��޷�����ű����ݡ����������ѡ��洢���͡� ����Ϊ ��localStorage��������洢����</span></li>
			   <li style="list-style: decimal;"><span style="font-weight: bold;">�������Ϊ ��localStorage��������洢���� www.bilibili.com �� bangumi.bilibili.com �����ò���ͬ������Ҫ�ֶ��������á�</span></li>
			   <li style="list-style: decimal;">ʹ�� Greasemonkey��Tampermonkey ��չ����װ�ű����û���һ���벻Ҫ�޸ģ��뱣��Ĭ�ϵġ�extension���ͺ���չ�洢���� ��</li>
			   <li style="list-style: decimal;">�������Ϊ ��localStorage��������洢���� ��ôɾ���ű���ʱ�򣬽ű����ò��ᱻ�����������Ļ���ʹ��������ġ����������ݡ������������</li>
			   <li style="list-style: decimal;">���ִ洢���Ͳ����Զ�ͬ�����ã������洢���ͺ����������á�</li>
			</ol>
			<div class="btns" style="text-align: center;">
               <div class="btn" action="save">����</div>
               <div class="btn btn-cancel" action="cancel">ȡ��</div>
			</div>
			*/ });
			var isModal = e.target.parentNode.parentNode.offsetParent;
			dialog.create(name, title, bar, content,isModal);

			var setStorageTypeValue = localStorage.getItem('adjustPlayer_storageType');
			if(setStorageTypeValue !== null){
				var storageType = document.querySelectorAll('#storageType input[name="storageType"]'), i;
				for (i = 0; i < storageType.length; ++i) {
					if(storageType[i].value === setStorageTypeValue){
						storageType[i].checked = true;
						break;
					}
				}
			}
		},
		storageTypeSave: function () {
			var setStorageTypeValue = null;
			var storageType = document.querySelectorAll('#storageType input[name="storageType"]'), i;
			for (i = 0; i < storageType.length; ++i) {
				if(storageType[i].checked === true){
					setStorageTypeValue = storageType[i].value;
					break;
				}
			}
			if(setStorageTypeValue !== null){
				localStorage.setItem('adjustPlayer_storageType',setStorageTypeValue);
				var getStorageType = localStorage.getItem('adjustPlayer_storageType');
				if(getStorageType === setStorageTypeValue){
					alert("�������óɹ�");
					location.reload();
				} else {
					alert("��������ʧ��");
					location.reload();
				}
			}
		},
		help: function () {
			var name = 'help';
			var title = '����������bilibili.com������������';
			var bar = '<span class="btn" action="close">X</span>';
			var content = commentToString(function () { /*
			<h2 style="font-weight: bold;font-size: 16px;">С��ʾ��</h2>
			<ol style="padding: 0 0 0 20px;margin:10px 0;">
			   <li style="list-style: disc;"><span style="font-weight: bold;">���鿪����HTML5 ����������</span></li>
			   <li style="list-style: disc;">�������������ô����ڲ������Ҳࡣ</li>
			   <li style="list-style: disc;">�������������ô����У�����ƶ���<span style="font-size: 12px; color: #00a1d6; cursor: pointer;margin:0 10px;"title="�鿴����">[?]</span>�ϣ��鿴�˹��ܵ�ʹ�ð�����</li>
			   <li style="list-style: disc;">�������������ô����У���ɫ���ʾ��ǰ���ܲ����ã���Ҫ������HTML5������������ʹ�á�</li>
			</ol>
			<h2 style="font-weight: bold;font-size: 16px;">������HTML5�����������裺</h2>
			<ol style="padding: 0 0 0 20px;margin:10px 0;">
			   <li style="list-style: decimal;">��<a href="http://www.bilibili.com/html/help.html#p" rel="nofollow">http://www.bilibili.com/html/help.html#p</a></li>
			   <li style="list-style: decimal;">ѡ��������õ��ҡ�������HTML5����������</li>
			</ol>
			<div class="btns" style="text-align: center;"><div class="btn" action="close">�ر�</div></div>
			*/ });
			dialog.create(name, title, bar, content);
		},
		tipsAutoFullScreen: function () {
			var name = 'tipsAutoFullScreen';
			var title = '���Զ�ȫ��������ʾ';
			var bar = '';
			var content = commentToString(function () { /*
			<p>1. ��Ϊ������������޷�ʹ�ýű�ģ���Զ�ȫ������Ҫ�ֶ����� F11 ��ȫ����</p>
			<p>2. �˳�ȫ����Ҫ�ֶ��� F11 �����ٴΰ� Esc ���˳���ҳȫ����</p>
			<p>3. ������䡰�Զ�������һ����Ƶ������ʹ�á�</p>
			<div class="btns" style="text-align: center;">
			   <div class="btn" action="notTips">������ʾ</div>
			</div>
			*/ });
			dialog.create(name, title, bar, content);
		},
		tipsAutoFullScreenEvent: function (name) {
			config.setValue('player_tips_autoFullScreen', false);
			dialog.close(document.querySelector('#adjust-player > #' + name));
		},
		init: function () {
			configWindow.create();
			if (typeof GM_getValue === 'function') {
				var formData = config.read();
				configWindow.load(formData);
			} else {
				var formData = config.read();
				formData.then(function(value){
					configWindow.load(value);
				});
			}
		}
	};
	function addStyle() {
		try{
			var css = commentToString(function () { /*
          .adjust-player-mask { display: none; position: fixed; top: 0; left: 0; z-index: 100001; width: 100%; height: 100%; background: #000; opacity: .6; filter: alpha(opacity=60) }
          #adjust-player .title { font-size: 16px; color: #222; text-align: center; font-weight: bold; margin-bottom: 20px }
          #adjust-player .dialog { position: fixed; z-index: 100002; top: 50%; margin-top: -280px; left: 50%; width: 580px; margin-left: -320px; padding: 20px; background-color: rgb(255, 255, 255); border-radius: 6px; box-shadow: 1px 1px 40px 0px rgba(0, 0, 0, 0.6); display: block; font-size: 14px; line-height: 26px }
          #adjust-player .title span { font-size: 12px; color: #fff; background-color: #00a1d6; display: inline-block; width: 22px; height: 22px; position: absolute; right: 25px; border-radius: 50%; line-height: 22px; transition: .1s; transition-property: background-color; margin-top: 2px }
          #adjust-player .title span:hover { background-color: #00b5e5; cursor: pointer }
          #adjust-player .title [action="help"] { right: 52px }
          #adjust-player fieldset { border: 1px solid #e5e9ef; border-radius: 4px; padding: 0 6px 6px; background-color: #f4f5f7; margin-bottom: 10px }
          #adjust-player legend { font-weight: bold; font-size: 14px; margin-left: 10px; border: 1px solid #e5e9ef; background-color: #fff; padding: 0 10px; border-radius: 4px }
          #adjust-player legend label span { color: #6d757a; font-size: 12px }
          #adjust-player input, #adjust-player select { margin: 0px 2px }
          #adjust-player input[type="number"] { padding: 1px 0 }
          #adjust-player input[readOnly="true"] { color: #99a2aa; width: 80px; max-width: 80px; border: 0px; background: #f4f5f7 }
          #adjust-player select { height: 23px }
          #adjust-player .block { padding: 5px 0 }
          #adjust-player .block .bold { font-weight: bold }
          #adjust-player .block label { display: block; margin-left: 7px }
          #adjust-player .tipsButton { font-size: 12px; color: #00a1d6; cursor: pointer; padding: 0 2px }
          #adjust-player .left { float: left }
          #adjust-player .right { float: right }
          #adjust-player .left, #adjust-player .right { width: 48%; vertical-align: top }
          #adjust-player .shortcutsItem { max-width: 200px }
          #adjust-player .info { position: absolute; bottom: 20px; border: 1px solid #e5e9ef; border-radius: 20px; padding: 0 10px }
          #adjust-player .info .ver { font-weight: bold; padding-right: 5px; color: #6d757a }
          #adjust-player a { outline: 0; color: #00a1d6; text-decoration: none; cursor: pointer }
          #adjust-player .btns { text-align: right; width: 100%; display: inline-block }
          #adjust-player .btn { margin: 10px 0px 0px 10px; width: 100px; height: 28px; line-height: 28px; font-size: 14px; display: inline-block; color: #fff; cursor: pointer; text-align: center; border-radius: 4px; background-color: #00a1d6; vertical-align: middle; border: 1px solid #00a1d6; transition: .1s; transition-property: background-color, border, color; user-select: none }
          #adjust-player .btn:hover { color: #fff; background: #00b5e5; border-color: #00b5e5 }
          #adjust-player .btn-cancel { display: inline-block; text-align: center; cursor: pointer; color: #222; border: 1px solid #ccd0d7; background-color: #fff; border-radius: 4px; transition: .1s; transition-property: background-color, border, color }
          #adjust-player .btn-cancel:hover { color: #00a1d6; border-color: #00a1d6; background: #fff }
          #adjust-player .h5 { color: #ccc }
          #adjust-player form .wrapper { overflow-x: hidden; white-space: nowrap }
          #adjust-player .modalWindow { z-index: 100000 }
          #adjust-player .shortcutsItem.disabled > label { color: #ccc !important }
          #adjust-player-tips { width: 100%; height: 100%; background: rgba(204, 204, 204, 0.4); line-height: 16px; color: #333 }
          #adjust-player-tips p { text-align: left }
          #adjust-player-tips .content { margin: 0 auto; margin-top: 30px; width: 250px; font-size: 16px; line-height: 24px; padding: 40px; background: #fff; border: 1px solid #eee; border-radius: 4px }
          #adjust-player-tips .content .bold { font-weight: bold; font-size: 18px; text-align: center; color: #333; padding-bottom: 20px }
          #adjust-player-tips .content .btn { display: inline-block; margin-top: 10px; padding: 4px 0; width: 120px; color: #fff; cursor: pointer; text-align: center; border-radius: 4px; background-color: #00a1d6; vertical-align: middle; border: 1px solid #00a1d6; transition: .1s; transition-property: background-color, border, color; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none }
          #adjust-player-tips .content .btn:hover { background-color: #00b5e5; border-color: #00b5e5 }
          #adjust-player-tips .content .btn.b-btn-cancel { text-align: center; cursor: pointer; color: #222; border: 1px solid #ccd0d7; background-color: #fff; border-radius: 4px; transition: .1s; transition-property: background-color, border, color }
          #adjust-player-tips .content .btn.b-btn-cancel:hover { color: #00a1d6; border-color: #00a1d6 }
          #adjust-player-tips .content .btns { margin-top: 10px }
          #adjust-player-tips .info { position: relative; top: 10px; margin-left: 10px; font-weight: bold }
          #adjust-player-tips .info span { color: #333; font-size: 12px; color: #fb7299 }
          #adjust-player-tips .tips { position: absolute; bottom: 10px; margin-left: 10px; color: #99a2aa }
          .bgray-btn { height: auto !important; margin: 10px 0px 0px 10px !important }
          .video-box-module .bili-wrapper .bgray-btn-wrap, .player-wrapper .bangumi-player .bgray-btn-wrap { top: -10px !important }
          .video-toolbar-module { width: 1160px !important; margin: 0 auto; margin-top: 20px }
          #app .player-box { padding: 20px 0 }
          #bofqi.heimu { box-shadow: none !important }
          @media screen and (max-width:1400px) {
               .video-toolbar-module { width: 980px !important }
          }
        */});
			var node = document.createElement('style');
			node.type = 'text/css';
			node.id = 'adjustPlayerMainCss';
			node.appendChild(document.createTextNode(css));
			document.body.appendChild(node);
			//�������ô�������
			var adjustPlayer = document.createElement('div');
			adjustPlayer.id = 'adjust-player';
			document.body.appendChild(adjustPlayer);
			//���ֲ�
			var adjustPlayerMask = document.createElement('div');
			adjustPlayerMask.className = 'adjust-player-mask';
			document.querySelector('#adjust-player').appendChild(adjustPlayerMask);
			//�޸��·���ҳ�棬���ý��治��ʾinput�ؼ�
			if (matchURL.isNewBangumi()) {
				if (document.querySelector('#adjustPlayerFixNewBangumi') === null ) {
					var css = [
						'#adjust-player input[type="checkbox"] { -webkit-appearance: checkbox !important; -moz-appearance: checkbox !important; appearance: checkbox !important; }',
						'#adjust-player input[type="number"] { -webkit-appearance: textfield !important; -moz-appearance: menulist !important; appearance: textfield !important; }',
						'#adjust-player input[type="radio"] { -webkit-appearance: radio !important; -moz-appearance: radio !important; appearance: radio !important; }',
						'#adjust-player select { -webkit-appearance: menulist !important; -moz-appearance: menulist !important; appearance: menulist !important; }',
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerFixNewBangumi';
					node.appendChild(document.createTextNode(css.join('')));
					document.documentElement.appendChild(node);
				}
			}
		} catch (e) {
			console.log('addStyle��'+e);
		}
	}
	function createConfigBtn() {
		var isExist = document.querySelector('#adjust-player');
		if (isExist === null) {
			//������ô�����ʽ����������
			addStyle();
			//�������ð�ť
			var configButton = document.createElement('div');
			configButton.id = 'adjust-player-config-btn';
			configButton.className = 'bgray-btn show';
			configButton.setAttribute("style","display: block;");
			configButton.innerHTML = '����������';
			configButton.onclick = function () {
				configWindow.init();
			};
			var bgrayBtnWrap = document.querySelector('div.bgray-btn-wrap');
			bgrayBtnWrap.setAttribute("style","display: block;");
			bgrayBtnWrap.appendChild(configButton);
		}
	}
	var matchURL = {
		isVideoAV : function () {
			if (location.href.match(/video\/av\d*/g) !== null) { return true; } else { return false; }
		},
		isOldBangumi : function () {
			if (location.hostname === 'bangumi.bilibili.com') { return true; } else { return false; }
		},
		isWatchlater : function () {
			if (location.href.match(/watchlater\/#\/av\d*\/p\d*/g) !== null) { return true; } else { return false; }
		},
		isBangumiMovie : function() {
			if (location.href.match(/bangumi.bilibili.com\/movie\/\d*/g) !== null) { return true; } else { return false; }
		},
		isNewBangumi : function() {
			if (location.href.match(/bangumi\/play\/(ep|ss)\d*/g) !== null ) { return true; } else { return false; }
		}
	};
	function isBangumi(obj) {
		var iframePlayer = document.querySelector('iframe.bilibiliHtml5Player');
		if (matchURL.isOldBangumi() || matchURL.isNewBangumi() ) {
			if (iframePlayer !== null ) {
				return iframePlayer.contentWindow.document.body.querySelector(obj);
			} else {
				return document.querySelector(obj);
			}
		} else {
			return document.querySelector(obj);
		}
	}
	function isPlayer() {
		var flashPlayer = isBangumi('#bofqi object');
		var html5Player = isBangumi('.bilibili-player-video video');
		if (flashPlayer !== null) {
			return "flashPlayer";
		} else if (html5Player !== null) {
			return "html5Player";
		} else {
			return "unknownPlayer";
		}
	}
	function doClick(obj) {
		if (obj !== null) {
			if (obj.click) {
				obj.click();
			} else {
				var evt = document.createEvent('Event');
				evt.initEvent('click', true, true);
				obj.dispatchEvent(evt);
			}
		}
	}
	function contextMenuClick(element) {
		var ev;
		if (document.createEvent) {
			ev = new MouseEvent("contextmenu", {
				screenX: 0,
				screenY: 0,
				clientX: element.offsetLeft,
				clientY: element.offsetTop + element.offsetHeight,
				button: 2
			});
			element.dispatchEvent(ev);
		} else {
			ev = document.createEventObject();
			ev.screenX = 0;
			ev.screenY = 0;
			ev.clientX = element.offsetLeft;
			ev.clientY = element.offsetTop + element.offsetHeight;
			ev.button = 2;
			document.fireEvent('contextmenu', ev);
		}
	};
	function commentToString(f) {
		var s = f.toString().replace(/^[\s\S]*\/\*.*/, '').replace(/.*\*\/[\s\S]*$/, '').replace(/\r\n|\r|\n/g, '\n');
		return s;
	}
	function serialize(e){if(e&&"FORM"===e.nodeName){var t,s,n,l={},a=[];var list={};for(t=e.elements.length-1;t>=0;t-=1){if(""!==e.elements[t].name){var listName=e.elements[t].getAttribute("list");switch(e.elements[t].nodeName){case"INPUT":switch(e.elements[t].type){case"hidden":case"text":case"password":case"number":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){list[e.elements[t].name]=e.elements[t].value}break}l[e.elements[t].name]=e.elements[t].value;break;case"checkbox":case"radio":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){e.elements[t].checked&&(n="on"===e.elements[t].value?n=!0:field.value,list[e.elements[t].name]=n);l[listName]=list}break}e.elements[t].checked&&(n="on"===e.elements[t].value?n=!0:field.value,l[e.elements[t].name]=n)}break;case"TEXTAREA":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){list[e.elements[t].name]=e.elements[t].value}break}l[e.elements[t].name]=e.elements[t].value;break;case"SELECT":switch(e.elements[t].type){case"select-one":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){list[e.elements[t].name]=e.elements[t].value}break}l[e.elements[t].name]=e.elements[t].value;break;case"select-multiple":if(listName!==null){if(typeof e.elements[t].name!=="undefined"&&e.elements[t].value!==""){for(s=e.elements[t].options.length-1;s>=0;s-=1){e.elements[t].options[s].selected&&a.push(e.elements[t].options[s].value)}list[e.elements[t].name]=a.join()}break}for(s=e.elements[t].options.length-1;s>=0;s-=1){e.elements[t].options[s].selected&&a.push(e.elements[t].options[s].value)}l[e.elements[t].name]=a.join()}}}}return JSON.parse(JSON.stringify(l))}};
	function deserialize(e,t){if(e&&"FORM"===e.nodeName){var s,n,l,a,c,m=[];var isList;for(l in t){for(s=e.elements.length-1;s>=0;s-=1){if(e.elements[s].name===l||e.elements[s].getAttribute("list")===l){if(""===e.elements[s].name){continue}if(l===e.elements[s].getAttribute("list")){var list=t[l][e.elements[s].name];if(typeof list!=="undefined"){isList=t[l][e.elements[s].name]}else{isList=""}}else{isList=t[l]}switch(e.elements[s].nodeName){case"INPUT":switch(e.elements[s].type){case"hidden":case"text":case"password":case"number":e.elements[s].setAttribute("value",isList);break;case"checkbox":case"radio":!0===isList&&e.elements[s].setAttribute("checked","true")}break;case"TEXTAREA":e.elements[s].setAttribute("value",isList);break;case"SELECT":switch(e.elements[s].type){case"select-one":for(n=e.elements[s].options.length-1;n>=0;n-=1){c=e.elements[s].options[n],c.value===isList.toString()&&c.setAttribute("selected","true")}break;case"select-multiple":for(m=t[l].split(","),a=m.length-1;a>=0;a-=1){for(n=e.elements[s].options.length-1;n>=0;n-=1){c=e.elements[s].options[n],c.value===isList[m[a]].toString()&&c.setAttribute("selected","true")}}}}}}}}};
	function getkeyCode(k){var keyCodes={3:"break",8:"backspace / delete",9:"tab",12:"clear",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause/break",20:"caps lock",27:"escape",28:"conversion",29:"non-conversion",32:"spacebar",33:"page up",34:"page down",35:"end",36:"home ",37:"left arrow ",38:"up arrow ",39:"right arrow",40:"down arrow ",41:"select",42:"print",43:"execute",44:"Print Screen",45:"insert ",46:"delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",58:":",59:"semicolon (firefox), equals",60:"<",61:"equals (firefox)",63:"?",64:"@ (firefox)",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",91:"Windows Key / Left ? / Chromebook Search key",92:"right window key ",93:"Windows Menu / Right ?",96:"numpad 0 ",97:"numpad 1 ",98:"numpad 2 ",99:"numpad 3 ",100:"numpad 4 ",101:"numpad 5 ",102:"numpad 6 ",103:"numpad 7 ",104:"numpad 8 ",105:"numpad 9 ",106:"multiply ",107:"add",108:"numpad period (firefox)",109:"subtract ",110:"decimal point",111:"divide ",112:"f1 ",113:"f2 ",114:"f3 ",115:"f4 ",116:"f5 ",117:"f6 ",118:"f7 ",119:"f8 ",120:"f9 ",121:"f10",122:"f11",123:"f12",124:"f13",125:"f14",126:"f15",127:"f16",128:"f17",129:"f18",130:"f19",131:"f20",132:"f21",133:"f22",134:"f23",135:"f24",144:"num lock ",145:"scroll lock",160:"^",161:"!",163:"#",164:"$",165:"��",166:"page backward",167:"page forward",169:"closing paren (AZERTY)",170:"*",171:"~ + * key",173:"minus (firefox), mute/unmute",174:"decrease volume level",175:"increase volume level",176:"next",177:"previous",178:"stop",179:"play/pause",180:"e-mail",181:"mute/unmute (firefox)",182:"decrease volume level (firefox)",183:"increase volume level (firefox)",186:"semi-colon / ?",187:"equal sign ",188:"comma",189:"dash ",190:"period ",191:"forward slash / ?",192:"grave accent / ? / ?",193:"?, / or ��",194:"numpad period (chrome)",219:"open bracket ",220:"back slash ",221:"close bracket / ?",222:"single quote / ?",223:"`",224:"left or right ? key (firefox)",225:"altgr",226:"< /git >",230:"GNOME Compose Key",231:"?",233:"XF86Forward",234:"XF86Back",240:"alphanumeric",242:"hiragana/katakana",243:"half-width/full-width",244:"kanji",255:"toggle touchpad"};return keyCodes[k]}; // keycodes https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js
	function init(){
		if (typeof GM_getValue === 'function') {
			var firstrun = config.getValue('player_firstrun',true);
			var setting = config.read();
			adjustPlayer.init(firstrun,setting);
		} else {
			var firstrun = config.getValue('player_firstrun',true);
			var setting = config.read();
			Promise.all([firstrun, setting]).then(function(values){
				adjustPlayer.init(values[0],values[1]);
			});
		}
	}
	init();
}) ();