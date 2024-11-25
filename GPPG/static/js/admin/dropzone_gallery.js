$(document).ready(function () {
  if ($("#galleryForm").length) {
    const $dropZoneGallery = $("#dropZoneGallery");
    const $fileInputGallery = $('#galleryForm input[type="file"]');
    const $browseLinkGallery = $("#browseLinkGallery");
    const $previewContainerGallery = $("#previewContainerGallery");
    const $imagePreviewGallery = $("#imagePreviewGallery");
    const $videoPreviewGallery = $("#videoPreviewGallery");
    const $clearButtonGallery = $("#clearMediaGallery");

  
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];

    $browseLinkGallery.on("click", function (e) {
      e.stopPropagation();
      $fileInputGallery.click();
    });

    $dropZoneGallery.on("click", function () {
      $fileInputGallery.click();
    });

    $fileInputGallery.on("change", function (e) {
      handleGalleryFiles(this.files);
    });

    $dropZoneGallery
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
        handleGalleryFiles(files);
      });

    function handleGalleryFiles(files) {
      if (files && files[0]) {
        const file = files[0];
        const fileType = file.type;

        if (!validImageTypes.includes(fileType) && !validVideoTypes.includes(fileType)) {
          alert("Please select an image or video file");
          return;
        }

        if (validImageTypes.includes(fileType)) {
          const reader = new FileReader();
          reader.onload = function (e) {
            $imagePreviewGallery.attr("src", e.target.result).removeClass("hidden");
            $videoPreviewGallery.addClass("hidden").attr("src", "");
            $dropZoneGallery.addClass("hidden");
            $previewContainerGallery.removeClass("hidden");
          };
          reader.readAsDataURL(file);
        } else {
          const videoURL = URL.createObjectURL(file);
          $videoPreviewGallery.attr("src", videoURL).removeClass("hidden");
          $imagePreviewGallery.addClass("hidden").attr("src", "");
          $dropZoneGallery.addClass("hidden");
          $previewContainerGallery.removeClass("hidden");
        }
      }
    }

    $clearButtonGallery.on("click", function (e) {
      e.stopPropagation();
      $fileInputGallery.val("");
      $imagePreviewGallery.attr("src", "").addClass("hidden");
      $videoPreviewGallery.attr("src", "").addClass("hidden");
      $previewContainerGallery.addClass("hidden");
      $dropZoneGallery.removeClass("hidden");

      if ($videoPreviewGallery.attr("src").startsWith("blob:")) {
        URL.revokeObjectURL($videoPreviewGallery.attr("src"));
      }
    });
  }


  $(document).on("dragenter dragover drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});
