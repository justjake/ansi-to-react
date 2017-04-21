const React = require('react');
const Anser = require('anser');
const escapeCarriageReturn = require('escape-carriage');

/**
 * ansiToJson
 * Convert ANSI strings into JSON output.
 *
 * @name ansiToJSON
 * @function
 * @param {String} input The input string.
 * @return {Array} The parsed input.
 */
function ansiToJSON(input) {
  input = escapeCarriageReturn(input);
  return Anser.ansiToJson(input, {
    json: true,
    remove_empty: true,
  });
}

function ansiJSONtoStyleBundle(ansiBundle) {
  const style = {};
  if (ansiBundle.bg) {
    style.backgroundColor = `rgb(${ansiBundle.bg})`;
  }
  if (ansiBundle.fg) {
    style.color = `rgb(${ansiBundle.fg})`;
  }
  return {
    content: ansiBundle.content,
    style,
  };
}

function ansiToInlineStyle(text) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

function linkifyBundle(bundle) {
  return {
    ...bundle,
    content: bundle.content.split(' ').reduce((result, word, index) => [
      ...result,
      // Unless word is the first, prepend a space
      index === 0 ? '' : ' ',
      // If word is a URL, return an <a> element
      /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/.test(word)
        ? React.createElement(
            'a',
            {
              key: index,
              href: word,
              target: '_blank'
            },
            `${word}`
          )
        : word
    ], [])
  };
}

function inlineBundleToReact(bundle, key) {
  return React.createElement('span', {
    style: bundle.style,
    key,
  }, bundle.content);
}

function ansiToReact(input, linkify) {
  if (linkify) {
    return ansiToInlineStyle(input)
      .map(linkifyBundle)
      .map(inlineBundleToReact);
  }
  return ansiToInlineStyle(input).map(inlineBundleToReact);
}

function Ansi(props) {
  return React.createElement(
    'code',
    {},
    ansiToReact(props.children, props.linkify)
  );
}

Ansi.propTypes = {
  children: React.PropTypes.string,
};

Ansi.ansiToReact = ansiToReact;

module.exports = Ansi;
