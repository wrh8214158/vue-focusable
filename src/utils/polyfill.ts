export const ArrayIncludes = (arr, val) => {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item === val) {
      return true;
    }
  }
  return false;
};

export function ArrayFrom(arrayLike, mapFn?, thisArg?) {
  const res = [] as any[];
  for (let i = 0; i < arrayLike.length; i++) {
    res.push(mapFn ? mapFn.call(thisArg, arrayLike[i], i) : arrayLike[i]);
  }
  return res;
}

export const ArrayFindIndex = (arr, val) => {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item === val) {
      return i;
    }
  }
  return -1;
};

export const getScrollingElement = () => {
  if (!('scrollingElement' in document)) {
    const computeStyle = (element) => {
      if ((window as any).getComputedStyle) {
        // Support Firefox < 4 which throws on a single parameter.
        return getComputedStyle(element, null);
      }
      // Support Internet Explorer < 9.
      return element.currentStyle;
    };

    const isBodyElement = (element) => {
      // The `instanceof` check gives the correct result for e.g. `body` in a
      // non-HTML namespace.
      if (window.HTMLBodyElement) {
        return element instanceof HTMLBodyElement;
      }
      // Fall back to a `tagName` check for old browsers.
      return /body/i.test(element.tagName);
    };

    const getNextBodyElement = (frameset) => {
      // We use this function to be correct per spec in case `document.body` is
      // a `frameset` but there exists a later `body`. Since `document.body` is
      // a `frameset`, we know the root is an `html`, and there was no `body`
      // before the `frameset`, so we just need to look at siblings after the
      // `frameset`.
      let current = frameset;
      // eslint-disable-next-line no-cond-assign
      while ((current = current.nextSibling)) {
        if (current.nodeType == 1 && isBodyElement(current)) {
          return current;
        }
      }
      // No `body` found.
      return null;
    };

    // Note: standards mode / quirks mode can be toggled at runtime via
    // `document.write`.
    let isCompliantCached;
    const isCompliant = () => {
      const isStandardsMode = /^CSS1/.test(document.compatMode);
      if (!isStandardsMode) {
        // In quirks mode, the result is equivalent to the non-compliant
        // standards mode behavior.
        return false;
      }
      if (isCompliantCached === void 0) {
        // When called for the first time, check whether the browser is
        // standard-compliant, and cache the result.
        const iframe = document.createElement('iframe');
        iframe.style.height = '1px';
        (document.body || document.documentElement || document).appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.write('<!DOCTYPE html><div style="height:9999em">x</div>');
          doc.close();
          isCompliantCached = doc.documentElement.scrollHeight > doc.body.scrollHeight;
        }
        iframe.parentNode?.removeChild(iframe);
      }
      return isCompliantCached;
    };

    const isRendered = (style) => {
      return (
        style.display != 'none' &&
        !(style.visibility == 'collapse' && /^table-(.+-group|row|column)$/.test(style.display))
      );
    };

    const isScrollable = (body) => {
      // A `body` element is scrollable if `body` and `html` both have
      // non-`visible` overflow and are both being rendered.
      const bodyStyle = computeStyle(body);
      const htmlStyle = computeStyle(document.documentElement);
      return (
        bodyStyle.overflow != 'visible' &&
        htmlStyle.overflow != 'visible' &&
        isRendered(bodyStyle) &&
        isRendered(htmlStyle)
      );
    };

    const scrollingElement = () => {
      if (isCompliant()) {
        return document.documentElement;
      }
      let body = document.body;
      // Note: `document.body` could be a `frameset` element, or `null`.
      // `tagName` is uppercase in HTML, but lowercase in XML.
      const isFrameset = body && !/body/i.test(body.tagName);
      body = isFrameset ? getNextBodyElement(body) : body;
      // If `body` is itself scrollable, it is not the `scrollingElement`.
      return body && isScrollable(body) ? null : body;
    };

    return scrollingElement();
  } else {
    return document.scrollingElement;
  }
};
