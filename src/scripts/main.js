'use strict';

const optionIds = [ 'paint', 'wheels', 'roof', 'seats', 'decor', 'headliner', 'brakes' ]
function $(id) {return document.getElementById(id) }
const preview = $('preview')
preview.onload = () => preview.style.opacity = 1

captureChanges()
updateUrl()

function captureChanges() {
  $('options').onchange = updateUrl
}

function updateUrl() {
  preview.style.opacity = 0.5
  preview.src = buildUrl()
}

function buildUrl() {
  const parts = {
    "model": "ms",
    "view": $('view').value,
    "size": 2048,
    "options": buildOptions(),
  }
  if ($('transparent').checked) parts.bkba_opt = 2
  if ($('rearspoiler').checked) parts.options += ',X019'
  const params = Object.entries(parts).map(kv => `${kv[0]}=${kv[1]}`).join('&')
  return `https://www.tesla.com/configurator/compositor/?${params}`
}

function buildOptions() {
  return optionIds.map(id => $(id).value).filter(v => v != null && v != '')
}
