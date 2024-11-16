(function(){
    var script = {
 "gap": 10,
 "start": "this.init()",
 "paddingBottom": 0,
 "children": [
  "this.MainViewer"
 ],
 "id": "rootPlayer",
 "scrollBarVisible": "rollOver",
 "vrPolyfillScale": 0.5,
 "scrollBarMargin": 2,
 "desktopMipmappingEnabled": false,
 "backgroundPreloadEnabled": true,
 "borderSize": 0,
 "horizontalAlign": "left",
 "mobileMipmappingEnabled": false,
 "class": "Player",
 "layout": "absolute",
 "defaultVRPointer": "laser",
 "scripts": {
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "existsKey": function(key){  return key in window; },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "getKey": function(key){  return window[key]; },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "registerKey": function(key, value){  window[key] = value; },
  "unregisterKey": function(key){  delete window[key]; },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); }
 },
 "scrollBarWidth": 10,
 "width": "100%",
 "minHeight": 20,
 "contentOpaque": false,
 "borderRadius": 0,
 "downloadEnabled": false,
 "propagateClick": false,
 "verticalAlign": "top",
 "minWidth": 20,
 "height": "100%",
 "paddingRight": 0,
 "mouseWheelEnabled": true,
 "paddingTop": 0,
 "paddingLeft": 0,
 "definitions": [{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 11.42,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_046D2D17_31A7_8C06_41BC_40C70D71DEE4"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -176.46,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_09B7E361_31A7_943B_41C2_29FD9FD75C89"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -31.87,
  "pitch": -2.35
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -133.36,
  "pitch": 4.4
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "7b Lot-3 Rai Bridge ",
 "id": "panorama_3CECC6BD_306B_8761_41C6_6907CE84A298",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 70.18,
   "panorama": "this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A",
   "distance": 1,
   "backwardYaw": -31.96
  },
  {
   "panorama": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26FE1813_30EB_8B20_41C1_E9D482FD837F",
  "this.overlay_26AC5092_30E7_9B20_41C7_ADFE93A809D6",
  "this.overlay_26AC4093_30E7_9B21_41C0_9A465B52C5C1"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 24.17,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_092FF2EE_31A7_9406_41BE_3CDE2B54AB2A"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -45.89,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_091E12C2_31A7_9479_41C3_6301A1473E91"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 61.05,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04CCDD9D_31A7_8C0A_41A3_98E5F9721125"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -84.15,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B7E6ECA_31A7_8C09_418A_C39C7D822492"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -71.24,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0BF7001B_31A7_940E_41C2_0FA32CA8107A"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "4a Lot-3 Dumdume Bridge Location",
 "id": "panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -11.98,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 12.49
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -155.83,
   "panorama": "this.panorama_3CF95556_3068_8523_41C4_8925C9D07856",
   "distance": 1,
   "backwardYaw": 123.17
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -17.86,
   "panorama": "this.panorama_3C36216C_3068_9DE0_41C5_228DB51DC855",
   "distance": 1,
   "backwardYaw": 4.58
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 14.73,
   "panorama": "this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518",
   "distance": 1,
   "backwardYaw": -170.12
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_277E7B13_30A8_8D20_41B0_40E78EBCE146",
  "this.overlay_26A393B9_30E9_9D60_4169_3D8878DDF690",
  "this.overlay_26A383B9_30E9_9D60_41A5_D68B1BA5ED6D",
  "this.overlay_272435A5_30A9_8561_419C_60F3A320B895"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "6f Lot-3 Way to Newroad Camp",
 "id": "panorama_3C003B3E_306B_8D63_41C7_B1C38022B172",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 95.85,
   "panorama": "this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A",
   "distance": 1,
   "backwardYaw": -157.21
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -63.93,
   "panorama": "this.panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD",
   "distance": 1,
   "backwardYaw": -3.26
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26E11119_30EB_BD20_41C4_1EF345209075",
  "this.overlay_26A25BF7_30E7_8CE1_419B_FA5B9C51D97C",
  "this.overlay_26A1ABF7_30E7_8CE1_41C5_49A9ED8537B6",
  "this.overlay_28E7C253_30B8_9F20_4178_1985B06E7542"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "6e Lot-3 sukhepokhari bridge",
 "id": "panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -176.63,
   "panorama": "this.panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B",
   "distance": 1,
   "backwardYaw": 0.07
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -3.26,
   "panorama": "this.panorama_3C003B3E_306B_8D63_41C7_B1C38022B172",
   "distance": 1,
   "backwardYaw": -63.93
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_262768F4_30E8_8CE7_41C7_FC7996E7DAA4",
  "this.overlay_27A6B97B_30E7_8DE0_41C6_712ABF867C58",
  "this.overlay_27A6A97B_30E7_8DE0_41B6_D39953CB882D"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 109.56,
  "pitch": 1.11
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "6d Lot-3 Harion bazar.jpg",
 "id": "panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 0.07,
   "panorama": "this.panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD",
   "distance": 1,
   "backwardYaw": -176.63
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -167.72,
   "panorama": "this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B",
   "distance": 1,
   "backwardYaw": -11.27
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26DB5B31_30E8_8D60_41A5_CEBFF7DC0252",
  "this.overlay_26B5D1A0_30E8_7D1F_41C6_AF063870E7C2",
  "this.overlay_26B5F1A1_30E8_7D61_41C6_690B49733A0B"
 ]
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "media": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "media": "this.panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "media": "this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "media": "this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "media": "this.panorama_3C375952_3069_8D23_418B_CCCE355F3AB0",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "media": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "media": "this.panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "media": "this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CF95556_3068_8523_41C4_8925C9D07856_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "media": "this.panorama_3CF95556_3068_8523_41C4_8925C9D07856",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 9, 10)",
   "media": "this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 10, 11)",
   "media": "this.panorama_3C36216C_3068_9DE0_41C5_228DB51DC855",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 11, 12)",
   "media": "this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 12, 13)",
   "media": "this.panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 13, 14)",
   "media": "this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 14, 15)",
   "media": "this.panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 15, 16)",
   "media": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C043534_306B_8567_419A_FBE63B7043D3_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 16, 17)",
   "media": "this.panorama_3C043534_306B_8567_419A_FBE63B7043D3",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 17, 18)",
   "media": "this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 18, 19)",
   "media": "this.panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 19, 20)",
   "media": "this.panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 20, 21)",
   "media": "this.panorama_3C003B3E_306B_8D63_41C7_B1C38022B172",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 21, 22)",
   "media": "this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 22, 23)",
   "media": "this.panorama_3CECC6BD_306B_8761_41C6_6907CE84A298",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 23, 24)",
   "media": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 24, 25)",
   "media": "this.panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 25, 26)",
   "media": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 26, 27)",
   "media": "this.panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 27, 28)",
   "media": "this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 28, 29)",
   "media": "this.panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "end": "this.trigger('tourEnded')",
   "camera": "this.panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 29, 0)",
   "media": "this.panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "mainPlayList"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -165.27,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0BAC00BD_31A7_940B_41C2_D745D6510531"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -21.09,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A7D911B_31A7_940F_41BE_2ADFD6975EE8"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -62.94,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0439DD63_31A7_8C3F_416F_60431C2873F8"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -175.42,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B238FB3_31A7_8C1F_418C_0409EC6B2B6B"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 22.79,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A6F2139_31A7_940B_41C8_2B8282EBBD56"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 121.37,
  "pitch": 9.07
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -25.92,
  "pitch": 8.35
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 178.74,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0AC48218_31A7_9409_41C2_03D73C202C76"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 42.57,
  "pitch": 8.59
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 30.16,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A5BD0DB_31A7_940F_41BA_69E9986B1F0B"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -10.49,
  "pitch": 2.25
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -108.95,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_092182FB_31A7_940E_41C1_2D241489BDD4"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "9a Lot-3 Godari Bridge Location",
 "id": "panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 112.04,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 42.89
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 158.91,
   "panorama": "this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543",
   "distance": 1,
   "backwardYaw": -153.52
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 123.59,
   "panorama": "this.panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC",
   "distance": 1,
   "backwardYaw": 98.16
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -10.02,
   "panorama": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
   "distance": 1,
   "backwardYaw": 162.33
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_266A2616_30E8_8720_41B7_F922420213A9",
  "this.overlay_26901C46_30F8_8B20_41C0_5E9185506DC7",
  "this.overlay_26902C46_30F8_8B20_41C3_4D63D2EF853A",
  "this.overlay_2A4784A5_30BF_9B61_41C3_C48C2127E8C9"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -97.12,
  "pitch": 13.98
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 167.07,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_09A98373_31A7_941F_41C9_A54879C4D496"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "6b Lot-3 Chapani Bridge",
 "id": "panorama_3C043534_306B_8567_419A_FBE63B7043D3",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 117.06,
   "panorama": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
   "distance": 1,
   "backwardYaw": 107.47
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_264A6235_30E8_7F61_41C6_184F2C0E1155",
  "this.overlay_26DE1612_30E8_8723_41C4_E93B4732A938",
  "this.overlay_26DE2613_30E8_8721_41B6_141FA8C52D94"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -178.42,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04624D29_31A7_8C0B_4185_D771871799E1"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -139.08,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_04D7CD90_31A7_8C19_41C4_94D91B7D91C9"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -137.85,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_0B990059_31A7_940B_419B_D6E6CB3DC6D0"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 129.7,
  "pitch": 5.18
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -132.7,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A88725D_31A7_940B_41BF_78F78EE2D76A"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "7a Lot-3 Rai Bridge Location",
 "id": "panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -49.75,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 42.42
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -157.21,
   "panorama": "this.panorama_3C003B3E_306B_8D63_41C7_B1C38022B172",
   "distance": 1,
   "backwardYaw": 95.85
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -31.96,
   "panorama": "this.panorama_3CECC6BD_306B_8761_41C6_6907CE84A298",
   "distance": 1,
   "backwardYaw": 70.18
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 7.35,
   "panorama": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
   "distance": 1,
   "backwardYaw": -9.71
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26D866B0_30EB_877F_41BB_79D613AF3DBD",
  "this.overlay_26ACCFAF_30E7_8561_41C1_867216F8921A",
  "this.overlay_26AC3FAF_30E7_8560_41BF_58B214BC5945",
  "this.overlay_29B29C82_30BB_8B23_41C5_1EB2250A94C0"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "4b Lot-3 Dumdume Bridge.jpg",
 "id": "panorama_3C36216C_3068_9DE0_41C5_228DB51DC855",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 4.58,
   "panorama": "this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD",
   "distance": 1,
   "backwardYaw": -17.86
  },
  {
   "panorama": "this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26C6F13A_30E8_7D63_41C6_D2C48396BF31",
  "this.overlay_26FF1CB4_30E9_8B60_41C2_AF46C2AF5BFE",
  "this.overlay_26FF2CB4_30E9_8B60_41BD_85FDC071CD2E"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -41.55,
  "pitch": 2.23
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CEF5904_3069_8D27_41A6_D98E21038851_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "6c Lot-3 Harion",
 "id": "panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -11.27,
   "panorama": "this.panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B",
   "distance": 1,
   "backwardYaw": -167.72
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -176.64,
   "panorama": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
   "distance": 1,
   "backwardYaw": 161.31
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_263ED515_30E8_8520_41B6_53E4F5247777",
  "this.overlay_26E67EB1_30E8_8760_419A_3E8C36C1488A",
  "this.overlay_26E64EB1_30E8_8760_41C7_1BAA6BEC4D7B"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 32.41,
  "pitch": 4.47
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -122.87,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04983E13_31A7_8C1F_41A2_C18A1ABA6BBB"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "2a Lot-3 Kalinjor Bridge Location",
 "id": "panorama_3CEF5904_3069_8D27_41A6_D98E21038851",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -171.04,
   "panorama": "this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5",
   "distance": 1,
   "backwardYaw": 155.87
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -3.71,
   "panorama": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
   "distance": 1,
   "backwardYaw": 64.97
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -68.71,
   "panorama": "this.panorama_3C375952_3069_8D23_418B_CCCE355F3AB0",
   "distance": 1,
   "backwardYaw": 57.13
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -77.89,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 10.52
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_253360A3_3098_9B61_41C5_8F8E0E72F3D8",
  "this.overlay_27852CFF_30E8_84E1_4196_4AC60E928F62",
  "this.overlay_2812E64D_30E8_8720_41C7_DC3B6C9E6770",
  "this.overlay_28A43F2D_30A8_857F_4198_42D5A747F388"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "3c Lot-3 Kalinjor to Lalbandi 1",
 "id": "panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -23.96,
   "panorama": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
   "distance": 1,
   "backwardYaw": -118.95
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -172.42,
   "panorama": "this.panorama_3CF95556_3068_8523_41C4_8925C9D07856",
   "distance": 1,
   "backwardYaw": -39.21
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_27EF7B74_30A7_8DE7_41C5_ABDF60D7308E",
  "this.overlay_26ED14F3_30E9_84E1_41C4_5429F8651FE3",
  "this.overlay_26ED24F3_30E9_84E1_4180_3E2D3523375B"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -137.11,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_082FE3EA_31A7_9409_41BD_6A6F123C71F7"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "8a Lot-3 Dumajor Bridge Location",
 "id": "panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -9.71,
   "panorama": "this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A",
   "distance": 1,
   "backwardYaw": 7.35
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 124.54,
   "panorama": "this.panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A",
   "distance": 1,
   "backwardYaw": 108.76
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 162.33,
   "panorama": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
   "distance": 1,
   "backwardYaw": -10.02
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 47.3,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 42.15
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26F9ECAF_30E8_8B60_419B_7E52243160F9",
  "this.overlay_260F143A_30E7_BB63_41BB_D9C4BBD08603",
  "this.overlay_260EC43A_30E7_BB63_41C1_6AB3C2C47F97",
  "this.overlay_28AACF5F_30B9_8521_41C0_B6B16D4E30B4"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -169.48,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_048AEE31_31A7_8C1B_41C1_2F62D87848E4"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 178.6,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0AF4A22C_31A7_9409_41C1_DDC0AA0B6846"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 8.96,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04BB2E4E_31A7_8C09_41BD_1D7DAF205EF7"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -19.62,
  "pitch": 0.24
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -15.84,
  "pitch": -0.83
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "1b Lot-3 Phuljor bridge location 2",
 "id": "panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 40.92,
   "panorama": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
   "distance": 1,
   "backwardYaw": 90.72
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 157.15,
   "panorama": "this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5",
   "distance": 1,
   "backwardYaw": -1.26
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 47.79,
   "panorama": "this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543",
   "distance": 1,
   "backwardYaw": -1.4
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 12.49,
   "panorama": "this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD",
   "distance": 1,
   "backwardYaw": -11.98
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 14.06,
   "panorama": "this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9",
   "distance": 1,
   "backwardYaw": -39.04
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 42.15,
   "panorama": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
   "distance": 1,
   "backwardYaw": 47.3
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 42.42,
   "panorama": "this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A",
   "distance": 1,
   "backwardYaw": -49.75
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 12.01,
   "panorama": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
   "distance": 1,
   "backwardYaw": 152.05
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 10.52,
   "panorama": "this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851",
   "distance": 1,
   "backwardYaw": -77.89
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 71.05,
   "panorama": "this.panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192",
   "distance": 1,
   "backwardYaw": 100.76
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 9.69,
   "panorama": "this.panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192",
   "distance": 1,
   "backwardYaw": 100.76
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 42.89,
   "panorama": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
   "distance": 1,
   "backwardYaw": 112.04
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_3EF0C935_307B_8D61_41A4_CEE6811E4DC3",
  "this.overlay_3F492C46_3079_8B23_41C1_28AB15435C92",
  "this.overlay_3EB3EE64_3078_87E7_4192_79D2A5F29A28",
  "this.overlay_203CFFEB_3078_84E1_41AB_E1A823BEA0A3",
  "this.overlay_215EDBA1_3068_8D60_41A9_921DEAA37D41",
  "this.overlay_207006F7_3068_84E1_41A6_7C485ED4B6C6",
  "this.overlay_213A1E34_3069_8767_41C7_05ED24CD6C11",
  "this.overlay_20176242_3068_7F23_41C7_7D8C747D9A31",
  "this.overlay_21C48E37_3069_8761_41C1_031657C83D29",
  "this.overlay_21AADEE1_3069_84E0_41C5_53F6C7CE4522",
  "this.overlay_224A4095_3069_9B21_4189_F6B184ACE36E",
  "this.overlay_2279B907_306F_8D21_41C5_31117E5C450C"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -22.85,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_0404ED54_31A7_8C19_41C8_EC7D90636DF3"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 116.07,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_080E13CE_31A7_9409_4172_80F0CD507DF5"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -177.78,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04AB5E6C_31A7_8C09_41BB_5FC00368C5C5"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -108.95,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_09D2D308_31A7_940A_41C7_8C3A5977FA7D"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "10b Lot-3 end location",
 "id": "panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 1.58,
   "panorama": "this.panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33",
   "distance": 1,
   "backwardYaw": 134.11
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -157.21,
   "panorama": "this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543",
   "distance": 1,
   "backwardYaw": 11.72
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_261ACDF9_30E9_84E0_41C1_366C40A276AC",
  "this.overlay_26BE4FAA_30F8_8563_41AA_696D103F6CDA",
  "this.overlay_26BEBFAA_30F8_8563_41B0_08FEF5149CFB"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 2.2,
  "pitch": 1.6
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 170.29,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B602F11_31A7_8C1B_41B6_84CD2331A49D"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -167.99,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_09964340_31A7_9479_41AB_EDDB742DFEE3"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -115.03,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04E7DDEC_31A7_8C09_41B0_DEC580F9749B"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -27.95,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0AA84279_31A7_940B_41AA_75D97A9ADB14"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -56.83,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B333F88_31A7_8C09_41C7_615E1F7AAFF3"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -103.92,
  "pitch": 9.89
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -164.49,
  "pitch": -6.96
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 168.02,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0AE6A23B_31A7_940F_41A3_877FE296BDB5"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 111.29,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A00C197_31A7_9406_41C3_DFB824B614D8"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -24.01,
  "pitch": 3.06
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 26.48,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_082133F8_31A7_9409_41C0_8DA939A52469"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -109.82,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B701EED_31A7_8C0B_41BF_2DE0B9028F7C"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -79.24,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_094A5297_31A7_9407_41C4_7B038A49AB40"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -81.84,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_08D12406_31A7_93F9_41B1_9A5E73A8350B"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -72.53,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B5D0E8D_31A7_8C0A_41C2_C30466E63FD4"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -132.21,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_0A4DC0F8_31A7_9409_41C6_694F30EBD74C"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "5a Lot-3 Lakhandevi Bridge Location",
 "id": "panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -39.34,
   "panorama": "this.panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84",
   "distance": 1,
   "backwardYaw": -4.02
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -171.04,
   "panorama": "this.panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A",
   "distance": 1,
   "backwardYaw": 3.54
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -3.71,
   "panorama": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
   "distance": 1,
   "backwardYaw": -12.93
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -39.04,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 14.06
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_279C0E04_30E9_8727_41C2_0F903BD2EC51",
  "this.overlay_26A6F652_30E8_8723_41AA_551C6BA2047F",
  "this.overlay_26A50652_30E8_8723_41C5_5FE58E78855D",
  "this.overlay_29002BDA_30A8_8D20_41B2_3832110896A6"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -52.9,
  "pitch": 11.77
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 5.49,
  "pitch": 5.56
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CF95556_3068_8523_41C4_8925C9D07856_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 175.98,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0987A34F_31A7_9407_41B3_91C55F95C010"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 7.58,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_093E22DF_31A7_9406_41C2_D7B21C2E4256"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -89.28,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0AD301FA_31A7_9409_41A5_D8338DB2979A"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 115.2,
  "pitch": -5.85
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "3a Lot-3 Kalinjor Bridge Location",
 "id": "panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -168.58,
   "panorama": "this.panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27",
   "distance": 1,
   "backwardYaw": -38.28
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -118.95,
   "panorama": "this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3",
   "distance": 1,
   "backwardYaw": -23.96
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 64.97,
   "panorama": "this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851",
   "distance": 1,
   "backwardYaw": -3.71
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 152.05,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 12.01
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_253FD3B4_30A7_BD67_41BC_9A0F2C255D21",
  "this.overlay_27EE902D_30E8_FB61_41BF_B0F6331BAFC3",
  "this.overlay_27EEA02D_30E8_FB61_41C8_546097FE3932",
  "this.overlay_28E736DC_30A8_8727_41B3_EA4A7658A06E"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "3d Lot-3 Kalinjor to Lalbandi 2",
 "id": "panorama_3CF95556_3068_8523_41C4_8925C9D07856",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -39.21,
   "panorama": "this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3",
   "distance": 1,
   "backwardYaw": -172.42
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 123.17,
   "panorama": "this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD",
   "distance": 1,
   "backwardYaw": -155.83
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_267158E4_30A8_8CE0_41B0_AFDB496D56FD",
  "this.overlay_26B1C6B1_30E9_8761_41A8_918251692DE1",
  "this.overlay_26B1E6B1_30E9_8761_41C5_0E6D48E658AB"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 168.73,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_086CA3AD_31A7_940B_4182_C398278276CE"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 1.85,
  "pitch": 5.85
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -56.41,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_084B2390_31A7_9419_41C8_F85E3EB33E60"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -17.67,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_08C2A414_31A7_9C19_41C1_5AB58C24693B"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 156.04,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_09F45325_31A7_943A_41C3_932CD35711D0"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -137.58,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_0B4E7EAD_31A7_8C0A_41A5_9269BBBC8850"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 3.36,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_042F0D72_31A7_8C1E_41B1_89589F0797EB"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "5b Lot-3 Lakhandevi Bridge",
 "id": "panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -4.02,
   "panorama": "this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9",
   "distance": 1,
   "backwardYaw": -39.34
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_265A3ADA_30E9_8F23_4198_693574C4EFB0",
  "this.overlay_269C3DCD_30E8_8521_41C7_8582AA553E43",
  "this.overlay_269C5DCD_30E8_8521_41BA_43F00BFCABF0"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 22.79,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A1F415C_31A7_9409_41B4_1E49D5BBE723"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "8b Lot-3 Dumajor Bridge",
 "id": "panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 108.76,
   "panorama": "this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE",
   "distance": 1,
   "backwardYaw": 124.54
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26C14674_30E8_87E0_4188_F19ADF996CF3",
  "this.overlay_26A504F3_30E7_84E1_41C5_7DA5917082B8",
  "this.overlay_26A4E4F3_30E7_84E1_41A7_103DD8B8CCF5"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 162.14,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B11CF3A_31A7_8C09_41B7_445C1EEC3A83"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "3b Lot-3 Kalinjor Bridge-2",
 "id": "panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -38.28,
   "panorama": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
   "distance": 1,
   "backwardYaw": -168.58
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_27EF7C44_30A7_8B20_41BB_FF09D496862C",
  "this.overlay_267A5FE9_30E8_84E1_41BE_2DB0D054754D",
  "this.overlay_267A3FE9_30E8_84E1_41C4_CCB4F88BF4AF"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 12.28,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0B8A407B_31A7_940F_41C4_0F8B6997C376"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -24.13,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04F56DCE_31A7_8C09_41C9_A65DB947C165"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -167.51,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_0B03BF60_31A7_8C39_41C8_E0EEC5231BB0"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "9b Lot-3 Godari Bridge",
 "id": "panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 98.16,
   "panorama": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
   "distance": 1,
   "backwardYaw": 123.59
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_27A091A7_30E9_BD61_41A3_BA9DEFCE5F8C",
  "this.overlay_26B7FCF8_30F8_84EF_41BB_F3A9801A6CBA",
  "this.overlay_26B7ECF8_30F8_84EF_4185_0A968E55CD0E"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 130.25,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0AB8526C_31A7_9409_41C6_B456E3F914C1"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -22.85,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_040F1D46_31A7_8C79_41C2_F89FAB2B420C"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 140.96,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A96624B_31A7_940F_41C3_F898338FE9F7"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 148.04,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A3291BA_31A7_9409_41BC_9EB564DF9428"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -165.94,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "id": "camera_085B4381_31A7_94FB_41BA_28716E18FEE7"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 176.74,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A10E179_31A7_940A_41C4_C2F6535359D0"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -179.93,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_081C63BD_31A7_940B_41BE_7036A32B6BEF"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -168.28,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_090E32D0_31A7_941A_41B7_7A99F6E8EE32"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 15.21,
  "pitch": 12.73
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 3.37,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_087CA39F_31A7_9407_41BD_1A7E2C0B9B4A"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 176.29,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_09E46333_31A7_941F_41C5_2D38B327222D"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 140.66,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0A2281D7_31A7_9407_419F_FDFE9F36BCDD"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "1c Lot-3 Phuljor bridge z",
 "id": "panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 100.76,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 71.05
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 88.65,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 71.05
  },
  {
   "panorama": "this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_24F77ACA_309B_8F23_41B7_62F458C7FFB3",
  "this.overlay_26C80C13_309B_8B20_419C_E0263E8AE081",
  "this.overlay_26896712_3098_8523_41B4_692EB7132914"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -1.19,
  "pitch": 11.75
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -55.46,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_083E33DE_31A7_9409_41C4_6A9AEBA46B14"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "4d Lot-3 Nabalpur",
 "id": "panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 3.54,
   "panorama": "this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9",
   "distance": 1,
   "backwardYaw": -171.04
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -149.84,
   "panorama": "this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518",
   "distance": 1,
   "backwardYaw": 2.22
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_2604DA07_30E8_8F21_41C1_43DC0366C38F",
  "this.overlay_26886E07_30E9_8721_41BA_18F03DBAFC69",
  "this.overlay_26887E07_30E9_8720_41A5_46EB07FA4715"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 101,
  "pitch": 10.82
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -105.51,
  "pitch": 2.08
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -18.69,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0BBA6099_31A7_940B_41B6_9A272E25FDDA"
},
{
 "class": "PanoramaPlayer",
 "mouseControlMode": "drag_acceleration",
 "viewerArea": "this.MainViewer",
 "displayPlaybackBar": true,
 "id": "MainViewerPanoramaPlayer",
 "gyroscopeVerticalDraggingEnabled": true,
 "touchControlMode": "drag_rotation"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "4c Lot-3 Bastipur Bridge",
 "id": "panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -170.12,
   "panorama": "this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD",
   "distance": 1,
   "backwardYaw": 14.73
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 2.22,
   "panorama": "this.panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A",
   "distance": 1,
   "backwardYaw": -149.84
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_2610B05A_30E8_BB20_41BD_A4B4620C1C7E",
  "this.overlay_269B4CC0_30E9_8B1F_41A1_7F842371EC37",
  "this.overlay_269B7CC0_30E9_8B1F_41C7_8773ECE7C968"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -117.23,
  "pitch": 8.91
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "10c Lot-3 Bagmati Main Bridge",
 "id": "panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 134.11,
   "panorama": "this.panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18",
   "distance": 1,
   "backwardYaw": 1.58
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_298A6A67_30E8_8FE1_41AE_6F8E0E520EDF",
  "this.overlay_27FABC98_30F8_8B20_41C5_06BF088AE1D6"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -23.12,
  "pitch": 4.64
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_camera"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "6a Lot-3 Chapani Bridge Location",
 "id": "panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 107.47,
   "panorama": "this.panorama_3C043534_306B_8567_419A_FBE63B7043D3",
   "distance": 1,
   "backwardYaw": 117.06
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 161.31,
   "panorama": "this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B",
   "distance": 1,
   "backwardYaw": -176.64
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -12.93,
   "panorama": "this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9",
   "distance": 1,
   "backwardYaw": -3.71
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 90.72,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 40.92
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_264A4A4C_30E9_8F20_41B5_F87A7A1DE62E",
  "this.overlay_2682F3F1_30E8_9CE1_41A6_8DC38CBC9EEE",
  "this.overlay_2682D3F2_30E8_9CE3_41AA_CBA8E8419FC6",
  "this.overlay_271DDD9C_30A8_8527_41B8_121EABC407CB"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "1d Lot-3 Phuljor - Ranibas z",
 "id": "panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 155.87,
   "panorama": "this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851",
   "distance": 1,
   "backwardYaw": -171.04
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -1.26,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 157.15
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 103.37,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 157.15
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_261B20A9_3099_BB60_41BC_445487461CB1",
  "this.overlay_27694314_3099_9D20_4187_08BB397D6F22",
  "this.overlay_281CAA00_3098_8F1F_41AF_8575A6645148"
 ]
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "10a Lot-3 Bagmati East Bridge",
 "id": "panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -1.4,
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "distance": 1,
   "backwardYaw": 47.79
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -153.52,
   "panorama": "this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12",
   "distance": 1,
   "backwardYaw": 158.91
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 11.72,
   "panorama": "this.panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18",
   "distance": 1,
   "backwardYaw": -157.21
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26CE651A_30E9_8523_41C7_12D95D143A8C",
  "this.overlay_26DD1DB1_30F8_8561_41B0_CBDB593D41BD",
  "this.overlay_26DD7DB1_30F8_8561_41C1_E5EE2C777522"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 176.29,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0422DD83_31A7_8CFF_41BE_F5621167C5CA"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 8.96,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04189D38_31A7_8C0A_41C3_2E94732C514F"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 140.79,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_04C04DAB_31A7_8C0F_41C9_82716BAF4901"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -60.41,
  "pitch": 13.07
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 24.78,
  "pitch": -1.48
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 9.88,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0BD57FD5_31A7_8C1B_41A5_65AD662CABDE"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 102.11,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_095A1288_31A7_9409_41C8_0C8C436FDAA4"
},
{
 "hfovMax": 130,
 "hfov": 360,
 "label": "2b Lot-3 Kalinjor Bridge-1",
 "id": "panorama_3C375952_3069_8D23_418B_CCCE355F3AB0",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 3072,
      "colCount": 6,
      "rowCount": 6,
      "height": 3072
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "pitch": 0,
 "thumbnailUrl": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645",
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 57.13,
   "panorama": "this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851",
   "distance": 1,
   "backwardYaw": -68.71
  },
  {
   "panorama": "this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131",
   "class": "AdjacentPanorama"
  }
 ],
 "hfovMin": "120%",
 "partial": false,
 "overlays": [
  "this.overlay_26F9951A_3098_8523_41C4_D249D09D57A1",
  "this.overlay_26A50369_30EB_9DE1_41C2_AEE36233F1F5",
  "this.overlay_26A4F36A_30EB_9DE3_41C8_25195817EED0"
 ]
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -172.65,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0BC54FFA_31A7_8C0E_41A3_0A10A7C4EBEF"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -79.24,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_097C32A6_31A7_9439_41C8_B1BE956DCED1"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 28.58,
  "pitch": 15.99
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_3C043534_306B_8567_419A_FBE63B7043D3_camera"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -67.96,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_096C42B4_31A7_9419_41C8_C87EDBF2D737"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 141.72,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_09C27317_31A7_9406_41C8_FFE2C3D3619E"
},
{
 "class": "PanoramaCamera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 169.98,
  "pitch": 0
 },
 "automaticZoomSpeed": 10,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_0BE7403A_31A7_9409_41C7_724E57B20C77"
},
{
 "toolTipTextShadowBlurRadius": 3,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "id": "MainViewer",
 "toolTipFontWeight": "normal",
 "toolTipShadowColor": "#333333",
 "playbackBarHeadWidth": 6,
 "playbackBarRight": 0,
 "playbackBarBackgroundColorDirection": "vertical",
 "progressBarBorderSize": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarBorderRadius": 0,
 "minHeight": 50,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBorderRadius": 0,
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Arial",
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "progressLeft": 0,
 "playbackBarBorderSize": 0,
 "height": "100%",
 "minWidth": 100,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "paddingRight": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontColor": "#606060",
 "paddingLeft": 0,
 "progressRight": 0,
 "playbackBarHeadShadowColor": "#000000",
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "vrPointerSelectionTime": 2000,
 "progressBarBackgroundColorDirection": "vertical",
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 0,
 "transitionDuration": 500,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "shadow": false,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "borderSize": 0,
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipPaddingRight": 6,
 "class": "ViewerArea",
 "toolTipBorderSize": 1,
 "toolTipShadowVerticalLength": 0,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "progressBarOpacity": 1,
 "toolTipDisplayTime": 600,
 "progressBorderSize": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBorderRadius": 0,
 "playbackBarHeadHeight": 15,
 "transitionMode": "blending",
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarLeft": 0,
 "progressBarBorderColor": "#000000",
 "displayTooltipInTouchScreens": true,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "progressBorderColor": "#000000",
 "toolTipTextShadowColor": "#000000",
 "paddingTop": 0,
 "toolTipBorderColor": "#767676",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipFontSize": "1.11vmin",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipOpacity": 1,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "paddingBottom": 0,
 "data": {
  "name": "Main Viewer"
 }
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 22.12,
   "hfov": 13.27,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 23,
      "height": 16
     }
    ]
   },
   "pitch": 19.5
  }
 ],
 "id": "overlay_26FE1813_30EB_8B20_41C1_E9D482FD837F",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.27,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 340,
      "height": 229
     }
    ]
   },
   "pitch": 19.5,
   "yaw": 22.12
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -27.98,
   "hfov": 8.4,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.43
  }
 ],
 "id": "overlay_26AC5092_30E7_9B20_41C7_ADFE93A809D6",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 23)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.4,
   "image": "this.AnimatedImageResource_2B2FF272_30A8_BFE3_41B8_CF6904BC0C85",
   "pitch": 4.43,
   "yaw": -27.98,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 70.18,
   "hfov": 11.82,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 14.6
  }
 ],
 "id": "overlay_26AC4093_30E7_9B21_41C0_9A465B52C5C1",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A, this.camera_0A3291BA_31A7_9409_41BC_9EB564DF9428); this.mainPlayList.set('selectedIndex', 21)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 11.82,
   "image": "this.AnimatedImageResource_2B202272_30A8_BFE3_418C_74B2DC72F7E6",
   "pitch": 14.6,
   "yaw": 70.18,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -11.98,
   "hfov": 6.45,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 32.42
  }
 ],
 "id": "overlay_277E7B13_30A8_8D20_41B0_40E78EBCE146",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_0B03BF60_31A7_8C39_41C8_E0EEC5231BB0); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.45,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 184,
      "height": 210
     }
    ]
   },
   "pitch": 32.42,
   "yaw": -11.98
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -155.83,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.83
  }
 ],
 "id": "overlay_26A393B9_30E9_9D60_4169_3D8878DDF690",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CF95556_3068_8523_41C4_8925C9D07856, this.camera_0B333F88_31A7_8C09_41C7_615E1F7AAFF3); this.mainPlayList.set('selectedIndex', 8)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B36225E_30A8_BF20_416A_766A29C50E52",
   "pitch": 1.83,
   "yaw": -155.83,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 14.73,
   "hfov": 12.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.1
  }
 ],
 "id": "overlay_26A383B9_30E9_9D60_41A5_D68B1BA5ED6D",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518, this.camera_0BD57FD5_31A7_8C1B_41A5_65AD662CABDE); this.mainPlayList.set('selectedIndex', 11)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.16,
   "image": "this.AnimatedImageResource_2B36625E_30A8_BF20_41A2_19231D8BD9BA",
   "pitch": 5.1,
   "yaw": 14.73,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -17.86,
   "hfov": 12.19,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.24
  }
 ],
 "id": "overlay_272435A5_30A9_8561_419C_60F3A320B895",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C36216C_3068_9DE0_41C5_228DB51DC855, this.camera_0B238FB3_31A7_8C1F_418C_0409EC6B2B6B); this.mainPlayList.set('selectedIndex', 10)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.19,
   "image": "this.AnimatedImageResource_2B36A25E_30A8_BF20_41C1_29D7CDAE9A21",
   "pitch": 3.24,
   "yaw": -17.86,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 27.1,
   "hfov": 10.39,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 18,
      "height": 16
     }
    ]
   },
   "pitch": 23.87
  }
 ],
 "id": "overlay_26E11119_30EB_BD20_41C4_1EF345209075",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.39,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 274,
      "height": 236
     }
    ]
   },
   "pitch": 23.87,
   "yaw": 27.1
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -63.93,
   "hfov": 8.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0.93
  }
 ],
 "id": "overlay_26A25BF7_30E7_8CE1_419B_FA5B9C51D97C",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD, this.camera_0A10E179_31A7_940A_41C4_C2F6535359D0); this.mainPlayList.set('selectedIndex', 19)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.43,
   "image": "this.AnimatedImageResource_2B2DE26F_30A8_BFE0_41B8_23AD88966732",
   "pitch": 0.93,
   "yaw": -63.93,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B2E326F_30A8_BFFE_41C3_D3A42FA2BD01",
   "pitch": -1.36,
   "yaw": -3.71,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "enabledInCardboard": true,
 "rollOverDisplay": false,
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -3.71,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.36
  }
 ],
 "id": "overlay_26A1ABF7_30E7_8CE1_41C5_49A9ED8537B6",
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 95.85,
   "hfov": 12.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.1
  }
 ],
 "id": "overlay_28E7C253_30B8_9F20_4178_1985B06E7542",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A, this.camera_0A1F415C_31A7_9409_41B4_1E49D5BBE723); this.mainPlayList.set('selectedIndex', 21)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.16,
   "image": "this.AnimatedImageResource_2B2E7272_30A8_BFE3_41AF_830851153B02",
   "pitch": 5.1,
   "yaw": 95.85,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 14.92,
   "hfov": 12.11,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 23,
      "height": 15
     }
    ]
   },
   "pitch": 22.97
  }
 ],
 "id": "overlay_262768F4_30E8_8CE7_41C7_FC7996E7DAA4",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.11,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 317,
      "height": 214
     }
    ]
   },
   "pitch": 22.97,
   "yaw": 14.92
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -176.63,
   "hfov": 8.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.04
  }
 ],
 "id": "overlay_27A6B97B_30E7_8DE0_41C6_712ABF867C58",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B, this.camera_081C63BD_31A7_940B_41BE_7036A32B6BEF); this.mainPlayList.set('selectedIndex', 18)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.43,
   "image": "this.AnimatedImageResource_2B2CC26F_30A8_BFE1_41B3_A4893223E4DD",
   "pitch": -0.04,
   "yaw": -176.63,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -3.26,
   "hfov": 12.18,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.93
  }
 ],
 "id": "overlay_27A6A97B_30E7_8DE0_41B6_D39953CB882D",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C003B3E_306B_8D63_41C7_B1C38022B172, this.camera_080E13CE_31A7_9409_4172_80F0CD507DF5); this.mainPlayList.set('selectedIndex', 20)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.18,
   "image": "this.AnimatedImageResource_2B2D626F_30A8_BFE1_41A8_9495D7D23B7E",
   "pitch": 3.93,
   "yaw": -3.26,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -71.62,
   "hfov": 13.24,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 25,
      "height": 16
     }
    ]
   },
   "pitch": 29.89
  }
 ],
 "id": "overlay_26DB5B31_30E8_8D60_41A5_CEBFF7DC0252",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.24,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 369,
      "height": 230
     }
    ]
   },
   "pitch": 29.89,
   "yaw": -71.62
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -167.72,
   "hfov": 8.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.73
  }
 ],
 "id": "overlay_26B5D1A0_30E8_7D1F_41C6_AF063870E7C2",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B, this.camera_086CA3AD_31A7_940B_4182_C398278276CE); this.mainPlayList.set('selectedIndex', 17)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.41,
   "image": "this.AnimatedImageResource_1B49CAB4_3198_741A_419E_1D9CF9E18FD4",
   "pitch": 3.73,
   "yaw": -167.72,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0.07,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.76
  }
 ],
 "id": "overlay_26B5F1A1_30E8_7D61_41C6_690B49733A0B",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD, this.camera_087CA39F_31A7_9407_41BD_1A7E2C0B9B4A); this.mainPlayList.set('selectedIndex', 19)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.2,
   "image": "this.AnimatedImageResource_1B567AB4_3198_741A_41AC_F47BF386A9DF",
   "pitch": 2.76,
   "yaw": 0.07,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 112.04,
   "hfov": 11.97,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 21,
      "height": 16
     }
    ]
   },
   "pitch": 17.69
  }
 ],
 "id": "overlay_266A2616_30E8_8720_41B7_F922420213A9",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_082FE3EA_31A7_9409_41BD_6A6F123C71F7); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.97,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 303,
      "height": 229
     }
    ]
   },
   "pitch": 17.69,
   "yaw": 112.04
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -10.02,
   "hfov": 8.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0.03
  }
 ],
 "id": "overlay_26901C46_30F8_8B20_41C0_5E9185506DC7",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE, this.camera_08C2A414_31A7_9C19_41C1_5AB58C24693B); this.mainPlayList.set('selectedIndex', 23)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.43,
   "image": "this.AnimatedImageResource_2B20F27A_30A8_BFE3_41C0_911E2F224DB1",
   "pitch": 0.03,
   "yaw": -10.02,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 158.91,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0.1
  }
 ],
 "id": "overlay_26902C46_30F8_8B20_41C3_4D63D2EF853A",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543, this.camera_082133F8_31A7_9409_41C0_8DA939A52469); this.mainPlayList.set('selectedIndex', 27)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_0711AD98_31B8_8C09_41B8_09437AA0623F",
   "pitch": 0.1,
   "yaw": 158.91,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 123.59,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0.65
  }
 ],
 "id": "overlay_2A4784A5_30BF_9B61_41C3_C48C2127E8C9",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC, this.camera_08D12406_31A7_93F9_41B1_9A5E73A8350B); this.mainPlayList.set('selectedIndex', 26)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_07104D99_31B8_8C0B_41B6_5BB5A4B4E193",
   "pitch": 0.65,
   "yaw": 123.59,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 63.05,
   "hfov": 10.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 21,
      "height": 16
     }
    ]
   },
   "pitch": 35.78
  }
 ],
 "id": "overlay_264A6235_30E8_7F61_41C6_184F2C0E1155",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.43,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 310,
      "height": 229
     }
    ]
   },
   "pitch": 35.78,
   "yaw": 63.05
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -6.4,
   "hfov": 8.27,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 11.1
  }
 ],
 "id": "overlay_26DE1612_30E8_8723_41C4_E93B4732A938",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 17)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.27,
   "image": "this.AnimatedImageResource_2B2AA266_30A8_BFE0_4196_BF21392F8E00",
   "pitch": 11.1,
   "yaw": -6.4,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 117.06,
   "hfov": 11.83,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 14.32
  }
 ],
 "id": "overlay_26DE2613_30E8_8721_41B6_141FA8C52D94",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3, this.camera_0B5D0E8D_31A7_8C0A_41C2_C30466E63FD4); this.mainPlayList.set('selectedIndex', 15)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 11.83,
   "image": "this.AnimatedImageResource_2B2AC266_30A8_BFE0_41AD_A1A473AD5B4A",
   "pitch": 14.32,
   "yaw": 117.06,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -49.75,
   "hfov": 11.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 24,
      "height": 16
     }
    ]
   },
   "pitch": 23.86
  }
 ],
 "id": "overlay_26D866B0_30EB_877F_41BB_79D613AF3DBD",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_0B4E7EAD_31A7_8C0A_41A5_9269BBBC8850); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 296,
      "height": 193
     }
    ]
   },
   "pitch": 23.86,
   "yaw": -49.75
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -157.21,
   "hfov": 8.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.93
  }
 ],
 "id": "overlay_26ACCFAF_30E7_8561_41C1_867216F8921A",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C003B3E_306B_8D63_41C7_B1C38022B172, this.camera_0B7E6ECA_31A7_8C09_418A_C39C7D822492); this.mainPlayList.set('selectedIndex', 20)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.43,
   "image": "this.AnimatedImageResource_2B2EE272_30A8_BFE3_4192_4A75B873ED7C",
   "pitch": -0.93,
   "yaw": -157.21,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 7.35,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.8
  }
 ],
 "id": "overlay_26AC3FAF_30E7_8560_41BF_58B214BC5945",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE, this.camera_0B602F11_31A7_8C1B_41B6_84CD2331A49D); this.mainPlayList.set('selectedIndex', 23)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.2,
   "image": "this.AnimatedImageResource_2B2F3272_30A8_BFE3_41C3_340FB8E2D3D7",
   "pitch": 2.8,
   "yaw": 7.35,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -31.96,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.27
  }
 ],
 "id": "overlay_29B29C82_30BB_8B23_41C5_1EB2250A94C0",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CECC6BD_306B_8761_41C6_6907CE84A298, this.camera_0B701EED_31A7_8C0B_41BF_2DE0B9028F7C); this.mainPlayList.set('selectedIndex', 22)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.2,
   "image": "this.AnimatedImageResource_2B2F7272_30A8_BFE3_41B3_10AE5AA932AE",
   "pitch": 2.27,
   "yaw": -31.96,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -31.63,
   "hfov": 12.99,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 21,
      "height": 16
     }
    ]
   },
   "pitch": 22.66
  }
 ],
 "id": "overlay_26C6F13A_30E8_7D63_41C6_D2C48396BF31",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.99,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 340,
      "height": 251
     }
    ]
   },
   "pitch": 22.66,
   "yaw": -31.63
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -140.62,
   "hfov": 8.37,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.44
  }
 ],
 "id": "overlay_26FF1CB4_30E9_8B60_41C2_AF46C2AF5BFE",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 11)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.37,
   "image": "this.AnimatedImageResource_2B37025E_30A8_BF20_41AE_B4A683A15A7B",
   "pitch": 6.44,
   "yaw": -140.62,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 4.58,
   "hfov": 12.12,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.95
  }
 ],
 "id": "overlay_26FF2CB4_30E9_8B60_41BD_85FDC071CD2E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD, this.camera_0B11CF3A_31A7_8C09_41B7_445C1EEC3A83); this.mainPlayList.set('selectedIndex', 9)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.12,
   "image": "this.AnimatedImageResource_2B37425E_30A8_BF20_41B3_34E621688162",
   "pitch": 6.95,
   "yaw": 4.58,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -63.21,
   "hfov": 12,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 21,
      "height": 16
     }
    ]
   },
   "pitch": 21.3
  }
 ],
 "id": "overlay_263ED515_30E8_8520_41B6_53E4F5247777",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 311,
      "height": 229
     }
    ]
   },
   "pitch": 21.3,
   "yaw": -63.21
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -176.64,
   "hfov": 8.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -3.67
  }
 ],
 "id": "overlay_26E67EB1_30E8_8760_419A_3E8C36C1488A",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3, this.camera_0BBA6099_31A7_940B_41B6_9A272E25FDDA); this.mainPlayList.set('selectedIndex', 15)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.41,
   "image": "this.AnimatedImageResource_2B2B626E_30A8_BFE3_41BE_24E983FF1814",
   "pitch": -3.67,
   "yaw": -176.64,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -11.27,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.27
  }
 ],
 "id": "overlay_26E64EB1_30E8_8760_41C7_1BAA6BEC4D7B",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B, this.camera_0B8A407B_31A7_940F_41C4_0F8B6997C376); this.mainPlayList.set('selectedIndex', 18)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.2,
   "image": "this.AnimatedImageResource_2B2B926E_30A8_BFE3_419E_B9BE18D4A164",
   "pitch": 2.27,
   "yaw": -11.27,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -77.89,
   "hfov": 11.06,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 19,
      "height": 16
     }
    ]
   },
   "pitch": 29.15
  }
 ],
 "id": "overlay_253360A3_3098_9B61_41C5_8F8E0E72F3D8",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_048AEE31_31A7_8C1B_41C1_2F62D87848E4); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.06,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 306,
      "height": 246
     }
    ]
   },
   "pitch": 29.15,
   "yaw": -77.89
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -171.04,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.86
  }
 ],
 "id": "overlay_27852CFF_30E8_84E1_4196_4AC60E928F62",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5, this.camera_04F56DCE_31A7_8C09_41C9_A65DB947C165); this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B309251_30A8_BF20_41C0_BC814EF1C7EC",
   "pitch": -1.86,
   "yaw": -171.04,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -3.71,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.36
  }
 ],
 "id": "overlay_2812E64D_30E8_8720_41C7_DC3B6C9E6770",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645, this.camera_04E7DDEC_31A7_8C09_41B0_DEC580F9749B); this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B312251_30A8_BF20_41B9_2867FF944FC9",
   "pitch": -1.36,
   "yaw": -3.71,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -68.71,
   "hfov": 12.07,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -8.72
  }
 ],
 "id": "overlay_28A43F2D_30A8_857F_4198_42D5A747F388",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C375952_3069_8D23_418B_CCCE355F3AB0, this.camera_04983E13_31A7_8C1F_41A2_C18A1ABA6BBB); this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.07,
   "image": "this.AnimatedImageResource_2B317251_30A8_BF20_41C2_7A9D6458F7FA",
   "pitch": -8.72,
   "yaw": -68.71,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -35.38,
   "hfov": 6.92,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 17
     }
    ]
   },
   "pitch": 14.06
  }
 ],
 "id": "overlay_27EF7B74_30A7_8DE7_41C5_ABDF60D7308E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.92,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 172,
      "height": 185
     }
    ]
   },
   "pitch": 14.06,
   "yaw": -35.38
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -172.42,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.86
  }
 ],
 "id": "overlay_26ED14F3_30E9_84E1_41C4_5429F8651FE3",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CF95556_3068_8523_41C4_8925C9D07856, this.camera_04C04DAB_31A7_8C0F_41C9_82716BAF4901); this.mainPlayList.set('selectedIndex', 8)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B34A25D_30A8_BF20_41B1_71FF79169893",
   "pitch": -1.86,
   "yaw": -172.42,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -23.96,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.71
  }
 ],
 "id": "overlay_26ED24F3_30E9_84E1_4180_3E2D3523375B",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645, this.camera_04CCDD9D_31A7_8C0A_41A3_98E5F9721125); this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_1B40CAAE_3198_7406_41A4_FE163BEEB774",
   "pitch": 1.71,
   "yaw": -23.96,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 47.3,
   "hfov": 9.93,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 20,
      "height": 16
     }
    ]
   },
   "pitch": 31.55
  }
 ],
 "id": "overlay_26F9ECAF_30E8_8B60_419B_7E52243160F9",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_0B990059_31A7_940B_419B_D6E6CB3DC6D0); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.93,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 281,
      "height": 215
     }
    ]
   },
   "pitch": 31.55,
   "yaw": 47.3
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -9.71,
   "hfov": 8.39,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.52
  }
 ],
 "id": "overlay_260F143A_30E7_BB63_41BB_D9C4BBD08603",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A, this.camera_0BC54FFA_31A7_8C0E_41A3_0A10A7C4EBEF); this.mainPlayList.set('selectedIndex', 21)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.39,
   "image": "this.AnimatedImageResource_2B20A272_30A8_BFE3_41C4_3B19C016771A",
   "pitch": 5.52,
   "yaw": -9.71,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 162.33,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.21
  }
 ],
 "id": "overlay_260EC43A_30E7_BB63_41C1_6AB3C2C47F97",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12, this.camera_0BE7403A_31A7_9409_41C7_724E57B20C77); this.mainPlayList.set('selectedIndex', 25)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.2,
   "image": "this.AnimatedImageResource_0713FD96_31B8_8C19_419F_5BEE2C91812C",
   "pitch": 2.21,
   "yaw": 162.33,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 124.54,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.88
  }
 ],
 "id": "overlay_28AACF5F_30B9_8521_41C0_B6B16D4E30B4",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A, this.camera_0BF7001B_31A7_940E_41C2_0FA32CA8107A); this.mainPlayList.set('selectedIndex', 24)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.2,
   "image": "this.AnimatedImageResource_2B2FA272_30A8_BFE3_41C1_A8FEF53917D6",
   "pitch": 1.88,
   "yaw": 124.54,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 157.15,
   "hfov": 21.04,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 29,
      "height": 16
     }
    ]
   },
   "pitch": -1.42
  }
 ],
 "id": "overlay_3EF0C935_307B_8D61_41A4_CEE6811E4DC3",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5, this.camera_0AC48218_31A7_9409_41C2_03D73C202C76); this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 21.04,
   "image": "this.AnimatedImageResource_2400176A_306B_85E0_41A1_191BC4FF3D35",
   "pitch": -1.42,
   "yaw": 157.15,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 06a Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 71.05,
   "hfov": 15.23,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 29,
      "height": 16
     }
    ]
   },
   "pitch": -3.15
  }
 ],
 "id": "overlay_3F492C46_3079_8B23_41C1_28AB15435C92",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192, this.camera_094A5297_31A7_9407_41C4_7B038A49AB40); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 15.23,
   "image": "this.AnimatedImageResource_2402D76B_306B_85E0_41BF_74433629CB8E",
   "pitch": -3.15,
   "yaw": 71.05,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "data": {
  "label": "Arrow 01b"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 10.52,
   "hfov": 16.34,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_2_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 54,
      "height": 16
     }
    ]
   },
   "pitch": 45.42
  }
 ],
 "id": "overlay_3EB3EE64_3078_87E7_4192_79D2A5F29A28",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851, this.camera_095A1288_31A7_9409_41C8_0C8C436FDAA4); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 16.34,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 562,
      "height": 165
     }
    ]
   },
   "pitch": 45.42,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 10.52,
   "distance": 50
  }
 ],
 "data": {
  "label": "Kalinjor-1"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 9.69,
   "hfov": 10.51,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_3_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 38,
      "height": 16
     }
    ]
   },
   "pitch": 54.42
  }
 ],
 "id": "overlay_203CFFEB_3078_84E1_41AB_E1A823BEA0A3",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192, this.camera_097C32A6_31A7_9439_41C8_B1BE956DCED1); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 10.51,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 436,
      "height": 179
     }
    ]
   },
   "pitch": 54.42,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 9.69,
   "distance": 50
  }
 ],
 "data": {
  "label": "Phuljor"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 12.01,
   "hfov": 18.64,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_4_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 54,
      "height": 16
     }
    ]
   },
   "pitch": 36.63
  }
 ],
 "id": "overlay_215EDBA1_3068_8D60_41A9_921DEAA37D41",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645, this.camera_0AA84279_31A7_940B_41AA_75D97A9ADB14); this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 18.64,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 561,
      "height": 164
     }
    ]
   },
   "pitch": 36.63,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 12.01,
   "distance": 50
  }
 ],
 "data": {
  "label": "Kalinjor-2"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 14.06,
   "hfov": 23.65,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_5_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 63,
      "height": 16
     }
    ]
   },
   "pitch": 20.99
  }
 ],
 "id": "overlay_207006F7_3068_84E1_41A6_7C485ED4B6C6",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9, this.camera_0A96624B_31A7_940F_41C3_F898338FE9F7); this.mainPlayList.set('selectedIndex', 13)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 23.65,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 612,
      "height": 154
     }
    ]
   },
   "pitch": 20.99,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 14.06,
   "distance": 50
  }
 ],
 "data": {
  "label": "Lakhandei"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 12.49,
   "hfov": 20.37,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_6_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 54,
      "height": 16
     }
    ]
   },
   "pitch": 28.6
  }
 ],
 "id": "overlay_213A1E34_3069_8767_41C7_05ED24CD6C11",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD, this.camera_0AE6A23B_31A7_940F_41A3_877FE296BDB5); this.mainPlayList.set('selectedIndex', 9)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 20.37,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 560,
      "height": 163
     }
    ]
   },
   "pitch": 28.6,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 12.49,
   "distance": 50
  }
 ],
 "data": {
  "label": "Dumdume"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 42.89,
   "hfov": 22.33,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_8_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 65,
      "height": 16
     }
    ]
   },
   "pitch": 27.13
  }
 ],
 "id": "overlay_20176242_3068_7F23_41C7_7D8C747D9A31",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12, this.camera_096C42B4_31A7_9419_41C8_C87EDBF2D737); this.mainPlayList.set('selectedIndex', 25)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 22.33,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 606,
      "height": 148
     }
    ]
   },
   "pitch": 27.13,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 42.89,
   "distance": 50
  }
 ],
 "data": {
  "label": "Godari"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 40.92,
   "hfov": 14.62,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_9_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 64,
      "height": 16
     }
    ]
   },
   "pitch": 54.51
  }
 ],
 "id": "overlay_21C48E37_3069_8761_41C1_031657C83D29",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3, this.camera_0AD301FA_31A7_9409_41A5_D8338DB2979A); this.mainPlayList.set('selectedIndex', 15)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 14.62,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 608,
      "height": 150
     }
    ]
   },
   "pitch": 54.51,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 40.92,
   "distance": 50
  }
 ],
 "data": {
  "label": "Chapani"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 42.42,
   "hfov": 17.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_10_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 65,
      "height": 16
     }
    ]
   },
   "pitch": 44.96
  }
 ],
 "id": "overlay_21AADEE1_3069_84E0_41C5_53F6C7CE4522",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A, this.camera_0AB8526C_31A7_9409_41C6_B456E3F914C1); this.mainPlayList.set('selectedIndex', 21)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 17.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_10_0.png",
      "class": "ImageResourceLevel",
      "width": 608,
      "height": 149
     }
    ]
   },
   "pitch": 44.96,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 42.42,
   "distance": 50
  }
 ],
 "data": {
  "label": "Rai"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 42.15,
   "hfov": 20.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_11_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 65,
      "height": 16
     }
    ]
   },
   "pitch": 36.67
  }
 ],
 "id": "overlay_224A4095_3069_9B21_4189_F6B184ACE36E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE, this.camera_0A88725D_31A7_940B_41BF_78F78EE2D76A); this.mainPlayList.set('selectedIndex', 23)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 20.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 607,
      "height": 149
     }
    ]
   },
   "pitch": 36.67,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 42.15,
   "distance": 50
  }
 ],
 "data": {
  "label": "Dumajor"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 47.79,
   "hfov": 31.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_12_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 69,
      "height": 16
     }
    ]
   },
   "pitch": 18.33
  }
 ],
 "id": "overlay_2279B907_306F_8D21_41C5_31117E5C450C",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543, this.camera_0AF4A22C_31A7_9409_41C1_DDC0AA0B6846); this.mainPlayList.set('selectedIndex', 27)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 31.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_12_0.png",
      "class": "ImageResourceLevel",
      "width": 794,
      "height": 184
     }
    ]
   },
   "pitch": 18.33,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 47.79,
   "distance": 50
  }
 ],
 "data": {
  "label": "Bagmati East"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -136.89,
   "hfov": 8.35,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 25.37
  }
 ],
 "id": "overlay_261ACDF9_30E9_84E0_41C1_366C40A276AC",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.35,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 223,
      "height": 251
     }
    ]
   },
   "pitch": 25.37,
   "yaw": -136.89
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -157.21,
   "hfov": 8.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.01
  }
 ],
 "id": "overlay_26BE4FAA_30F8_8563_41AA_696D103F6CDA",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543, this.camera_090E32D0_31A7_941A_41B7_7A99F6E8EE32); this.mainPlayList.set('selectedIndex', 27)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.43,
   "image": "this.AnimatedImageResource_2B23827F_30A8_BFE1_41C1_923050ACECED",
   "pitch": -0.01,
   "yaw": -157.21,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 1.58,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.45
  }
 ],
 "id": "overlay_26BEBFAA_30F8_8563_41B0_08FEF5149CFB",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33, this.camera_091E12C2_31A7_9479_41C3_6301A1473E91); this.mainPlayList.set('selectedIndex', 29)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B23F27F_30A8_BFE1_41AD_C30B55468893",
   "pitch": -0.45,
   "yaw": 1.58,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -39.04,
   "hfov": 10.64,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 8.19
  }
 ],
 "id": "overlay_279C0E04_30E9_8727_41C2_0F903BD2EC51",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_085B4381_31A7_94FB_41BA_28716E18FEE7); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.64,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 259,
      "height": 251
     }
    ]
   },
   "pitch": 8.19,
   "yaw": -39.04
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -171.04,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.86
  }
 ],
 "id": "overlay_26A6F652_30E8_8723_41AA_551C6BA2047F",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A, this.camera_09B7E361_31A7_943B_41C2_29FD9FD75C89); this.mainPlayList.set('selectedIndex', 12)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B29725E_30A8_BF20_41C3_86DF4F3BE490",
   "pitch": -1.86,
   "yaw": -171.04,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -3.71,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.36
  }
 ],
 "id": "overlay_26A50652_30E8_8723_41C5_5FE58E78855D",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3, this.camera_09A98373_31A7_941F_41C9_A54879C4D496); this.mainPlayList.set('selectedIndex', 15)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B29825E_30A8_BF20_41B4_9724A9B7F5EE",
   "pitch": -1.36,
   "yaw": -3.71,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -39.34,
   "hfov": 12.18,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -3.97
  }
 ],
 "id": "overlay_29002BDA_30A8_8D20_41B2_3832110896A6",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84, this.camera_0987A34F_31A7_9407_41B3_91C55F95C010); this.mainPlayList.set('selectedIndex', 14)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.18,
   "image": "this.AnimatedImageResource_2B286266_30A8_BFE0_41B1_24DA759CDD82",
   "pitch": -3.97,
   "yaw": -39.34,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 152.05,
   "hfov": 8.03,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 21.73
  }
 ],
 "id": "overlay_253FD3B4_30A7_BD67_41BC_9A0F2C255D21",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_09964340_31A7_9479_41AB_EDDB742DFEE3); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.03,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 208,
      "height": 191
     }
    ]
   },
   "pitch": 21.73,
   "yaw": 152.05
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -168.58,
   "hfov": 11.46,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -4.31
  }
 ],
 "id": "overlay_27EE902D_30E8_FB61_41BF_B0F6331BAFC3",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27, this.camera_09C27317_31A7_9406_41C8_FFE2C3D3619E); this.mainPlayList.set('selectedIndex', 6)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 11.46,
   "image": "this.AnimatedImageResource_2B32E251_30A8_BF28_4192_B44F4C0D4B7A",
   "pitch": -4.31,
   "yaw": -168.58,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 64.97,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.89
  }
 ],
 "id": "overlay_27EEA02D_30E8_FB61_41C8_546097FE3932",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851, this.camera_09E46333_31A7_941F_41C5_2D38B327222D); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B332259_30A8_BF20_41C2_12BE38148864",
   "pitch": -0.89,
   "yaw": 64.97,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -118.95,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.2
  }
 ],
 "id": "overlay_28E736DC_30A8_8727_41B3_EA4A7658A06E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3, this.camera_09F45325_31A7_943A_41C3_932CD35711D0); this.mainPlayList.set('selectedIndex', 7)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B336259_30A8_BF20_41B6_3FF42EFF21B7",
   "pitch": -1.2,
   "yaw": -118.95,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 96.57,
   "hfov": 7.61,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 24.88
  }
 ],
 "id": "overlay_267158E4_30A8_8CE0_41B0_AFDB496D56FD",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.61,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 202,
      "height": 210
     }
    ]
   },
   "pitch": 24.88,
   "yaw": 96.57
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -39.21,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.83
  }
 ],
 "id": "overlay_26B1C6B1_30E9_8761_41A8_918251692DE1",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3, this.camera_093E22DF_31A7_9406_41C2_D7B21C2E4256); this.mainPlayList.set('selectedIndex', 7)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B35125D_30A8_BF20_419C_5E81600BF443",
   "pitch": 1.83,
   "yaw": -39.21,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 123.17,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.54
  }
 ],
 "id": "overlay_26B1E6B1_30E9_8761_41C5_0E6D48E658AB",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD, this.camera_092FF2EE_31A7_9406_41BE_3CDE2B54AB2A); this.mainPlayList.set('selectedIndex', 9)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_1B418AAE_3198_7406_41A5_4B3FBCA0499E",
   "pitch": -0.54,
   "yaw": 123.17,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 46.72,
   "hfov": 12.85,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 26,
      "height": 15
     }
    ]
   },
   "pitch": 28.85
  }
 ],
 "id": "overlay_265A3ADA_30E9_8F23_4198_693574C4EFB0",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.85,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 354,
      "height": 214
     }
    ]
   },
   "pitch": 28.85,
   "yaw": 46.72
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -133.24,
   "hfov": 8.4,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.14
  }
 ],
 "id": "overlay_269C3DCD_30E8_8521_41C7_8582AA553E43",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 15)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.4,
   "image": "this.AnimatedImageResource_2B289266_30A8_BFE0_41A6_378739569282",
   "pitch": 4.14,
   "yaw": -133.24,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -4.02,
   "hfov": 12.19,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.63
  }
 ],
 "id": "overlay_269C5DCD_30E8_8521_41BA_43F00BFCABF0",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9, this.camera_0A2281D7_31A7_9407_419F_FDFE9F36BCDD); this.mainPlayList.set('selectedIndex', 13)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.19,
   "image": "this.AnimatedImageResource_2B292266_30A8_BFE0_41BF_0AB6280415AE",
   "pitch": 3.63,
   "yaw": -4.02,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 117.1,
   "hfov": 13.79,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 30,
      "height": 16
     }
    ]
   },
   "pitch": 22.97
  }
 ],
 "id": "overlay_26C14674_30E8_87E0_4188_F19ADF996CF3",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 362,
      "height": 192
     }
    ]
   },
   "pitch": 22.97,
   "yaw": 117.1
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -22.61,
   "hfov": 8.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.21
  }
 ],
 "id": "overlay_26A504F3_30E7_84E1_41C5_7DA5917082B8",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 25)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.41,
   "image": "this.AnimatedImageResource_2B202272_30A8_BFE3_41C5_2CEA94BAEB52",
   "pitch": 3.21,
   "yaw": -22.61,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 108.76,
   "hfov": 12.19,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.72
  }
 ],
 "id": "overlay_26A4E4F3_30E7_84E1_41A7_103DD8B8CCF5",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE, this.camera_083E33DE_31A7_9409_41C4_6A9AEBA46B14); this.mainPlayList.set('selectedIndex', 23)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.19,
   "image": "this.AnimatedImageResource_2B206272_30A8_BFE3_41B0_AFBA618B609B",
   "pitch": 3.72,
   "yaw": 108.76,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 9.15,
   "hfov": 7.75,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 40.22
  }
 ],
 "id": "overlay_27EF7C44_30A7_8B20_41BB_FF09D496862C",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.75,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 245,
      "height": 222
     }
    ]
   },
   "pitch": 40.22,
   "yaw": 9.15
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -136.01,
   "hfov": 8.17,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 14.28
  }
 ],
 "id": "overlay_267A5FE9_30E8_84E1_41BE_2DB0D054754D",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 7)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.17,
   "image": "this.AnimatedImageResource_2B33E259_30A8_BF20_41BA_DF5520D1E42E",
   "pitch": 14.28,
   "yaw": -136.01,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -38.28,
   "hfov": 11.67,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 17.09
  }
 ],
 "id": "overlay_267A3FE9_30E8_84E1_41C4_CCB4F88BF4AF",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645, this.camera_046D2D17_31A7_8C06_41BC_40C70D71DEE4); this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 11.67,
   "image": "this.AnimatedImageResource_2B33D25D_30A8_BF20_41C7_8A4CEE75725D",
   "pitch": 17.09,
   "yaw": -38.28,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 59.27,
   "hfov": 10.88,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 22,
      "height": 15
     }
    ]
   },
   "pitch": 27.49
  }
 ],
 "id": "overlay_27A091A7_30E9_BD61_41A3_BA9DEFCE5F8C",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.88,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 296,
      "height": 214
     }
    ]
   },
   "pitch": 27.49,
   "yaw": 59.27
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -7.86,
   "hfov": 8.27,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 11.05
  }
 ],
 "id": "overlay_26B7FCF8_30F8_84EF_41BB_F3A9801A6CBA",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 27)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.27,
   "image": "this.AnimatedImageResource_2B21F27A_30A8_BFE3_41B4_3307C5602C7D",
   "pitch": 11.05,
   "yaw": -7.86,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 98.16,
   "hfov": 11.96,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 11.56
  }
 ],
 "id": "overlay_26B7ECF8_30F8_84EF_4185_0A968E55CD0E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12, this.camera_084B2390_31A7_9419_41C8_F85E3EB33E60); this.mainPlayList.set('selectedIndex', 25)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 11.96,
   "image": "this.AnimatedImageResource_2B22027A_30A8_BFE3_41C8_19BDDB7A43FF",
   "pitch": 11.56,
   "yaw": 98.16,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -8.87,
   "hfov": 6.61,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.48
  }
 ],
 "id": "overlay_24F77ACA_309B_8F23_41B7_62F458C7FFB3",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 6.61,
   "image": "this.AnimatedImageResource_2958EB03_3098_8D21_41B5_792B6A4A06CE",
   "pitch": 2.48,
   "yaw": -8.87,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 100.76,
   "hfov": 6.58,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.04
  }
 ],
 "id": "overlay_26C80C13_309B_8B20_419C_E0263E8AE081",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_092182FB_31A7_940E_41C1_2D241489BDD4); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 6.58,
   "image": "this.AnimatedImageResource_295F1B03_3098_8D21_418C_34C67E5A4F1C",
   "pitch": 6.04,
   "yaw": 100.76,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 88.65,
   "hfov": 5.99,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 25.37
  }
 ],
 "id": "overlay_26896712_3098_8523_41B4_692EB7132914",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_09D2D308_31A7_940A_41C7_8C3A5977FA7D); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.99,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 160,
      "height": 161
     }
    ]
   },
   "pitch": 25.37,
   "yaw": 88.65
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -39.51,
   "hfov": 11.27,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 23,
      "height": 16
     }
    ]
   },
   "pitch": 33.21
  }
 ],
 "id": "overlay_2604DA07_30E8_8F21_41C1_43DC0366C38F",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.27,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 325,
      "height": 222
     }
    ]
   },
   "pitch": 33.21,
   "yaw": -39.51
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -149.84,
   "hfov": 8.39,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.52
  }
 ],
 "id": "overlay_26886E07_30E9_8721_41BA_18F03DBAFC69",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518, this.camera_04AB5E6C_31A7_8C09_41BB_5FC00368C5C5); this.mainPlayList.set('selectedIndex', 11)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.39,
   "image": "this.AnimatedImageResource_2B28B25E_30A8_BF20_418E_2AB13646179A",
   "pitch": 5.52,
   "yaw": -149.84,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 3.54,
   "hfov": 12.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.14
  }
 ],
 "id": "overlay_26887E07_30E9_8720_41A5_46EB07FA4715",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9, this.camera_04BB2E4E_31A7_8C09_41BD_1D7DAF205EF7); this.mainPlayList.set('selectedIndex', 13)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.16,
   "image": "this.AnimatedImageResource_2B28C25E_30A8_BF20_41C6_E92DAE20E4E2",
   "pitch": 5.14,
   "yaw": 3.54,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -45.99,
   "hfov": 16.54,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 25,
      "height": 16
     }
    ]
   },
   "pitch": 17.83
  }
 ],
 "id": "overlay_2610B05A_30E8_BB20_41BD_A4B4620C1C7E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 16.54,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 420,
      "height": 266
     }
    ]
   },
   "pitch": 17.83,
   "yaw": -45.99
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -170.12,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.83
  }
 ],
 "id": "overlay_269B4CC0_30E9_8B1F_41A1_7F842371EC37",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD, this.camera_0BAC00BD_31A7_940B_41C2_D745D6510531); this.mainPlayList.set('selectedIndex', 9)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B37C25E_30A8_BF20_41B0_3BD0BA8E7D45",
   "pitch": 1.83,
   "yaw": -170.12,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 2.22,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.46
  }
 ],
 "id": "overlay_269B7CC0_30E9_8B1F_41C7_8773ECE7C968",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A, this.camera_0A5BD0DB_31A7_940F_41BA_69E9986B1F0B); this.mainPlayList.set('selectedIndex', 12)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B28025E_30A8_BF20_4199_C3C8659D8253",
   "pitch": 1.46,
   "yaw": 2.22,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 46.44,
   "hfov": 6.73,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 21
     }
    ]
   },
   "pitch": 33.21
  }
 ],
 "id": "overlay_298A6A67_30E8_8FE1_41AE_6F8E0E520EDF",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.73,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 194,
      "height": 266
     }
    ]
   },
   "pitch": 33.21,
   "yaw": 46.44
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 134.11,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.42
  }
 ],
 "id": "overlay_27FABC98_30F8_8B20_41C5_06BF088AE1D6",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18, this.camera_04624D29_31A7_8C0B_4185_D771871799E1); this.mainPlayList.set('selectedIndex', 28)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B247280_30A8_BF1F_41A8_4CC982B14C2A",
   "pitch": 1.42,
   "yaw": 134.11,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 90.72,
   "hfov": 12.14,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 18,
      "height": 16
     }
    ]
   },
   "pitch": 14.81
  }
 ],
 "id": "overlay_264A4A4C_30E9_8F20_41B5_F87A7A1DE62E",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_04D7CD90_31A7_8C19_41C4_94D91B7D91C9); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.14,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 303,
      "height": 259
     }
    ]
   },
   "pitch": 14.81,
   "yaw": 90.72
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -12.93,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.75
  }
 ],
 "id": "overlay_2682F3F1_30E8_9CE1_41A6_8DC38CBC9EEE",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9, this.camera_0422DD83_31A7_8CFF_41BE_F5621167C5CA); this.mainPlayList.set('selectedIndex', 13)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B298266_30A8_BFE0_41B4_728758C7D8D5",
   "pitch": 2.75,
   "yaw": -12.93,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 161.31,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0.49
  }
 ],
 "id": "overlay_2682D3F2_30E8_9CE3_41AA_CBA8E8419FC6",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B, this.camera_042F0D72_31A7_8C1E_41B1_89589F0797EB); this.mainPlayList.set('selectedIndex', 17)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B29C266_30A8_BFE0_41C7_508112D4CD4A",
   "pitch": 0.49,
   "yaw": 161.31,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 107.47,
   "hfov": 12.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -5
  }
 ],
 "id": "overlay_271DDD9C_30A8_8527_41B8_121EABC407CB",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C043534_306B_8567_419A_FBE63B7043D3, this.camera_0439DD63_31A7_8C3F_416F_60431C2873F8); this.mainPlayList.set('selectedIndex', 16)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.16,
   "image": "this.AnimatedImageResource_2B2A0266_30A8_BFE0_41B8_B6C7482F6CDD",
   "pitch": -5,
   "yaw": 107.47,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -1.26,
   "hfov": 6.62,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.06
  }
 ],
 "id": "overlay_261B20A9_3099_BB60_41BC_445487461CB1",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_040F1D46_31A7_8C79_41C2_F89FAB2B420C); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 6.62,
   "image": "this.AnimatedImageResource_2B3FE251_30A8_BF20_41C6_03AD0DA07FF2",
   "pitch": 1.06,
   "yaw": -1.26,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 155.87,
   "hfov": 6.61,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.24
  }
 ],
 "id": "overlay_27694314_3099_9D20_4187_08BB397D6F22",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851, this.camera_04189D38_31A7_8C0A_41C3_2E94732C514F); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 6.61,
   "image": "this.AnimatedImageResource_256F94F3_30A8_84E1_41C7_8A68AD0D8FCB",
   "pitch": 2.24,
   "yaw": 155.87,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 103.37,
   "hfov": 6.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 31.67
  }
 ],
 "id": "overlay_281CAA00_3098_8F1F_41AF_8575A6645148",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_0404ED54_31A7_8C19_41C8_EC7D90636DF3); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 190,
      "height": 197
     }
    ]
   },
   "pitch": 31.67,
   "yaw": 103.37
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -1.4,
   "hfov": 11.94,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 19,
      "height": 16
     }
    ]
   },
   "pitch": 13.32
  }
 ],
 "id": "overlay_26CE651A_30E9_8523_41C7_12D95D143A8C",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131, this.camera_0A4DC0F8_31A7_9409_41C6_694F30EBD74C); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.94,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 296,
      "height": 243
     }
    ]
   },
   "pitch": 13.32,
   "yaw": -1.4
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -153.52,
   "hfov": 8.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.86
  }
 ],
 "id": "overlay_26DD1DB1_30F8_8561_41B0_CBDB593D41BD",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3C8320B0_3068_7B60_419F_1E41F8997A12, this.camera_0A7D911B_31A7_940F_41BE_2ADFD6975EE8); this.mainPlayList.set('selectedIndex', 25)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.42,
   "image": "this.AnimatedImageResource_2B22B27A_30A8_BFE3_41B5_71563051641B",
   "pitch": -1.86,
   "yaw": -153.52,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 11.72,
   "hfov": 12.21,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0.78
  }
 ],
 "id": "overlay_26DD7DB1_30F8_8561_41C1_E5EE2C777522",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18, this.camera_0A6F2139_31A7_940B_41C8_2B8282EBBD56); this.mainPlayList.set('selectedIndex', 28)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 12.21,
   "image": "this.AnimatedImageResource_2B23227A_30A8_BFE3_41B1_E5670289C6BC",
   "pitch": 0.78,
   "yaw": 11.72,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 86.26,
   "hfov": 7.69,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 30.16
  }
 ],
 "id": "overlay_26F9951A_3098_8523_41C4_D249D09D57A1",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.69,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 215,
      "height": 210
     }
    ]
   },
   "pitch": 30.16,
   "yaw": 86.26
  }
 ],
 "data": {
  "label": "Image"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -35.52,
   "hfov": 8.33,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 8.74
  }
 ],
 "id": "overlay_26A50369_30EB_9DE1_41C2_AEE36233F1F5",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 8.33,
   "image": "this.AnimatedImageResource_2B31D251_30A8_BF20_41C3_1EF93E21F998",
   "pitch": 8.74,
   "yaw": -35.52,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Left-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 57.13,
   "hfov": 11.92,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 12.48
  }
 ],
 "id": "overlay_26A4F36A_30EB_9DE3_41C8_25195817EED0",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_3CEF5904_3069_8D27_41A6_D98E21038851, this.camera_0A00C197_31A7_9406_41C3_DFB824B614D8); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "hfov": 11.92,
   "image": "this.AnimatedImageResource_2B320251_30A8_BF20_41C5_3C58AD41BD12",
   "pitch": 12.48,
   "yaw": 57.13,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 03 Right-Up"
 },
 "enabledInCardboard": true
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2FF272_30A8_BFE3_41B8_CF6904BC0C85",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CECC6BD_306B_8761_41C6_6907CE84A298_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B202272_30A8_BFE3_418C_74B2DC72F7E6",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B36225E_30A8_BF20_416A_766A29C50E52",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B36625E_30A8_BF20_41A2_19231D8BD9BA",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C15132A_3068_BD63_41C6_BEC386A79EAD_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B36A25E_30A8_BF20_41C1_29D7CDAE9A21",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2DE26F_30A8_BFE0_41B8_23AD88966732",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2E326F_30A8_BFFE_41C3_D3A42FA2BD01",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C003B3E_306B_8D63_41C7_B1C38022B172_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2E7272_30A8_BFE3_41AF_830851153B02",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2CC26F_30A8_BFE1_41B3_A4893223E4DD",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CCAADB2_306B_8563_41A7_ADDC0F2668CD_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2D626F_30A8_BFE1_41A8_9495D7D23B7E",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_1B49CAB4_3198_741A_419E_1D9CF9E18FD4",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CC9C076_306B_BBE3_41A1_B70D4E5DEA2B_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_1B567AB4_3198_741A_41AC_F47BF386A9DF",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B20F27A_30A8_BFE3_41C0_911E2F224DB1",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_0711AD98_31B8_8C09_41B8_09437AA0623F",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C8320B0_3068_7B60_419F_1E41F8997A12_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_07104D99_31B8_8C0B_41B6_5BB5A4B4E193",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2AA266_30A8_BFE0_4196_BF21392F8E00",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C043534_306B_8567_419A_FBE63B7043D3_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2AC266_30A8_BFE0_41AD_A1A473AD5B4A",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2EE272_30A8_BFE3_4192_4A75B873ED7C",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2F3272_30A8_BFE3_41C3_340FB8E2D3D7",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CE4B8E5_306B_8CE0_41C4_0A7F4E69836A_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2F7272_30A8_BFE3_41B3_10AE5AA932AE",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B37025E_30A8_BF20_41AE_B4A683A15A7B",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C36216C_3068_9DE0_41C5_228DB51DC855_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B37425E_30A8_BF20_41B3_34E621688162",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2B626E_30A8_BFE3_41BE_24E983FF1814",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CC8E2C9_306B_9F21_417A_25CEFABC027B_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2B926E_30A8_BFE3_419E_B9BE18D4A164",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B309251_30A8_BF20_41C0_BC814EF1C7EC",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B312251_30A8_BF20_41B9_2867FF944FC9",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CEF5904_3069_8D27_41A6_D98E21038851_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B317251_30A8_BF20_41C2_7A9D6458F7FA",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B34A25D_30A8_BF20_41B1_71FF79169893",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CA1A4C2_3068_7B23_41C7_3F2444E616C3_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_1B40CAAE_3198_7406_41A4_FE163BEEB774",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B20A272_30A8_BFE3_41C4_3B19C016771A",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_0713FD96_31B8_8C19_419F_5BEE2C91812C",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C0B74F8_306B_84EF_416C_DE714B725DDE_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2FA272_30A8_BFE3_41C1_A8FEF53917D6",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 520,
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2400176A_306B_85E0_41A1_191BC4FF3D35",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 62,
 "levels": [
  {
   "url": "media/panorama_3CCBE3B5_3069_9D61_41B1_CC79B35BD131_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 330,
   "height": 180
  }
 ],
 "rowCount": 3,
 "frameCount": 9,
 "id": "AnimatedImageResource_2402D76B_306B_85E0_41BF_74433629CB8E",
 "colCount": 3
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B23827F_30A8_BFE1_41C1_923050ACECED",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CE21CFD_3068_84E0_41C2_E1BF3722FA18_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B23F27F_30A8_BFE1_41AD_C30B55468893",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B29725E_30A8_BF20_41C3_86DF4F3BE490",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B29825E_30A8_BF20_41B4_9724A9B7F5EE",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C215B42_3068_8D23_41B7_98C4EAE458C9_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B286266_30A8_BFE0_41B1_24DA759CDD82",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B32E251_30A8_BF28_4192_B44F4C0D4B7A",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B332259_30A8_BF20_41C2_12BE38148864",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C3F379F_3069_8521_41B9_E6D3F1F45645_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B336259_30A8_BF20_41B6_3FF42EFF21B7",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B35125D_30A8_BF20_419C_5E81600BF443",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CF95556_3068_8523_41C4_8925C9D07856_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_1B418AAE_3198_7406_41A5_4B3FBCA0499E",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B289266_30A8_BFE0_41A6_378739569282",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CD098E4_3068_8CE0_41A4_89AE91EA8E84_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B292266_30A8_BFE0_41BF_0AB6280415AE",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B202272_30A8_BFE3_41C5_2CEA94BAEB52",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C2282C2_306B_9F20_41A9_F23A5D48A28A_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B206272_30A8_BFE3_41B0_AFBA618B609B",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B33E259_30A8_BF20_41BA_DF5520D1E42E",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C3DD675_3069_87E0_41B6_CCA6079A3B27_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B33D25D_30A8_BF20_41C7_8A4CEE75725D",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B21F27A_30A8_BFE3_41B4_3307C5602C7D",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C563F63_3068_85E1_41BB_3BC12CE75AFC_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B22027A_30A8_BFE3_41C8_19BDDB7A43FF",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2958EB03_3098_8D21_41B5_792B6A4A06CE",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CF38C7A_3069_8BE3_4191_61895A0D9192_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_295F1B03_3098_8D21_418C_34C67E5A4F1C",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B28B25E_30A8_BF20_418E_2AB13646179A",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C177D79_3068_85E0_41C0_13C53EB4EE1A_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B28C25E_30A8_BF20_41C6_E92DAE20E4E2",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B37C25E_30A8_BF20_41B0_3BD0BA8E7D45",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C00FFC7_3068_8521_41A5_CF6741D8D518_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B28025E_30A8_BF20_4199_C3C8659D8253",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C107B0C_3068_8D27_41B2_6A4FBA389C33_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B247280_30A8_BF1F_41A8_4CC982B14C2A",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B298266_30A8_BFE0_41B4_728758C7D8D5",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B29C266_30A8_BFE0_41C7_508112D4CD4A",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3CFDB69D_3068_8720_41C7_ED9828E1CDE3_0_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B2A0266_30A8_BFE0_41B8_B6C7482F6CDD",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B3FE251_30A8_BF20_41C6_03AD0DA07FF2",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C18EAC3_3069_8F21_4189_153B6C6997D5_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_256F94F3_30A8_84E1_41C7_8A68AD0D8FCB",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B22B27A_30A8_BFE3_41B5_71563051641B",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C20DF7F_3068_85E1_41B6_4F3487DC8543_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B23227A_30A8_BFE3_41B1_E5670289C6BC",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B31D251_30A8_BF20_41C3_1EF93E21F998",
 "colCount": 4
},
{
 "class": "AnimatedImageResource",
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_3C375952_3069_8D23_418B_CCCE355F3AB0_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 640,
   "height": 960
  }
 ],
 "rowCount": 6,
 "frameCount": 24,
 "id": "AnimatedImageResource_2B320251_30A8_BF20_41C5_3C58AD41BD12",
 "colCount": 4
}],
 "overflow": "visible",
 "data": {
  "name": "Player1149"
 },
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "shadow": false
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
