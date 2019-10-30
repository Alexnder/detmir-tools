function toast(type, text) {
  let color = 'lightgrey'
  if (type == 'success') {
    color = '#0fb95f'
  }
  if (type == 'error') {
    color = '#ff4141'
  }
  if (type == 'warning') {
    color = '#ffb06c'
  }
  if (type == 'info') {
    color = '#89c2fb'
  }
  Toastify({
    text,
    backgroundColor: color,
  }).showToast();
}
