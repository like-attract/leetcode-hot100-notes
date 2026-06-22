(function () {
  function enhanceHighlights(root) {
    var skipped = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'KBD', 'SAMP']);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || skipped.has(parent.tagName) || parent.closest('code, pre, script, style, textarea, kbd, samp')) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.nodeValue.indexOf('==') === -1 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var fragment = document.createDocumentFragment();
      var pattern = /==([^=\n](?:[^\n]*?[^=\n])?)==/g;
      var lastIndex = 0;
      var match;
      var changed = false;

      while ((match = pattern.exec(text)) !== null) {
        changed = true;
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

        var mark = document.createElement('mark');
        mark.textContent = match[1];
        fragment.appendChild(mark);

        lastIndex = pattern.lastIndex;
      }

      if (!changed) {
        return;
      }

      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(fragment, node);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      enhanceHighlights(document.body);
    });
  } else {
    enhanceHighlights(document.body);
  }
})();
