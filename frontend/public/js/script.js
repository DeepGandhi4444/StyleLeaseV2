
  function disableRightClick(event) {
    if (event.button == 2) {
      event.preventDefault(); // Prevent the default right-click behavior
      alert("Right click disabled!");
      return false;
    }
  }

  window.onload = function() {
    var images = document.getElementsByTagName('img');
    for (var i = 0; i < images.length; i++) {
      images[i].addEventListener('mousedown', disableRightClick);
    }
  }

