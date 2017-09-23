'use strict'

const optionIds = [ 'paint', 'wheels', 'roof', 'drive', 'seats', 'seating', 'console', 'decor', 'headliner', 'brakes' ]
function $(id) {return document.getElementById(id) }
const allImages = $('visual').getElementsByTagName('img')
const single = $('single')
const model = $('model')
const view = $('view')
const ms2012showroomOnly = ['STUD_ABOV', 'STUD_SEAT_DRIVER', 'STUD_SEAT_3QTR', 'OUT1_3QTR', 'STUD_SEAT']
const ms2012notTransparent = ['STUD_3QTR', 'STUD_REAR', 'STUD_SEAT_ABOVE']

setAttributes(allImages, 'onload', "this.style.opacity = 1")

captureChanges()
setModel()
setBackgroundOptions()
updateUrl()

function captureChanges() {
  model.onchange = () => { setModel(); setBackgroundOptions(); }
  $('options').onchange = updateUrl
  $('view').onchange = setBackgroundOptions
}

function deselectUnavailableOptions() {
  const allSelects = document.getElementsByTagName('select')
  for (var i = 0; i < allSelects.length; i++) {
    const select = allSelects[i]
    if (select.selectedIndex >= 0) {
      const selected = select.options[select.selectedIndex];
      if (isUnavailable(selected)) {
        for (var j = 0; j < select.options.length; j++) {
          if (!isUnavailable(select.options[j])) {
            select.selectedIndex = j
            break
          }
        }
      }
    }
  }
}

function isUnavailable(element) {
  return [element, element.parentNode, element.parentNode.parentNode, element.parentNode.parentNode].find(p => p.style.display === 'none') != null
}

function setModel() {
  setVisibility(document.getElementsByClassName('m3'), false)
  setVisibility(document.getElementsByClassName('ms'), false)
  setVisibility(document.getElementsByClassName('mx'), false)
  setVisibility(document.getElementsByClassName('ms-2012'), false)
  setVisibility(document.getElementsByClassName('ms-2016'), false)

  switch (model.value) {
    case 'm3': {
      setVisibility(document.getElementsByClassName('m3'), true)
      break
    }
    case 'ms-2012': {
      setVisibility(document.getElementsByClassName('ms'), true)
      setVisibility(document.getElementsByClassName('ms-2012'), true)
      break
    }
    case 'ms-2016': {
      setVisibility(document.getElementsByClassName('ms'), true)
      setVisibility(document.getElementsByClassName('ms-2016'), true)
      break
    }
    case 'mx': {
      setVisibility(document.getElementsByClassName('mx'), true)
      break
    }
  }

  deselectUnavailableOptions()
}

function setBackgroundOptions() {
  setVisibility(background, model.value !== 'm3')
  setVisibility(background.options, true)
  switch (model.value) {
    case 'ms-2012': return setBackgroundOptionsForMs2012()
    case 'ms-2016': return setBackgroundOptionsForMs2016()
  }
}

function setBackgroundOptionsForMs2012() {
  if (ms2012showroomOnly.includes(view.value)) {
    setVisibility([background], false)
  }
  if (ms2012notTransparent.includes(view.value)) {
    setVisibility([background.options[1]], false)
    if (background.selectedIndex === 1) {
      background.selectedIndex = 2
    }
  }
}

function setBackgroundOptionsForMs2016() {
  if (view.value === 'STUD_SEAT_ABOVE') {
    setVisibility([background.options[1]], false)
    if (background.selectedIndex === 1) {
      background.selectedIndex = 2
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
  setAttributes(allImages, 'style', 'opacity:0.5')
  const view = $('view').value
  const parts = buildParts()
  switch (view) {
    default: {
      single.hidden = false
      single.src = buildUrl(parts, { "view": view })
      single.title = parts.options.join(',')
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

  if (model.value === 'm3') {
    parts.bkba_opt = $('background-m3').value
  } else {
    if (!isUnavailable(background.options[background.selectedIndex]))
      parts.bkba_opt = background.value
  }

  if (model.value === 'ms-2016') parts.options.push('MI01')
  if ($('rearspoiler').checked) parts.options.push('X019')
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
