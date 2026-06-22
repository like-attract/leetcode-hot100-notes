(function () {
  function slugify(text, index) {
    var base = text.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}_-]+/gu, '');

    if (!base) {
      base = 'section-' + index;
    }

    var id = base;
    var suffix = 2;
    while (document.getElementById(id)) {
      id = base + '-' + suffix;
      suffix += 1;
    }

    return id;
  }

  function buildTableOfContents(root) {
    var headings = Array.from(root.querySelectorAll('h2'))
      .filter(function (heading) {
        return heading.textContent.trim() !== '目录';
      });

    var tocHeading = Array.from(root.querySelectorAll('h2'))
      .find(function (heading) {
        return heading.textContent.trim() === '目录';
      });

    if (!tocHeading || headings.length === 0) {
      return;
    }

    var list = document.createElement('ul');
    list.className = 'auto-toc';

    headings.forEach(function (heading, index) {
      if (!heading.id) {
        heading.id = slugify(heading.textContent, index + 1);
      }

      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent.trim();
      item.appendChild(link);
      list.appendChild(item);
    });

    var next = tocHeading.nextElementSibling;
    while (next && next.tagName !== 'H2' && next.tagName !== 'HR') {
      var current = next;
      next = next.nextElementSibling;
      current.remove();
    }

    tocHeading.insertAdjacentElement('afterend', list);
  }

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
      buildTableOfContents(document.body);
      enhanceHighlights(document.body);
    });
  } else {
    buildTableOfContents(document.body);
    enhanceHighlights(document.body);
  }
})();
