(function() {
  'use strict';
  var storage,addSourceBtn,addSource,sourceName,sourceURL,
  customSourceContainer, saveSourcesBtn, saveSources, loadSources,
  removeBtn, removeSource;

  storage = chrome.storage.local;
  addSourceBtn = document.querySelector('.add-button');
  saveSourcesBtn = document.querySelector('.submit');
  customSourceContainer = document.querySelector('.custom-sources');

  loadSources = function() {
    /**
     * Standard sources
     */
    storage.get('news_sources', function(obj) {
      if( Object.keys(obj).length !== 0 ) {
        obj.news_sources.forEach( function(v) {
          document.querySelector('input[value="' + v + '"]').checked = true;
        });
      }
    });

    /**
     * Custom sources
     */
    storage.get('custom_sources', function(obj) {
      var output;
      if( Object.keys(obj).length !== 0 ) {
        obj.custom_sources.forEach( function(v) {
          output = document.createElement("div");
          output.className = 'custom-source';
          output.innerHTML = '<span class="source-name">' + v.name + '</span>' + '<span class="source-url">' + v.url + '</span><img class="remove-button" src="assets/close.svg" />';
          document.querySelector('.no-custom-sources').remove();
          customSourceContainer.appendChild(output);
        });
      }
    });

    setTimeout( function() {
      if( document.querySelector('.remove-button') ) {
        var deletes = document.querySelectorAll('.remove-button');
        for (var i = 0; i < deletes.length; i++) {
          deletes[i].addEventListener('click', removeSource);
        }
      }
    }, 1000 );
  }

  document.addEventListener('DOMContentLoaded', loadSources );

  function validateURL( val ) {
    var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    if(!regex.test(val)) {
      return false;
    } else {
      return true;
    }
    
  }

  removeSource = function() {
    var customSources;
    this.parentNode.remove();
    customSources = document.querySelectorAll('.custom-source');

    var saved = [];

    for (var i=0; i < customSources.length; i++) {
      var n,s;
      var r = {};
      r.name = customSources[i].querySelector('.source-name').innerHTML;
      r.url = customSources[i].querySelector('.source-url').innerHTML;;
      saved.push(r);
    }

    storage.set({'custom_sources': saved }, function() {

    });
  }

  addSource = function() {
    var output, customSources, saved, msg;
    sourceName = document.getElementById('new-source-name').value;
    sourceURL = document.getElementById('new-source-url').value;

    if( sourceName.length < 1 ) {
      return false;
    }

    if( !validateURL( sourceURL ) ) {
      return false;
    }

    output = document.createElement("div");
    output.className = 'custom-source';
    output.innerHTML = '<span class="source-name">' + sourceName + '</span>' + '<span class="source-url">' + sourceURL + '</span><img class="remove-button" src="assets/close.svg" />';

    customSourceContainer.appendChild(output);

    msg = document.querySelector('.no-custom-sources');

    if( msg) {
      msg.remove();
    }

    customSources = document.querySelectorAll('.custom-source');

    saved = [];

    for (var i=0; i < customSources.length; i++) {
      var n,s;
      var r = {};
      r.name = customSources[i].querySelector('.source-name').innerHTML;
      r.url = customSources[i].querySelector('.source-url').innerHTML;;
      saved.push(r);
    }

    storage.set({'custom_sources': saved }, function() {
      document.getElementById('new-source-name').value = '';
      document.getElementById('new-source-url').value = '';
      var deletes = document.querySelectorAll('.remove-button');
      for (var i = 0; i < deletes.length; i++) {
        deletes[i].addEventListener('click', removeSource);
      }
    });
  }

  saveSources = function() {
    var checkboxes, checked;
    checkboxes = document.querySelectorAll('.checkbox');
    checked = [];
    for (var i=0; i < checkboxes.length; i++) {
       if (checkboxes[i].checked) {
          checked.push(checkboxes[i].value);
       }
    }

    storage.set({'news_sources': checked }, function() {
      saveSourcesBtn.innerText = 'Saved!';
      setTimeout( function() {
        saveSourcesBtn.innerText = 'Save';
      }, 2000 );
    });
  }

  addSourceBtn.addEventListener('click', addSource);
  saveSourcesBtn.addEventListener('click', saveSources);

})();