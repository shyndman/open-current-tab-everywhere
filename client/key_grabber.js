function consumeKeydown(e) {
  var target = e.target;
  if (target.tagName == 'TEXTAREA' ||
      target.tagName == 'SELECT' ||
      (target.tagName == 'INPUT' &&
        (target.type == '' || target.type.toUpperCase() == 'TEXT' ||
          target.type.toUpperCase() == 'PASSWORD' ||
          target.type.toUpperCase() == 'SEARCH'))) {
    return;
  }
    
  if ((!e.metaKey && !e.ctrlKey) || !e.shiftKey || e.keyCode != 80) {
    return;
  }
  
  // Send a request to the background page
  chrome.extension.sendRequest({cmd: "poke"});
}

window.addEventListener('keydown', consumeKeydown, true);