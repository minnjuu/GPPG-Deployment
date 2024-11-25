$(document).ready(function () {
  if ($("#eventForm").length) {
    const $dropZoneEvent = $("#dropZoneEvent");
    const $fileInputEvent = $('#eventForm input[type="file"]');
    const $browseLinkEvent = $("#browseLinkEvent");
    const $previewContainerEvent = $("#previewContainerEvent");
    const $imagePreviewEvent = $("#imagePreviewEvent");
    const $clearButtonEvent = $("#clearImageEvent");

    $browseLinkEvent.on("click", function (e) {
      e.stopPropagation();
      $fileInputEvent.click();
    });

    $dropZoneEvent.on("click", function () {
      $fileInputEvent.click();
    });

    $fileInputEvent.on("change", function (e) {
      handleEventFiles(this.files);
    });

    $dropZoneEvent
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
        handleEventFiles(files);
      });

    function handleEventFiles(files) {
      if (files && files[0]) {
        const file = files[0];

        if (!file.type.match("image.*")) {
          alert("Please select an image file");
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          $imagePreviewEvent.attr("src", e.target.result);
          $dropZoneEvent.addClass("hidden");
          $previewContainerEvent.removeClass("hidden");
        };

        reader.readAsDataURL(file);
      }
    }

    $clearButtonEvent.on("click", function (e) {
      e.stopPropagation();
      $fileInputEvent.val("");
      $previewContainerEvent.addClass("hidden");
      $dropZoneEvent.removeClass("hidden");
    });
  }
});
