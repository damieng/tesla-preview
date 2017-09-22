'use strict';

const optionIds = [ 'paint', 'wheels', 'roof', 'seats', 'seating', 'decor', 'headliner', 'brakes' ]
function $(id) {return document.getElementById(id) }
const allImages = $('visual').getElementsByTagName('img')
const single = $('single')
const model = $('model')
const view = $('view')
//setAttributes(allImages, 'onload', "this.style.opacity = 1")

captureChanges()
setModel()
updateUrl()

function captureChanges() {
  model.onchange = setModel
  $('options').onchange = updateUrl
}

function deselectUnavailableOptions() {
  const allSelects = document.getElementsByTagName('select')
  for (var i = 0; i < allSelects.length; i++) {
    const select = allSelects[i];
    if (select.selectedIndex >= 0) {
      const selected = select.options[select.selectedIndex];
      if (isUnavailable(selected)) {
        for (var j = 0; j < select.options.length; j++) {
          if (!isUnavailable(select.options[j])) {
            select.selectedIndex = j;
            break;
          }
        }
      }
    }
  }
}

function isUnavailable(element) {
  return [element, element.parentNode, element.parentNode.parentNode, element.parentNode.parentNode].find(p => p.style.display === 'none') != null;
}

function setModel() {
  setVisibility(document.getElementsByClassName('m3'), false);
  setVisibility(document.getElementsByClassName('ms'), false);
  setVisibility(document.getElementsByClassName('mx'), false);
  setVisibility(document.getElementsByClassName('ms-2012'), false);
  setVisibility(document.getElementsByClassName('ms-2016'), false);

  switch (model.value) {
    case 'm3': {
      setVisibility(document.getElementsByClassName('m3'), true);
      if ($('background').value === '0') {
        $('background').value = 1;
      };
      break;
    }
    case 'ms-2012': {
      setVisibility(document.getElementsByClassName('ms'), true);
      setVisibility(document.getElementsByClassName('ms-2012'), true);
      break;
    }
    case 'ms-2016': {
      setVisibility(document.getElementsByClassName('ms'), true);
      setVisibility(document.getElementsByClassName('ms-2016'), true);
      break;
    }
    case 'mx': {
      setVisibility(document.getElementsByClassName('mx'), true);
      break;
    }
  }

  deselectUnavailableOptions()
}

function setVisibility(elements, visible) {
  if (visible)
    for (var i = 0; i < elements.length; i++)
      elements[i].style.display = ''
    else
      for (var i = 0; i < elements.length; i++)
        elements[i].style.display = 'none'
}

function updateUrl() {
  setAttributes(allImages, 'style.opacity', 0.5)
  const view = $('view').value
  switch (view) {
    default: {
      single.hidden = false
      single.src = buildUrl(buildParts(), { "view": view })
    }
  }
}

function setImageSources(container, url) {
  const elements = container.getElementsByTagName('img')
  for (var i = 0; i < elements.length; i++)
    elements[i].setAttribute('src', url + elements[i].getAttribute('data-suffix'))
}

function setAttributes(elements, attr, value) {
  for (var i = 0; i < elements.length; i++)
    elements[i].setAttribute(attr, value)
}

function buildParts() {
  const parts = {
    "model": model.value.split('-')[0],
    "size": 2048,
    "options": buildOptions()
  }

  parts.bkba_opt = $('background').value
  if ($('model').value === 'ms-2016') parts.options += ',MI01'
  if ($('rearspoiler').checked) parts.options += ',X019'
  return parts
}

function buildUrl(parts, extras) {
  const combined = { }
  Object.assign(combined, parts, extras)
  const params = Object.entries(combined).map(kv => `${kv[0]}=${kv[1]}`).join('&')
  return `https://www.tesla.com/configurator/compositor/?${params}`
}

function buildOptions() {
  return optionIds.map(id => $(id)).filter(e => !isUnavailable(e)).map(e => e.value).filter(v => v != null && v != '')
}
