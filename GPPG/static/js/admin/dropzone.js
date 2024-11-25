$(document).ready(function () {
  const $dropZone = $("#dropZone");
  const $fileInput = $('input[type="file"]');
  const $browseLink = $("#browseLink");
  const $previewContainer = $("#previewContainer");
  const $imagePreview = $("#imagePreview");
  const $clearButton = $("#clearImage");

  // Trigger file input when clicking browse link or drop zone
  $browseLink.on("click", function (e) {
    e.stopPropagation();
    $fileInput.click();
  });

  $dropZone.on("click", function () {
    $fileInput.click();
  });

  // Handle file selection
  $fileInput.on("change", function (e) {
    handleFiles(this.files);
  });

  // Drag and drop handlers
  $dropZone
    .on("dragenter dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass("border-primary-500 bg-gray-100 dark:bg-gray-600");
    })
    .on("dragleave dragend", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass("border-primary-500 bg-gray-100 dark:bg-gray-600");
    })
    .on("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass("border-primary-500 bg-gray-100 dark:bg-gray-600");

      const files = e.originalEvent.dataTransfer.files;
      handleFiles(files);
    });

  // Handle file preview
  function handleFiles(files) {
    if (files && files[0]) {
      const file = files[0];

      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        $imagePreview.attr("src", e.target.result);
        $dropZone.addClass("hidden");
        $previewContainer.removeClass("hidden");
      };

      reader.readAsDataURL(file);
    }
  }

  // Clear image
  $clearButton.on("click", function (e) {
    e.stopPropagation();
    $fileInput.val("");
    $previewContainer.addClass("hidden");
    $dropZone.removeClass("hidden");
  });

  // Prevent defaults for document drag and drop
  $(document).on("dragenter dragover drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});
