(function(window) {
  "use strict";

  const rusLayoutMap = {
    "q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш","o":"щ",
    "p":"з","[":"х","{":"Х","]":"ъ","}":"Ъ","|":"/","`":"ё","~":"Ё","a":"ф",
    "s":"ы","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л","l":"д",";":"ж",
    ":":"Ж","'":"э","\"":"Э","z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т",
    "m":"ь",",":"б","<":"Б",".":"ю",">":"Ю","/":".","?":",","@":"\"","#":"№",
    "$":";","^":":","&":"?",
  }

  function getKeyCode(char) {
    if (/\d+/.test(char)) {
      return `Digit${char}`
    }

    const enChar = Object.keys(rusLayoutMap).find(enKey => new RegExp(rusLayoutMap[enKey], 'i').test(char))
    if (!enChar) {
      if (Object.keys(rusLayoutMap).find(enKey => new RegExp(enKey, 'i').test(char))) {
        return `Key${char.toUpperCase()}`
      }
    }
    return `Key${enChar.toUpperCase()}`
  }

  async function emulateLetterInput(el, key, options = {}) {
    const code = getKeyCode(key)
    if (!code) {
      console.log('cannot found', code)
    }
    const keyCode = key.charCodeAt()
    const shiftKey = key == key.toUpperCase()

    if (shiftKey) {
      el.dispatchEvent(new KeyboardEvent('keydown', {
        view: window,
        bubbles: true,
        cancelable: true,
        shiftKey: true,
        key: 'Shift',
        code: 'ShiftLeft',
        location: 1,
        keyCode: 16,
        charCode: 0,
        which: 16,
      }))
      await new Promise(r => setTimeout(r, 10))
    }

    el.dispatchEvent(new KeyboardEvent('keydown', {
      view: window,
      bubbles: true,
      cancelable: true,
      shiftKey,
      key,
      code,
      keyCode,
      charCode: 0,
      which: keyCode,
    }))

    el.dispatchEvent(new KeyboardEvent('keypress', {
      view: window,
      bubbles: true,
      cancelable: true,
      shiftKey,
      key,
      code,
      keyCode,
      charCode: keyCode,
      which: keyCode,
    }))
    await new Promise(r => setTimeout(r))

    const lastValue = el.value
    if (options.inputMask) {
      el.value = el.value.replace(options.maskSymbol, key)
    } else {
      el.value += key
    }
    if (el._valueTracker) {
      el._valueTracker.setValue(lastValue)
    }
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: false,
      composed: true,
      data: key,
      inputType: 'insertText',
    }))
    await new Promise(r => setTimeout(r, 10))

    el.dispatchEvent(new KeyboardEvent('keyup', {
      view: window,
      bubbles: true,
      cancelable: true,
      key,
      code,
      keyCode,
      charCode: 0,
      which: keyCode,
    }))
    await new Promise(r => setTimeout(r, 15))

    if (shiftKey) {
      el.dispatchEvent(new KeyboardEvent('keyup', {
        view: window,
        bubbles: true,
        cancelable: true,
        key: 'Shift',
        code: 'ShiftLeft',
        location: 1,
        keyCode: 16,
        charCode: 0,
        which: 16,
      }))
      await new Promise(r => setTimeout(r, 15))
    }
  }

  async function triggerChange(el, cancelable = false) {
    el.dispatchEvent(new Event('change', {
      view: window,
      bubbles: true,
      cancelable,
    }))
    await new Promise(r => setTimeout(r))
  }
  async function triggerBlur(el) {
    el.dispatchEvent(new FocusEvent('blur', {
      view: window,
      bubbles: false,
      cancelable: false,
    }))
    await new Promise(r => setTimeout(r))
  }

  async function emulateTextInput(el, text, options = {}) {
    el.value = options.inputMask || ''
    for (var i = 0; i < text.length; i++) {
      const key = text[i]
      await emulateLetterInput(el, key, options)
      await new Promise(r => setTimeout(r, 10))
    }

    await triggerChange(el, true)
    await triggerBlur(el)
  }

  async function emulateChange(el, checked) {
    const lastValue = el.checked
    el.checked = checked
    if (el._valueTracker) {
      el._valueTracker.setValue(lastValue.toString())
    }
    el.dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: false,
      composed: true,
    }))
    await triggerChange(el)
  }

  async function emulateInput(el, input, options = {}) {
    if (typeof input == 'string') {
      return emulateTextInput(el, input, options)
    }
    if (typeof input == 'boolean') {
      return emulateChange(el, input)
    }

    console.log('emulateInput failed for', text)
    return result
  }

  window.emulateInput = emulateInput
})(window)
