function saveOptions() {
  chrome.storage.sync.get({
    name: '',
    phone: '',
  }, data => {
    const name = document.getElementById('name').value
    const phone = document.getElementById('phone').value
    // do not save the same values
    if (name == data.name && phone == data.phone) {
      return
    }

    chrome.storage.sync.set({
      name,
      phone,
    }, () => {
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
  chrome.storage.sync.get({
    name: '',
    phone: '',
  }, data => {
    const name = document.getElementById('name')
    name.value = data.name
    name.addEventListener('input', deferSave)
    name.addEventListener('change', deferSave)

    const phone = document.getElementById('phone')
    phone.value = data.phone
    phone.addEventListener('input', deferSave)
    phone.addEventListener('change', deferSave)
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
