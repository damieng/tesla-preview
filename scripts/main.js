'use strict'

const byId = id => document.getElementById(id)
const byTag = tag => document.getElementsByTagName(tag)
const byClass = className => document.getElementsByClassName(className)

const optionIds = ['paint', 'wheels', 'roof', 'drive', 'seats', 'seating', 'console', 'decor', 'headliner', 'brakes', 'rd-seat-type', 'rd-seat-color', 'rd-accent-color']

const allImages = byId('visual').getElementsByTagName('img')
const single = byId('single')
const model = byId('model')
const view = byId('view')
const ms2012showroomOnly = ['STUD_ABOV', 'STUD_SEAT_DRIVER', 'STUD_SEAT_3QTR', 'OUT1_3QTR', 'STUD_SEAT']
const ms2012notTransparent = ['STUD_3QTR', 'STUD_REAR', 'STUD_SEAT_ABOVE']

if (document.referrer.includes('roadster')) {
  model.value = 'rd'
}


setAttributes(allImages, 'onload', "this.classList.remove('loading')")
captureChanges()
setModel()
setBackgroundOptions()
updateUrl()

function captureChanges() {
  model.onchange = () => { setModel(); setBackgroundOptions(); }
  view.onchange = setBackgroundOptions
  window.onresize = updateUrl
  byId('options').onchange = optionsChanged
}

function optionsChanged() {
  switch (model.value) {
    case 'rd': {
      setVisibility([byId('rd-accent')], !(['INT2', 'INT4'].includes(byId('rd-seat-type').value)))
      break;
    }
  }
  updateUrl()
}

function deselectUnavailableOptions() {
  const allSelects = byTag('select')
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
  setVisibility(byClass('m3'), false)
  setVisibility(byClass('rd'), false)
  setVisibility(byClass('ms'), false)
  setVisibility(byClass('mx'), false)
  setVisibility(byClass('ms-2012'), false)
  setVisibility(byClass('ms-2016'), false)

  switch (model.value) {
    case 'm3': {
      setVisibility(byClass('m3'), true)
      break
    }
    case 'rd': {
      setVisibility(byClass('rd'), true)
      break
    }
    case 'ms-2012': {
      setVisibility(byClass('ms'), true)
      setVisibility(byClass('ms-2012'), true)
      break
    }
    case 'ms-2016': {
      setVisibility(byClass('ms'), true)
      setVisibility(byClass('ms-2016'), true)
      break
    }
    case 'mx': {
      setVisibility(byClass('mx'), true)
      break
    }
  }

  deselectUnavailableOptions()
}

function setBackgroundOptions() {
  setVisibility([background], model.value !== 'm3' && model.value !== 'rd')
  setVisibility(background.options, true)
  if (view.value === 'STUD_SEAT' || view.value === 'STUD_SEAT_ALTA') {
    setVisibility([background], false)
  }

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
  for (var i = 0; i < elements.length; i++) {
    const element = elements[i]
    element.style.display = visible ? '' : 'none'
    element.disabled = visible ? '' : 'disabled'
  }
}

function updateUrl() {
  Array.from(allImages).forEach(i => i.classList.add('loading'))
  const parts = buildParts()
  switch (view.value) {
    default: {
      single.hidden = false
      single.src = buildUrl(parts, { "view": view.value, "size": getWidth(single) })
      single.title = parts.options.join(',')
    }
  }
}

function getWidth(element) {
  return element.width === 0 ? window.innerWidth : element.width
}

function setAttributes(elements, attr, value) {
  for (var i = 0; i < elements.length; i++)
    elements[i].setAttribute(attr, value)
}

function buildParts() {
  const parts = {
    "model": model.value.split('-')[0],
    "options": buildOptions()
  }

  if (model.value === 'm3') {
    parts.bkba_opt = byId('background-m3').value
  } else {
    if (!isUnavailable(background.options[background.selectedIndex]))
      parts.bkba_opt = background.value
  }

  if (model.value === 'rd') {
    parts.options.push([
      byId('rd-seat-type').value,
      byId('rd-seat-color').value,
      byId('rd-accent-color').value
    ].join('.'))
  }

  if (model.value === 'ms-2016') parts.options.push('MI01')
  if (byId('rearspoiler').checked) parts.options.push('X019')
  if (byId('carbonkit').checked) parts.options.push('EXT1')
  if (byId('sport').checked) parts.options.push('RS1')
  return parts
}

function buildUrl(parts, extras) {
  const combined = { }
  Object.assign(combined, parts, extras)
  const params = Object.entries(combined).map(kv => `${kv[0]}=${kv[1]}`).join('&')
  return `https://www.tesla.com/configurator/compositor/?${params}`
}

function buildOptions() {
  return optionIds.filter(id => !id.includes('-')).map(id => byId(id)).filter(e => !isUnavailable(e)).map(e => e.value).filter(v => v != null && v != '')
}
