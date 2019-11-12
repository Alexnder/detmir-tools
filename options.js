const optionNames = ['name', 'phone', 'card']
const initialOptions = optionNames.reduce((acc, o) => { acc[o] = ''; return acc }, {})

function saveOptions() {
  chrome.storage.sync.get(initialOptions, storedOptions => {
    const options = optionNames.reduce((acc, name) => {
      acc[name] = document.getElementById(name).value
      return acc
    }, {})
    // do not save the same values
    if (optionNames.every(name => options[name] == storedOptions[name])) {
      return
    }

    chrome.storage.sync.set(options, () => {
      chrome.runtime.sendMessage({
        msg: 'options-updated',
      })
      const successMessage = document.getElementById('success-save-message')
      successMessage.style.display = 'block'
      setTimeout(() => {
        successMessage.style.display = 'none'
      }, 1250)
    })
  })
}

let timerId
function deferSave() {
  clearTimeout(timerId)
  timerId = setTimeout(saveOptions, 750)
}

function restoreOptions() {
  chrome.storage.sync.get(initialOptions, storedOptions => {
    for (let name in storedOptions) {
      const input = document.getElementById(name)
      input.value = storedOptions[name]
      input.addEventListener('input', deferSave)
      input.addEventListener('change', deferSave)
    }
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
