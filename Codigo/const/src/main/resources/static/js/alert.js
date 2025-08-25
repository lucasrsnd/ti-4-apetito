function showAlert(title, text, icon = 'info') {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'custom-alert',
      confirmButton: 'custom-button'
    }
  });
}
