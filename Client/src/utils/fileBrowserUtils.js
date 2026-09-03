/**
 * Utility for directly handling file browser operations
 */

/**
 * Opens a file browser dialog for selecting files
 * @param {string} accept - File types to accept (e.g., 'image/*', '*.*')
 * @param {Function} onFileSelected - Callback function when file is selected
 */
export const openFileBrowser = (accept, onFileSelected) => {
  try {
    // Create a function to handle the file selection
    const handleFileSelection = (event) => {
      const file = event.target.files[0];
      if (file) {
        onFileSelected(file);
      }

      // Clean up after selection
      document.body.removeChild(event.target);
      document.removeEventListener('focus', focusHandler);
    };

    // Function to handle when focus returns to window without a file selection
    const focusHandler = () => {
      // Wait a bit to see if a file was selected
      setTimeout(() => {
        // Only remove if it still exists in the DOM
        const inputElements = document.querySelectorAll(
          'input[data-temp-file-input="true"]'
        );
        inputElements.forEach((el) => {
          if (document.body.contains(el)) {
            document.body.removeChild(el);
          }
        });
        document.removeEventListener('focus', focusHandler);
      }, 1000);
    };

    // Create the file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '*.*';
    input.setAttribute('data-temp-file-input', 'true');
    input.style.position = 'fixed';
    input.style.left = '-1000px';
    input.style.top = '-1000px';

    // Add event listeners
    input.addEventListener('change', handleFileSelection);
    document.addEventListener('focus', focusHandler);

    // Add to DOM and trigger click
    document.body.appendChild(input);

    // Force element to be visible and focused before clicking
    input.focus();
    setTimeout(() => {
      input.click();
    }, 100);
  } catch (error) {
    console.error('Error opening file browser:', error);
  }
};
