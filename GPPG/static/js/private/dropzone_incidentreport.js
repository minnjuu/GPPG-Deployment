$(document).ready(function () {
  if ($("#evidenceForm").length) {
    const $dropZoneEvidence = $("#dropZoneEvidence");
    const $fileInputEvidence = $('#evidenceForm input[type="file"]');
    const $browseLinkEvidence = $("#browseLinkEvidence");
    const $previewContainerEvidence = $("#previewContainerEvidence");
    const $imagePreviewEvidence = $("#imagePreviewEvidence");
    const $videoPreviewEvidence = $("#videoPreviewEvidence");
    const $clearButtonEvidence = $("#clearMediaEvidence");

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];

    $browseLinkEvidence.on("click", function (e) {
      e.stopPropagation();
      $fileInputEvidence.click();
    });

    $dropZoneEvidence.on("click", function () {
      $fileInputEvidence.click();
    });

    $fileInputEvidence.on("change", function () {
      handleEvidenceFiles(this.files);
    });

    $dropZoneEvidence
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
        handleEvidenceFiles(files);
      });

    function handleEvidenceFiles(files) {
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
            $imagePreviewEvidence.attr("src", e.target.result).removeClass("hidden");
            $videoPreviewEvidence.addClass("hidden").attr("src", "");
            $dropZoneEvidence.addClass("hidden");
            $previewContainerEvidence.removeClass("hidden");
          };
          reader.readAsDataURL(file);
        } else {
          const videoURL = URL.createObjectURL(file);
          $videoPreviewEvidence.attr("src", videoURL).removeClass("hidden");
          $imagePreviewEvidence.addClass("hidden").attr("src", "");
          $dropZoneEvidence.addClass("hidden");
          $previewContainerEvidence.removeClass("hidden");
        }
      }
    }

    $clearButtonEvidence.on("click", function (e) {
      e.stopPropagation();
      $fileInputEvidence.val("");
      $imagePreviewEvidence.attr("src", "").addClass("hidden");
      $videoPreviewEvidence.attr("src", "").addClass("hidden");
      $previewContainerEvidence.addClass("hidden");
      $dropZoneEvidence.removeClass("hidden");

      if ($videoPreviewEvidence.attr("src").startsWith("blob:")) {
        URL.revokeObjectURL($videoPreviewEvidence.attr("src"));
      }
    });
  }

  $(document).on("dragenter dragover drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});
