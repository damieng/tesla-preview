'use strict';

const optionIds = [ 'paint', 'wheels', 'roof', 'seats', 'decor', 'headliner', 'brakes' ]
function $(id) {return document.getElementById(id) }
const allImages = $('visual').getElementsByTagName('img')
const single = $('single')
const model = $('model')
setAttributes(allImages, 'onload', () => this.style.opacity = 1)

captureChanges()
setModel()
updateUrl()

function captureChanges() {
  model.onchange = setModel
  $('options').onchange = updateUrl
}

function setModel() {
  setVisibility(document.getElementsByClassName('m3'), false);
  setVisibility(document.getElementsByClassName('ms'), false);
  setVisibility(document.getElementsByClassName(model.value), true);

  switch(model.value) {
    case 'm3': {
      $('paint').value = 'PPSB';
      if ($('background').value === '0') {
        $('background').value = 1;
      };
      break;
    }
    case 'ms': {
      $('paint').value = 'COL2-PPSB,MI01';
      break;
    }
  }
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
    "model": model.value,
    "size": 2048,
    "options": buildOptions()
  }
  parts.bkba_opt = $('background').value
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
  return optionIds.map(id => $(id).value).filter(v => v != null && v != '')
}