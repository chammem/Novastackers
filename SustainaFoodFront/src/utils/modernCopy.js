export const initializeCopyFeature = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        handleNewNodes(mutation.addedNodes);
      }
    });
  });

  const handleNewNodes = (nodes) => {
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        makeContentCopyable(node);
      }
    });
  };

  const makeContentCopyable = (element) => {
    if (element.style) {
      element.style.userSelect = 'text';
      element.style.webkitUserSelect = 'text';
    }
  };

  // Start observing with configuration
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Cleanup function
  return () => observer.disconnect();
};
