(async function(window) {
  "use strict";

  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  function getCardInput() {
    return document.querySelector('[placeholder="Номер с обратной стороны карты"]')
  }

  function getNameInput() {
    const nameLabel = getElementByXpath('//label[text()="Имя заказчика *"]')
    if (!nameLabel || !nameLabel.nextElementSibling) {
      return
    }
    return nameLabel.nextElementSibling
  }

  function getPhoneInput() {
    const phoneLabel = getElementByXpath('//label[text()="Телефон для СМС-уведомлений *"]')
    if (!phoneLabel || !phoneLabel.nextElementSibling) {
      return
    }
    return phoneLabel.nextElementSibling
  }

  function getSubscriptionInput() {
    const subscriptionLabel = getElementByXpath('//div[text()="Подписаться на рассылку"]')
    if (!subscriptionLabel || !subscriptionLabel.parentNode.previousElementSibling) {
      return
    }
    return subscriptionLabel.parentNode.previousElementSibling
  }

  async function getUserOptions() {
    return new Promise(resolve => {
      chrome.storage.sync.get({
        name: '',
        phone: '',
        card: '',
      }, resolve)
    })
  }

  async function fillCardInfo() {
    const cardInput = getCardInput()
    if (cardInput && !cardInput.value) {
      const userOptions = await getUserOptions()
      if (userOptions.card) {
        // format card number to make it appropriate
        const card = userOptions.card.replace(/\D/g, '').replace(/(.{4})/g," $1").trim()
        await window.emulateInput(cardInput, card, { inputMask: ' '.repeat(19) })
      }
    }
  }

  async function fillContactInfo() {
    const nameInput = getNameInput()
    if (!nameInput) {
      window.toast('warning', 'cannot find name input')
      return
    }

    const userOptions = await getUserOptions()
    if (userOptions.name) {
      await window.emulateInput(nameInput, userOptions.name)
    }

    const phoneInput = getPhoneInput()
    if (!phoneInput) {
      window.toast('warning', 'cannot find phone input')
      return
    }

    if (userOptions.phone) {
      // replace all non-digit and retrieve only 10 digits
      const phone = userOptions.phone.replace(/\D/g, '').slice(-10)
      await window.emulateInput(phoneInput, phone, { inputMask: '+7 ___ ___-__-__', maskSymbol: '_' })
    }

    const subscriptionInput = getSubscriptionInput()
    if (!subscriptionInput) {
      window.toast('warning', 'cannot find subscription input')
      return
    }

    await window.emulateInput(subscriptionInput, false)
    return true
  }

  // watch for fields presented, fill once contact info displayed
  const timerId = setInterval(async () => {
    const nameInput = getNameInput()
    if (!nameInput) {
      await fillCardInfo()
      return
    }

    clearInterval(timerId)

    if (nameInput.value) {
      window.toast('success', 'contact info already filled')
      return
    }

    window.toast('info', 'contact info filling start')
    if (await fillContactInfo()) {
      window.toast('success', 'contact info filled')
    } else {
      window.toast('error', 'contact info filling failed')
    }
  }, 333)
})(window)
