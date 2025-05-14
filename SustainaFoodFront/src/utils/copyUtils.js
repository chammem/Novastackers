export const initializeCopyFeature = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            enableCopyForElement(node);
          }
        });
      }
    });
  });

  const enableCopyForElement = (element) => {
    element.style.userSelect = 'text';
    element.style.webkitUserSelect = 'text';
  };

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return () => observer.disconnect();
};
