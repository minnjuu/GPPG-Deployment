function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.remove('flex');
      location.reload();

    } else {
      console.error('Modal not found');
    }

  }

// reloads page after submission in modal
document.body.addEventListener('closeAndRefresh', function() {
    const modal = document.getElementById('modaldialog');
    if (!modal) {
        console.error('Modal not found in the DOM');
        return;
    }
    console.log('Modal found');
    modal.style.display = 'none';
    window.location.reload();
});




function showTitle(text) {
  document.getElementById('title').innerText = text;
}




document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdownCheckboxButton');
    const dropdownMenu = document.getElementById('dropdownDefaultCheckbox');
    const statusCheckboxes = document.querySelectorAll('#dropdownDefaultCheckbox input[type="checkbox"]');

    // Load selected statuses from localStorage and set checkboxes
    const savedStatuses = JSON.parse(localStorage.getItem('selectedStatuses')) || [];
    statusCheckboxes.forEach(checkbox => {
        if (savedStatuses.includes(checkbox.value)) {
            checkbox.checked = true; // Check the checkbox if it's in localStorage
        }
    });

    // Open dropdown if any checkbox is checked
    if (savedStatuses.length > 0) {
        dropdownMenu.classList.remove('hidden');
    }

    dropdownButton.addEventListener('click', function(event) {
        dropdownMenu.classList.toggle('hidden');
    });

    statusCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!dropdownMenu.contains(event.target) && event.target !== dropdownButton) {
            dropdownMenu.classList.add('hidden');
        }
    });

    function updateFilters() {
        const selectedStatuses = Array.from(statusCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Save selected statuses to localStorage
        localStorage.setItem('selectedStatuses', JSON.stringify(selectedStatuses));

        const url = new URL(window.location);
        url.searchParams.delete('status');

        if (selectedStatuses.length > 0) {
            selectedStatuses.forEach(status => {
                url.searchParams.append('status', status);
            });
        }

        window.location.href = url.toString(); // Refresh the page with new filters
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const modals = document.querySelectorAll('.modal');  // Select all modals
    
    modals.forEach(modal => {
        const video = modal.querySelector('video');  // Find video element in the modal
        const closeButton = modal.querySelector('.modal-close');  // Close button for the modal

        // Function to pause and reset the video
        const pauseVideo = () => {
            if (video && !video.paused) {
                video.pause();
                video.currentTime = 0;  // Reset video to the start
            }
        };

        // Close button listener
        if (closeButton) {
            closeButton.addEventListener('click', function () {
                pauseVideo();
            });
        }

        // Click outside modal to close
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {  // Check if clicked outside modal content
                pauseVideo();
            }
        });

        // Listen for data-modal-hide event if you are using a plugin
        modal.addEventListener('hidden.bs.modal', function () {
            pauseVideo();
        });
    });
});

