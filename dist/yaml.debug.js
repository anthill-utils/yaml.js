(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Dumper, Inline, Utils;

Utils = require('./Utils');

Inline = require('./Inline');

Dumper = (function() {
  function Dumper() {}

  Dumper.indentation = 4;

  Dumper.prototype.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var i, key, len, output, prefix, value, willBeInlined;
    if (inline == null) {
      inline = 0;
    }
    if (indent == null) {
      indent = 0;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    output = '';
    if (typeof input === 'function') {
      return output;
    }
    prefix = (indent ? Utils.strRepeat(' ', indent) : '');
    if (inline <= 0 || typeof input !== 'object' || input instanceof Date || Utils.isEmpty(input)) {
      output += prefix + Inline.dump(input, exceptionOnInvalidType, objectEncoder);
    } else {
      if (input instanceof Array) {
        for (i = 0, len = input.length; i < len; i++) {
          value = input[i];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + '- ' + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      } else {
        for (key in input) {
          value = input[key];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + Inline.dump(key, exceptionOnInvalidType, objectEncoder) + ':' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      }
    }
    return output;
  };

  return Dumper;

})();

module.exports = Dumper;


},{"./Inline":6,"./Utils":10}],2:[function(require,module,exports){
var Escaper, Pattern;

Pattern = require('./Pattern');

Escaper = (function() {
  var ch;

  function Escaper() {}

  Escaper.LIST_ESCAPEES = ['\\', '\\\\', '\\"', '"', "\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", (ch = String.fromCharCode)(0x0085), ch(0x00A0), ch(0x2028), ch(0x2029)];

  Escaper.LIST_ESCAPED = ['\\\\', '\\"', '\\"', '\\"', "\\0", "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a", "\\b", "\\t", "\\n", "\\v", "\\f", "\\r", "\\x0e", "\\x0f", "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17", "\\x18", "\\x19", "\\x1a", "\\e", "\\x1c", "\\x1d", "\\x1e", "\\x1f", "\\N", "\\_", "\\L", "\\P"];

  Escaper.MAPPING_ESCAPEES_TO_ESCAPED = (function() {
    var i, j, mapping, ref;
    mapping = {};
    for (i = j = 0, ref = Escaper.LIST_ESCAPEES.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      mapping[Escaper.LIST_ESCAPEES[i]] = Escaper.LIST_ESCAPED[i];
    }
    return mapping;
  })();

  Escaper.PATTERN_CHARACTERS_TO_ESCAPE = new Pattern('[\\x00-\\x1f]|\xc2\x85|\xc2\xa0|\xe2\x80\xa8|\xe2\x80\xa9');

  Escaper.PATTERN_MAPPING_ESCAPEES = new Pattern(Escaper.LIST_ESCAPEES.join('|').split('\\').join('\\\\'));

  Escaper.PATTERN_SINGLE_QUOTING = new Pattern('[\\s\'":{}[\\],&*#?]|^[-?|<>=!%@`]');

  Escaper.requiresDoubleQuoting = function(value) {
    return this.PATTERN_CHARACTERS_TO_ESCAPE.test(value);
  };

  Escaper.escapeWithDoubleQuotes = function(value) {
    var result;
    result = this.PATTERN_MAPPING_ESCAPEES.replace(value, (function(_this) {
      return function(str) {
        return _this.MAPPING_ESCAPEES_TO_ESCAPED[str];
      };
    })(this));
    return '"' + result + '"';
  };

  Escaper.requiresSingleQuoting = function(value) {
    return this.PATTERN_SINGLE_QUOTING.test(value);
  };

  Escaper.escapeWithSingleQuotes = function(value) {
    return "'" + value.replace(/'/g, "''") + "'";
  };

  return Escaper;

})();

module.exports = Escaper;


},{"./Pattern":8}],3:[function(require,module,exports){
var DumpException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DumpException = (function(superClass) {
  extend(DumpException, superClass);

  function DumpException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  DumpException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<DumpException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<DumpException> ' + this.message;
    }
  };

  return DumpException;

})(Error);

module.exports = DumpException;


},{}],4:[function(require,module,exports){
var ParseException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseException = (function(superClass) {
  extend(ParseException, superClass);

  function ParseException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseException> ' + this.message;
    }
  };

  return ParseException;

})(Error);

module.exports = ParseException;


},{}],5:[function(require,module,exports){
var ParseMore,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseMore = (function(superClass) {
  extend(ParseMore, superClass);

  function ParseMore(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseMore.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseMore> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseMore> ' + this.message;
    }
  };

  return ParseMore;

})(Error);

module.exports = ParseMore;


},{}],6:[function(require,module,exports){
var DumpException, Escaper, Inline, ParseException, ParseMore, Pattern, Unescaper, Utils,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Pattern = require('./Pattern');

Unescaper = require('./Unescaper');

Escaper = require('./Escaper');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

DumpException = require('./Exception/DumpException');

Inline = (function() {
  function Inline() {}

  Inline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

  Inline.PATTERN_TRAILING_COMMENTS = new Pattern('^\\s*#.*$');

  Inline.PATTERN_QUOTED_SCALAR = new Pattern('^' + Inline.REGEX_QUOTED_STRING);

  Inline.PATTERN_THOUSAND_NUMERIC_SCALAR = new Pattern('^(-|\\+)?[0-9,]+(\\.[0-9]+)?$');

  Inline.PATTERN_SCALAR_BY_DELIMITERS = {};

  Inline.settings = {};

  Inline.configure = function(exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = null;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
  };

  Inline.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var context, result;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
    if (value == null) {
      return '';
    }
    value = Utils.trim(value);
    if (0 === value.length) {
      return '';
    }
    context = {
      exceptionOnInvalidType: exceptionOnInvalidType,
      objectDecoder: objectDecoder,
      i: 0
    };
    switch (value.charAt(0)) {
      case '[':
        result = this.parseSequence(value, context);
        ++context.i;
        break;
      case '{':
        result = this.parseMapping(value, context);
        ++context.i;
        break;
      default:
        result = this.parseScalar(value, null, ['"', "'"], context);
    }
    if (this.PATTERN_TRAILING_COMMENTS.replace(value.slice(context.i), '') !== '') {
      throw new ParseException('Unexpected characters near "' + value.slice(context.i) + '".');
    }
    return result;
  };

  Inline.dump = function(value, exceptionOnInvalidType, objectEncoder) {
    var ref, result, type;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    if (value == null) {
      return 'null';
    }
    type = typeof value;
    if (type === 'object') {
      if (value instanceof Date) {
        return value.toISOString();
      } else if (objectEncoder != null) {
        result = objectEncoder(value);
        if (typeof result === 'string' || (result != null)) {
          return result;
        }
      }
      return this.dumpObject(value);
    }
    if (type === 'boolean') {
      return (value ? 'true' : 'false');
    }
    if (Utils.isDigits(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseInt(value)));
    }
    if (Utils.isNumeric(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseFloat(value)));
    }
    if (type === 'number') {
      return (value === 2e308 ? '.Inf' : (value === -2e308 ? '-.Inf' : (isNaN(value) ? '.NaN' : value)));
    }
    if (Escaper.requiresDoubleQuoting(value)) {
      return Escaper.escapeWithDoubleQuotes(value);
    }
    if (Escaper.requiresSingleQuoting(value)) {
      return Escaper.escapeWithSingleQuotes(value);
    }
    if ('' === value) {
      return '""';
    }
    if (Utils.PATTERN_DATE.test(value)) {
      return "'" + value + "'";
    }
    if ((ref = value.toLowerCase()) === 'null' || ref === '~' || ref === 'true' || ref === 'false') {
      return "'" + value + "'";
    }
    return value;
  };

  Inline.dumpObject = function(value, exceptionOnInvalidType, objectSupport) {
    var j, key, len1, output, val;
    if (objectSupport == null) {
      objectSupport = null;
    }
    if (value instanceof Array) {
      output = [];
      for (j = 0, len1 = value.length; j < len1; j++) {
        val = value[j];
        output.push(this.dump(val));
      }
      return '[' + output.join(', ') + ']';
    } else {
      output = [];
      for (key in value) {
        val = value[key];
        output.push(this.dump(key) + ': ' + this.dump(val));
      }
      return '{' + output.join(', ') + '}';
    }
  };

  Inline.parseScalar = function(scalar, delimiters, stringDelimiters, context, evaluate) {
    var i, joinedDelimiters, match, output, pattern, ref, ref1, strpos, tmp;
    if (delimiters == null) {
      delimiters = null;
    }
    if (stringDelimiters == null) {
      stringDelimiters = ['"', "'"];
    }
    if (context == null) {
      context = null;
    }
    if (evaluate == null) {
      evaluate = true;
    }
    if (context == null) {
      context = {
        exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
        objectDecoder: this.settings.objectDecoder,
        i: 0
      };
    }
    i = context.i;
    if (ref = scalar.charAt(i), indexOf.call(stringDelimiters, ref) >= 0) {
      output = this.parseQuotedScalar(scalar, context);
      i = context.i;
      if (delimiters != null) {
        tmp = Utils.ltrim(scalar.slice(i), ' ');
        if (!(ref1 = tmp.charAt(0), indexOf.call(delimiters, ref1) >= 0)) {
          throw new ParseException('Unexpected characters (' + scalar.slice(i) + ').');
        }
      }
    } else {
      if (!delimiters) {
        output = scalar.slice(i);
        i += output.length;
        strpos = output.indexOf(' #');
        if (strpos !== -1) {
          output = Utils.rtrim(output.slice(0, strpos));
        }
      } else {
        joinedDelimiters = delimiters.join('|');
        pattern = this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters];
        if (pattern == null) {
          pattern = new Pattern('^(.+?)(' + joinedDelimiters + ')');
          this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters] = pattern;
        }
        if (match = pattern.exec(scalar.slice(i))) {
          output = match[1];
          i += output.length;
        } else {
          throw new ParseException('Malformed inline YAML string (' + scalar + ').');
        }
      }
      if (evaluate) {
        output = this.evaluateScalar(output, context);
      }
    }
    context.i = i;
    return output;
  };

  Inline.parseQuotedScalar = function(scalar, context) {
    var i, match, output;
    i = context.i;
    if (!(match = this.PATTERN_QUOTED_SCALAR.exec(scalar.slice(i)))) {
      throw new ParseMore('Malformed inline YAML string (' + scalar.slice(i) + ').');
    }
    output = match[0].substr(1, match[0].length - 2);
    if ('"' === scalar.charAt(i)) {
      output = Unescaper.unescapeDoubleQuotedString(output);
    } else {
      output = Unescaper.unescapeSingleQuotedString(output);
    }
    i += match[0].length;
    context.i = i;
    return output;
  };

  Inline.parseSequence = function(sequence, context) {
    var e, i, isQuoted, len, output, ref, value;
    output = [];
    len = sequence.length;
    i = context.i;
    i += 1;
    while (i < len) {
      context.i = i;
      switch (sequence.charAt(i)) {
        case '[':
          output.push(this.parseSequence(sequence, context));
          i = context.i;
          break;
        case '{':
          output.push(this.parseMapping(sequence, context));
          i = context.i;
          break;
        case ']':
          return output;
        case ',':
        case ' ':
        case "\n":
          break;
        default:
          isQuoted = ((ref = sequence.charAt(i)) === '"' || ref === "'");
          value = this.parseScalar(sequence, [',', ']'], ['"', "'"], context);
          i = context.i;
          if (!isQuoted && typeof value === 'string' && (value.indexOf(': ') !== -1 || value.indexOf(":\n") !== -1)) {
            try {
              value = this.parseMapping('{' + value + '}');
            } catch (error) {
              e = error;
            }
          }
          output.push(value);
          --i;
      }
      ++i;
    }
    throw new ParseMore('Malformed inline YAML string ' + sequence);
  };

  Inline.parseMapping = function(mapping, context) {
    var done, i, key, len, output, shouldContinueWhileLoop, value;
    output = {};
    len = mapping.length;
    i = context.i;
    i += 1;
    shouldContinueWhileLoop = false;
    while (i < len) {
      context.i = i;
      switch (mapping.charAt(i)) {
        case ' ':
        case ',':
        case "\n":
          ++i;
          context.i = i;
          shouldContinueWhileLoop = true;
          break;
        case '}':
          return output;
      }
      if (shouldContinueWhileLoop) {
        shouldContinueWhileLoop = false;
        continue;
      }
      key = this.parseScalar(mapping, [':', ' ', "\n"], ['"', "'"], context, false);
      i = context.i;
      done = false;
      while (i < len) {
        context.i = i;
        switch (mapping.charAt(i)) {
          case '[':
            value = this.parseSequence(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case '{':
            value = this.parseMapping(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case ':':
          case ' ':
          case "\n":
            break;
          default:
            value = this.parseScalar(mapping, [',', '}'], ['"', "'"], context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            --i;
        }
        ++i;
        if (done) {
          break;
        }
      }
    }
    throw new ParseMore('Malformed inline YAML string ' + mapping);
  };

  Inline.evaluateScalar = function(scalar, context) {
    var cast, date, exceptionOnInvalidType, firstChar, firstSpace, firstWord, objectDecoder, raw, scalarLower, subValue, trimmedScalar;
    scalar = Utils.trim(scalar);
    scalarLower = scalar.toLowerCase();
    switch (scalarLower) {
      case 'null':
      case '':
      case '~':
        return null;
      case 'true':
        return true;
      case 'false':
        return false;
      case '.inf':
        return 2e308;
      case '.nan':
        return 0/0;
      case '-.inf':
        return 2e308;
      default:
        firstChar = scalarLower.charAt(0);
        switch (firstChar) {
          case '!':
            firstSpace = scalar.indexOf(' ');
            if (firstSpace === -1) {
              firstWord = scalarLower;
            } else {
              firstWord = scalarLower.slice(0, firstSpace);
            }
            switch (firstWord) {
              case '!':
                if (firstSpace !== -1) {
                  return parseInt(this.parseScalar(scalar.slice(2)));
                }
                return null;
              case '!str':
                return Utils.ltrim(scalar.slice(4));
              case '!!str':
                return Utils.ltrim(scalar.slice(5));
              case '!!int':
                return parseInt(this.parseScalar(scalar.slice(5)));
              case '!!bool':
                return Utils.parseBoolean(this.parseScalar(scalar.slice(6)), false);
              case '!!float':
                return parseFloat(this.parseScalar(scalar.slice(7)));
              case '!!timestamp':
                return Utils.stringToDate(Utils.ltrim(scalar.slice(11)));
              default:
                if (context == null) {
                  context = {
                    exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
                    objectDecoder: this.settings.objectDecoder,
                    i: 0
                  };
                }
                objectDecoder = context.objectDecoder, exceptionOnInvalidType = context.exceptionOnInvalidType;
                if (objectDecoder) {
                  trimmedScalar = Utils.rtrim(scalar);
                  firstSpace = trimmedScalar.indexOf(' ');
                  if (firstSpace === -1) {
                    return objectDecoder(trimmedScalar, null);
                  } else {
                    subValue = Utils.ltrim(trimmedScalar.slice(firstSpace + 1));
                    if (!(subValue.length > 0)) {
                      subValue = null;
                    }
                    return objectDecoder(trimmedScalar.slice(0, firstSpace), subValue);
                  }
                }
                if (exceptionOnInvalidType) {
                  throw new ParseException('Custom object support when parsing a YAML file has been disabled.');
                }
                return null;
            }
            break;
          case '0':
            if ('0x' === scalar.slice(0, 2)) {
              return Utils.hexDec(scalar);
            } else if (Utils.isDigits(scalar)) {
              return Utils.octDec(scalar);
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else {
              return scalar;
            }
            break;
          case '+':
            if (Utils.isDigits(scalar)) {
              raw = scalar;
              cast = parseInt(raw);
              if (raw === String(cast)) {
                return cast;
              } else {
                return raw;
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          case '-':
            if (Utils.isDigits(scalar.slice(1))) {
              if ('0' === scalar.charAt(1)) {
                return -Utils.octDec(scalar.slice(1));
              } else {
                raw = scalar.slice(1);
                cast = parseInt(raw);
                if (raw === String(cast)) {
                  return -cast;
                } else {
                  return -raw;
                }
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          default:
            if (date = Utils.stringToDate(scalar)) {
              return date;
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
        }
    }
  };

  return Inline;

})();

module.exports = Inline;


},{"./Escaper":2,"./Exception/DumpException":3,"./Exception/ParseException":4,"./Exception/ParseMore":5,"./Pattern":8,"./Unescaper":9,"./Utils":10}],7:[function(require,module,exports){
var Inline, ParseException, ParseMore, Parser, Pattern, Utils;

Inline = require('./Inline');

Pattern = require('./Pattern');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

Parser = (function() {
  Parser.prototype.PATTERN_FOLDED_SCALAR_ALL = new Pattern('^(?:(?<type>![^\\|>]*)\\s+)?(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_FOLDED_SCALAR_END = new Pattern('(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_SEQUENCE_ITEM = new Pattern('^\\-((?<leadspaces>\\s+)(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_ANCHOR_VALUE = new Pattern('^&(?<ref>[^ ]+) *(?<value>.*)');

  Parser.prototype.PATTERN_COMPACT_NOTATION = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\{\\[].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_MAPPING_ITEM = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\[\\{].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_DECIMAL = new Pattern('\\d+');

  Parser.prototype.PATTERN_INDENT_SPACES = new Pattern('^ +');

  Parser.prototype.PATTERN_TRAILING_LINES = new Pattern('(\n*)$');

  Parser.prototype.PATTERN_YAML_HEADER = new Pattern('^\\%YAML[: ][\\d\\.]+.*\n', 'm');

  Parser.prototype.PATTERN_LEADING_COMMENTS = new Pattern('^(\\#.*?\n)+', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_START = new Pattern('^\\-\\-\\-.*?\n', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_END = new Pattern('^\\.\\.\\.\\s*$', 'm');

  Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION = {};

  Parser.prototype.CONTEXT_NONE = 0;

  Parser.prototype.CONTEXT_SEQUENCE = 1;

  Parser.prototype.CONTEXT_MAPPING = 2;

  function Parser(offset) {
    this.offset = offset != null ? offset : 0;
    this.lines = [];
    this.currentLineNb = -1;
    this.currentLine = '';
    this.refs = {};
  }

  Parser.prototype.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var alias, allowOverwrite, block, c, context, data, e, first, i, indent, isRef, j, k, key, l, lastKey, len, len1, len2, len3, lineCount, m, matches, mergeNode, n, name, parsed, parsedItem, parser, ref, ref1, ref2, refName, refValue, val, values;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.currentLineNb = -1;
    this.currentLine = '';
    this.lines = this.cleanup(value).split("\n");
    data = null;
    context = this.CONTEXT_NONE;
    allowOverwrite = false;
    while (this.moveToNextLine()) {
      if (this.isCurrentLineEmpty()) {
        continue;
      }
      if ("\t" === this.currentLine[0]) {
        throw new ParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      isRef = mergeNode = false;
      if (values = this.PATTERN_SEQUENCE_ITEM.exec(this.currentLine)) {
        if (this.CONTEXT_MAPPING === context) {
          throw new ParseException('You cannot define a sequence item when in a mapping');
        }
        context = this.CONTEXT_SEQUENCE;
        if (data == null) {
          data = [];
        }
        if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (this.currentLineNb < this.lines.length - 1 && !this.isNextLineUnIndentedCollection()) {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            data.push(parser.parse(this.getNextEmbedBlock(null, true), exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(null);
          }
        } else {
          if (((ref = values.leadspaces) != null ? ref.length : void 0) && (matches = this.PATTERN_COMPACT_NOTATION.exec(values.value))) {
            c = this.getRealCurrentLineNb();
            parser = new Parser(c);
            parser.refs = this.refs;
            block = values.value;
            indent = this.getCurrentLineIndentation();
            if (this.isNextLineIndented(false)) {
              block += "\n" + this.getNextEmbedBlock(indent + values.leadspaces.length + 1, true);
            }
            data.push(parser.parse(block, exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(this.parseValue(values.value, exceptionOnInvalidType, objectDecoder));
          }
        }
      } else if ((values = this.PATTERN_MAPPING_ITEM.exec(this.currentLine)) && values.key.indexOf(' #') === -1) {
        if (this.CONTEXT_SEQUENCE === context) {
          throw new ParseException('You cannot define a mapping item when in a sequence');
        }
        context = this.CONTEXT_MAPPING;
        if (data == null) {
          data = {};
        }
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        try {
          key = Inline.parseScalar(values.key);
        } catch (error) {
          e = error;
          e.parsedLine = this.getRealCurrentLineNb() + 1;
          e.snippet = this.currentLine;
          throw e;
        }
        if ('<<' === key) {
          mergeNode = true;
          allowOverwrite = true;
          if (((ref1 = values.value) != null ? ref1.indexOf('*') : void 0) === 0) {
            refName = values.value.slice(1);
            if (this.refs[refName] == null) {
              throw new ParseException('Reference "' + refName + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            refValue = this.refs[refName];
            if (typeof refValue !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (refValue instanceof Array) {
              for (i = j = 0, len = refValue.length; j < len; i = ++j) {
                value = refValue[i];
                if (data[name = String(i)] == null) {
                  data[name] = value;
                }
              }
            } else {
              for (key in refValue) {
                value = refValue[key];
                if (data[key] == null) {
                  data[key] = value;
                }
              }
            }
          } else {
            if ((values.value != null) && values.value !== '') {
              value = values.value;
            } else {
              value = this.getNextEmbedBlock();
            }
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            parsed = parser.parse(value, exceptionOnInvalidType);
            if (typeof parsed !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (parsed instanceof Array) {
              for (l = 0, len1 = parsed.length; l < len1; l++) {
                parsedItem = parsed[l];
                if (typeof parsedItem !== 'object') {
                  throw new ParseException('Merge items must be objects.', this.getRealCurrentLineNb() + 1, parsedItem);
                }
                if (parsedItem instanceof Array) {
                  for (i = m = 0, len2 = parsedItem.length; m < len2; i = ++m) {
                    value = parsedItem[i];
                    k = String(i);
                    if (!data.hasOwnProperty(k)) {
                      data[k] = value;
                    }
                  }
                } else {
                  for (key in parsedItem) {
                    value = parsedItem[key];
                    if (!data.hasOwnProperty(key)) {
                      data[key] = value;
                    }
                  }
                }
              }
            } else {
              for (key in parsed) {
                value = parsed[key];
                if (!data.hasOwnProperty(key)) {
                  data[key] = value;
                }
              }
            }
          }
        } else if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (mergeNode) {

        } else if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (!(this.isNextLineIndented()) && !(this.isNextLineUnIndentedCollection())) {
            if (allowOverwrite || data[key] === void 0) {
              data[key] = null;
            }
          } else {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            val = parser.parse(this.getNextEmbedBlock(), exceptionOnInvalidType, objectDecoder);
            if (allowOverwrite || data[key] === void 0) {
              data[key] = val;
            }
          }
        } else {
          val = this.parseValue(values.value, exceptionOnInvalidType, objectDecoder);
          if (allowOverwrite || data[key] === void 0) {
            data[key] = val;
          }
        }
      } else {
        lineCount = this.lines.length;
        if (1 === lineCount || (2 === lineCount && Utils.isEmpty(this.lines[1]))) {
          try {
            value = Inline.parse(this.lines[0], exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
          if (typeof value === 'object') {
            if (value instanceof Array) {
              first = value[0];
            } else {
              for (key in value) {
                first = value[key];
                break;
              }
            }
            if (typeof first === 'string' && first.indexOf('*') === 0) {
              data = [];
              for (n = 0, len3 = value.length; n < len3; n++) {
                alias = value[n];
                data.push(this.refs[alias.slice(1)]);
              }
              value = data;
            }
          }
          return value;
        } else if ((ref2 = Utils.ltrim(value).charAt(0)) === '[' || ref2 === '{') {
          try {
            return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
        throw new ParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      if (isRef) {
        if (data instanceof Array) {
          this.refs[isRef] = data[data.length - 1];
        } else {
          lastKey = null;
          for (key in data) {
            lastKey = key;
          }
          this.refs[isRef] = data[lastKey];
        }
      }
    }
    if (Utils.isEmpty(data)) {
      return null;
    } else {
      return data;
    }
  };

  Parser.prototype.getRealCurrentLineNb = function() {
    return this.currentLineNb + this.offset;
  };

  Parser.prototype.getCurrentLineIndentation = function() {
    return this.currentLine.length - Utils.ltrim(this.currentLine, ' ').length;
  };

  Parser.prototype.getNextEmbedBlock = function(indentation, includeUnindentedCollection) {
    var data, indent, isItUnindentedCollection, newIndent, removeComments, removeCommentsPattern, unindentedEmbedBlock;
    if (indentation == null) {
      indentation = null;
    }
    if (includeUnindentedCollection == null) {
      includeUnindentedCollection = false;
    }
    this.moveToNextLine();
    if (indentation == null) {
      newIndent = this.getCurrentLineIndentation();
      unindentedEmbedBlock = this.isStringUnIndentedCollectionItem(this.currentLine);
      if (!(this.isCurrentLineEmpty()) && 0 === newIndent && !unindentedEmbedBlock) {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    } else {
      newIndent = indentation;
    }
    data = [this.currentLine.slice(newIndent)];
    if (!includeUnindentedCollection) {
      isItUnindentedCollection = this.isStringUnIndentedCollectionItem(this.currentLine);
    }
    removeCommentsPattern = this.PATTERN_FOLDED_SCALAR_END;
    removeComments = !removeCommentsPattern.test(this.currentLine);
    while (this.moveToNextLine()) {
      indent = this.getCurrentLineIndentation();
      if (indent === newIndent) {
        removeComments = !removeCommentsPattern.test(this.currentLine);
      }
      if (removeComments && this.isCurrentLineComment()) {
        continue;
      }
      if (this.isCurrentLineBlank()) {
        data.push(this.currentLine.slice(newIndent));
        continue;
      }
      if (isItUnindentedCollection && !this.isStringUnIndentedCollectionItem(this.currentLine) && indent === newIndent) {
        this.moveToPreviousLine();
        break;
      }
      if (indent >= newIndent) {
        data.push(this.currentLine.slice(newIndent));
      } else if (Utils.ltrim(this.currentLine).charAt(0) === '#') {

      } else if (0 === indent) {
        this.moveToPreviousLine();
        break;
      } else {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    }
    return data.join("\n");
  };

  Parser.prototype.moveToNextLine = function() {
    if (this.currentLineNb >= this.lines.length - 1) {
      return false;
    }
    this.currentLine = this.lines[++this.currentLineNb];
    return true;
  };

  Parser.prototype.moveToPreviousLine = function() {
    this.currentLine = this.lines[--this.currentLineNb];
  };

  Parser.prototype.parseValue = function(value, exceptionOnInvalidType, objectDecoder) {
    var e, foldedIndent, matches, modifiers, pos, ref, ref1, val;
    if (0 === value.indexOf('*')) {
      pos = value.indexOf('#');
      if (pos !== -1) {
        value = value.substr(1, pos - 2);
      } else {
        value = value.slice(1);
      }
      if (this.refs[value] === void 0) {
        throw new ParseException('Reference "' + value + '" does not exist.', this.currentLine);
      }
      return this.refs[value];
    }
    if (matches = this.PATTERN_FOLDED_SCALAR_ALL.exec(value)) {
      modifiers = (ref = matches.modifiers) != null ? ref : '';
      foldedIndent = Math.abs(parseInt(modifiers));
      if (isNaN(foldedIndent)) {
        foldedIndent = 0;
      }
      val = this.parseFoldedScalar(matches.separator, this.PATTERN_DECIMAL.replace(modifiers, ''), foldedIndent);
      if (matches.type != null) {
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        return Inline.parseScalar(matches.type + ' ' + val);
      } else {
        return val;
      }
    }
    if ((ref1 = value.charAt(0)) === '[' || ref1 === '{' || ref1 === '"' || ref1 === "'") {
      while (true) {
        try {
          return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
        } catch (error) {
          e = error;
          if (e instanceof ParseMore && this.moveToNextLine()) {
            value += "\n" + Utils.trim(this.currentLine, ' ');
          } else {
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
      }
    } else {
      if (this.isNextLineIndented()) {
        value += "\n" + this.getNextEmbedBlock();
      }
      return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
    }
  };

  Parser.prototype.parseFoldedScalar = function(separator, indicator, indentation) {
    var isCurrentLineBlank, j, len, line, matches, newText, notEOF, pattern, ref, text;
    if (indicator == null) {
      indicator = '';
    }
    if (indentation == null) {
      indentation = 0;
    }
    notEOF = this.moveToNextLine();
    if (!notEOF) {
      return '';
    }
    isCurrentLineBlank = this.isCurrentLineBlank();
    text = '';
    while (notEOF && isCurrentLineBlank) {
      if (notEOF = this.moveToNextLine()) {
        text += "\n";
        isCurrentLineBlank = this.isCurrentLineBlank();
      }
    }
    if (0 === indentation) {
      if (matches = this.PATTERN_INDENT_SPACES.exec(this.currentLine)) {
        indentation = matches[0].length;
      }
    }
    if (indentation > 0) {
      pattern = this.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation];
      if (pattern == null) {
        pattern = new Pattern('^ {' + indentation + '}(.*)$');
        Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation] = pattern;
      }
      while (notEOF && (isCurrentLineBlank || (matches = pattern.exec(this.currentLine)))) {
        if (isCurrentLineBlank) {
          text += this.currentLine.slice(indentation);
        } else {
          text += matches[1];
        }
        if (notEOF = this.moveToNextLine()) {
          text += "\n";
          isCurrentLineBlank = this.isCurrentLineBlank();
        }
      }
    } else if (notEOF) {
      text += "\n";
    }
    if (notEOF) {
      this.moveToPreviousLine();
    }
    if ('>' === separator) {
      newText = '';
      ref = text.split("\n");
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        if (line.length === 0 || line.charAt(0) === ' ') {
          newText = Utils.rtrim(newText, ' ') + line + "\n";
        } else {
          newText += line + ' ';
        }
      }
      text = newText;
    }
    if ('+' !== indicator) {
      text = Utils.rtrim(text);
    }
    if ('' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, "\n");
    } else if ('-' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, '');
    }
    return text;
  };

  Parser.prototype.isNextLineIndented = function(ignoreComments) {
    var EOF, currentIndentation, ret;
    if (ignoreComments == null) {
      ignoreComments = true;
    }
    currentIndentation = this.getCurrentLineIndentation();
    EOF = !this.moveToNextLine();
    if (ignoreComments) {
      while (!EOF && this.isCurrentLineEmpty()) {
        EOF = !this.moveToNextLine();
      }
    } else {
      while (!EOF && this.isCurrentLineBlank()) {
        EOF = !this.moveToNextLine();
      }
    }
    if (EOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() > currentIndentation) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isCurrentLineEmpty = function() {
    var trimmedLine;
    trimmedLine = Utils.trim(this.currentLine, ' ');
    return trimmedLine.length === 0 || trimmedLine.charAt(0) === '#';
  };

  Parser.prototype.isCurrentLineBlank = function() {
    return '' === Utils.trim(this.currentLine, ' ');
  };

  Parser.prototype.isCurrentLineComment = function() {
    var ltrimmedLine;
    ltrimmedLine = Utils.ltrim(this.currentLine, ' ');
    return ltrimmedLine.charAt(0) === '#';
  };

  Parser.prototype.cleanup = function(value) {
    var count, i, indent, j, l, len, len1, line, lines, ref, ref1, ref2, smallestIndent, trimmedValue;
    if (value.indexOf("\r") !== -1) {
      value = value.split("\r\n").join("\n").split("\r").join("\n");
    }
    count = 0;
    ref = this.PATTERN_YAML_HEADER.replaceAll(value, ''), value = ref[0], count = ref[1];
    this.offset += count;
    ref1 = this.PATTERN_LEADING_COMMENTS.replaceAll(value, '', 1), trimmedValue = ref1[0], count = ref1[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
    }
    ref2 = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(value, '', 1), trimmedValue = ref2[0], count = ref2[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
      value = this.PATTERN_DOCUMENT_MARKER_END.replace(value, '');
    }
    lines = value.split("\n");
    smallestIndent = -1;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (Utils.trim(line, ' ').length === 0) {
        continue;
      }
      indent = line.length - Utils.ltrim(line).length;
      if (smallestIndent === -1 || indent < smallestIndent) {
        smallestIndent = indent;
      }
    }
    if (smallestIndent > 0) {
      for (i = l = 0, len1 = lines.length; l < len1; i = ++l) {
        line = lines[i];
        lines[i] = line.slice(smallestIndent);
      }
      value = lines.join("\n");
    }
    return value;
  };

  Parser.prototype.isNextLineUnIndentedCollection = function(currentIndentation) {
    var notEOF, ret;
    if (currentIndentation == null) {
      currentIndentation = null;
    }
    if (currentIndentation == null) {
      currentIndentation = this.getCurrentLineIndentation();
    }
    notEOF = this.moveToNextLine();
    while (notEOF && this.isCurrentLineEmpty()) {
      notEOF = this.moveToNextLine();
    }
    if (false === notEOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() === currentIndentation && this.isStringUnIndentedCollectionItem(this.currentLine)) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isStringUnIndentedCollectionItem = function() {
    return this.currentLine === '-' || this.currentLine.slice(0, 2) === '- ';
  };

  return Parser;

})();

module.exports = Parser;


},{"./Exception/ParseException":4,"./Exception/ParseMore":5,"./Inline":6,"./Pattern":8,"./Utils":10}],8:[function(require,module,exports){
var Pattern;

Pattern = (function() {
  Pattern.prototype.regex = null;

  Pattern.prototype.rawRegex = null;

  Pattern.prototype.cleanedRegex = null;

  Pattern.prototype.mapping = null;

  function Pattern(rawRegex, modifiers) {
    var _char, capturingBracketNumber, cleanedRegex, i, len, mapping, name, part, subChar;
    if (modifiers == null) {
      modifiers = '';
    }
    cleanedRegex = '';
    len = rawRegex.length;
    mapping = null;
    capturingBracketNumber = 0;
    i = 0;
    while (i < len) {
      _char = rawRegex.charAt(i);
      if (_char === '\\') {
        cleanedRegex += rawRegex.slice(i, +(i + 1) + 1 || 9e9);
        i++;
      } else if (_char === '(') {
        if (i < len - 2) {
          part = rawRegex.slice(i, +(i + 2) + 1 || 9e9);
          if (part === '(?:') {
            i += 2;
            cleanedRegex += part;
          } else if (part === '(?<') {
            capturingBracketNumber++;
            i += 2;
            name = '';
            while (i + 1 < len) {
              subChar = rawRegex.charAt(i + 1);
              if (subChar === '>') {
                cleanedRegex += '(';
                i++;
                if (name.length > 0) {
                  if (mapping == null) {
                    mapping = {};
                  }
                  mapping[name] = capturingBracketNumber;
                }
                break;
              } else {
                name += subChar;
              }
              i++;
            }
          } else {
            cleanedRegex += _char;
            capturingBracketNumber++;
          }
        } else {
          cleanedRegex += _char;
        }
      } else {
        cleanedRegex += _char;
      }
      i++;
    }
    this.rawRegex = rawRegex;
    this.cleanedRegex = cleanedRegex;
    this.regex = new RegExp(this.cleanedRegex, 'g' + modifiers.replace('g', ''));
    this.mapping = mapping;
  }

  Pattern.prototype.exec = function(str) {
    var index, matches, name, ref;
    this.regex.lastIndex = 0;
    matches = this.regex.exec(str);
    if (matches == null) {
      return null;
    }
    if (this.mapping != null) {
      ref = this.mapping;
      for (name in ref) {
        index = ref[name];
        matches[name] = matches[index];
      }
    }
    return matches;
  };

  Pattern.prototype.test = function(str) {
    this.regex.lastIndex = 0;
    return this.regex.test(str);
  };

  Pattern.prototype.replace = function(str, replacement) {
    this.regex.lastIndex = 0;
    return str.replace(this.regex, replacement);
  };

  Pattern.prototype.replaceAll = function(str, replacement, limit) {
    var count;
    if (limit == null) {
      limit = 0;
    }
    this.regex.lastIndex = 0;
    count = 0;
    while (this.regex.test(str) && (limit === 0 || count < limit)) {
      this.regex.lastIndex = 0;
      str = str.replace(this.regex, replacement);
      count++;
    }
    return [str, count];
  };

  return Pattern;

})();

module.exports = Pattern;


},{}],9:[function(require,module,exports){
var Pattern, Unescaper, Utils;

Utils = require('./Utils');

Pattern = require('./Pattern');

Unescaper = (function() {
  function Unescaper() {}

  Unescaper.PATTERN_ESCAPED_CHARACTER = new Pattern('\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})');

  Unescaper.unescapeSingleQuotedString = function(value) {
    return value.replace(/\'\'/g, '\'');
  };

  Unescaper.unescapeDoubleQuotedString = function(value) {
    if (this._unescapeCallback == null) {
      this._unescapeCallback = (function(_this) {
        return function(str) {
          return _this.unescapeCharacter(str);
        };
      })(this);
    }
    return this.PATTERN_ESCAPED_CHARACTER.replace(value, this._unescapeCallback);
  };

  Unescaper.unescapeCharacter = function(value) {
    var ch;
    ch = String.fromCharCode;
    switch (value.charAt(1)) {
      case '0':
        return ch(0);
      case 'a':
        return ch(7);
      case 'b':
        return ch(8);
      case 't':
        return "\t";
      case "\t":
        return "\t";
      case 'n':
        return "\n";
      case 'v':
        return ch(11);
      case 'f':
        return ch(12);
      case 'r':
        return ch(13);
      case 'e':
        return ch(27);
      case ' ':
        return ' ';
      case '"':
        return '"';
      case '/':
        return '/';
      case '\\':
        return '\\';
      case 'N':
        return ch(0x0085);
      case '_':
        return ch(0x00A0);
      case 'L':
        return ch(0x2028);
      case 'P':
        return ch(0x2029);
      case 'x':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 2)));
      case 'u':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 4)));
      case 'U':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 8)));
      default:
        return '';
    }
  };

  return Unescaper;

})();

module.exports = Unescaper;


},{"./Pattern":8,"./Utils":10}],10:[function(require,module,exports){
var Pattern, Utils,
  hasProp = {}.hasOwnProperty;

Pattern = require('./Pattern');

Utils = (function() {
  function Utils() {}

  Utils.REGEX_LEFT_TRIM_BY_CHAR = {};

  Utils.REGEX_RIGHT_TRIM_BY_CHAR = {};

  Utils.REGEX_SPACES = /\s+/g;

  Utils.REGEX_DIGITS = /^\d+$/;

  Utils.REGEX_OCTAL = /[^0-7]/gi;

  Utils.REGEX_HEXADECIMAL = /[^a-f0-9]/gi;

  Utils.PATTERN_DATE = new Pattern('^' + '(?<year>[0-9][0-9][0-9][0-9])' + '-(?<month>[0-9][0-9]?)' + '-(?<day>[0-9][0-9]?)' + '(?:(?:[Tt]|[ \t]+)' + '(?<hour>[0-9][0-9]?)' + ':(?<minute>[0-9][0-9])' + ':(?<second>[0-9][0-9])' + '(?:\.(?<fraction>[0-9]*))?' + '(?:[ \t]*(?<tz>Z|(?<tz_sign>[-+])(?<tz_hour>[0-9][0-9]?)' + '(?::(?<tz_minute>[0-9][0-9]))?))?)?' + '$', 'i');

  Utils.LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

  Utils.trim = function(str, _char) {
    var regexLeft, regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexLeft, '').replace(regexRight, '');
  };

  Utils.ltrim = function(str, _char) {
    var regexLeft;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    return str.replace(regexLeft, '');
  };

  Utils.rtrim = function(str, _char) {
    var regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexRight, '');
  };

  Utils.isEmpty = function(value) {
    return !value || value === '' || value === '0' || (value instanceof Array && value.length === 0) || this.isEmptyObject(value);
  };

  Utils.isEmptyObject = function(value) {
    var k;
    return value instanceof Object && ((function() {
      var results;
      results = [];
      for (k in value) {
        if (!hasProp.call(value, k)) continue;
        results.push(k);
      }
      return results;
    })()).length === 0;
  };

  Utils.subStrCount = function(string, subString, start, length) {
    var c, i, j, len, ref, sublen;
    c = 0;
    string = '' + string;
    subString = '' + subString;
    if (start != null) {
      string = string.slice(start);
    }
    if (length != null) {
      string = string.slice(0, length);
    }
    len = string.length;
    sublen = subString.length;
    for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (subString === string.slice(i, sublen)) {
        c++;
        i += sublen - 1;
      }
    }
    return c;
  };

  Utils.isDigits = function(input) {
    this.REGEX_DIGITS.lastIndex = 0;
    return this.REGEX_DIGITS.test(input);
  };

  Utils.octDec = function(input) {
    this.REGEX_OCTAL.lastIndex = 0;
    return parseInt((input + '').replace(this.REGEX_OCTAL, ''), 8);
  };

  Utils.hexDec = function(input) {
    this.REGEX_HEXADECIMAL.lastIndex = 0;
    input = this.trim(input);
    if ((input + '').slice(0, 2) === '0x') {
      input = (input + '').slice(2);
    }
    return parseInt((input + '').replace(this.REGEX_HEXADECIMAL, ''), 16);
  };

  Utils.utf8chr = function(c) {
    var ch;
    ch = String.fromCharCode;
    if (0x80 > (c %= 0x200000)) {
      return ch(c);
    }
    if (0x800 > c) {
      return ch(0xC0 | c >> 6) + ch(0x80 | c & 0x3F);
    }
    if (0x10000 > c) {
      return ch(0xE0 | c >> 12) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
    }
    return ch(0xF0 | c >> 18) + ch(0x80 | c >> 12 & 0x3F) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
  };

  Utils.parseBoolean = function(input, strict) {
    var lowerInput;
    if (strict == null) {
      strict = true;
    }
    if (typeof input === 'string') {
      lowerInput = input.toLowerCase();
      if (!strict) {
        if (lowerInput === 'no') {
          return false;
        }
      }
      if (lowerInput === '0') {
        return false;
      }
      if (lowerInput === 'false') {
        return false;
      }
      if (lowerInput === '') {
        return false;
      }
      return true;
    }
    return !!input;
  };

  Utils.isNumeric = function(input) {
    this.REGEX_SPACES.lastIndex = 0;
    return typeof input === 'number' || typeof input === 'string' && !isNaN(input) && input.replace(this.REGEX_SPACES, '') !== '';
  };

  Utils.stringToDate = function(str) {
    var date, day, fraction, hour, info, minute, month, second, tz_hour, tz_minute, tz_offset, year;
    if (!(str != null ? str.length : void 0)) {
      return null;
    }
    info = this.PATTERN_DATE.exec(str);
    if (!info) {
      return null;
    }
    year = parseInt(info.year, 10);
    month = parseInt(info.month, 10) - 1;
    day = parseInt(info.day, 10);
    if (info.hour == null) {
      date = new Date(Date.UTC(year, month, day));
      return date;
    }
    hour = parseInt(info.hour, 10);
    minute = parseInt(info.minute, 10);
    second = parseInt(info.second, 10);
    if (info.fraction != null) {
      fraction = info.fraction.slice(0, 3);
      while (fraction.length < 3) {
        fraction += '0';
      }
      fraction = parseInt(fraction, 10);
    } else {
      fraction = 0;
    }
    if (info.tz != null) {
      tz_hour = parseInt(info.tz_hour, 10);
      if (info.tz_minute != null) {
        tz_minute = parseInt(info.tz_minute, 10);
      } else {
        tz_minute = 0;
      }
      tz_offset = (tz_hour * 60 + tz_minute) * 60000;
      if ('-' === info.tz_sign) {
        tz_offset *= -1;
      }
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (tz_offset) {
      date.setTime(date.getTime() - tz_offset);
    }
    return date;
  };

  Utils.strRepeat = function(str, number) {
    var i, res;
    res = '';
    i = 0;
    while (i < number) {
      res += str;
      i++;
    }
    return res;
  };

  Utils.getStringFromFile = function(path, callback) {
    var data, fs, j, len1, name, ref, req, xhr;
    if (callback == null) {
      callback = null;
    }
    xhr = null;
    if (typeof window !== "undefined" && window !== null) {
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        ref = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          name = ref[j];
          try {
            xhr = new ActiveXObject(name);
          } catch (error) {}
        }
      }
    }
    if (xhr != null) {
      if (callback != null) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              return callback(xhr.responseText);
            } else {
              return callback(null);
            }
          }
        };
        xhr.open('GET', path, true);
        return xhr.send(null);
      } else {
        xhr.open('GET', path, false);
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          return xhr.responseText;
        }
        return null;
      }
    } else {
      req = require;
      fs = req('fs');
      if (callback != null) {
        return fs.readFile(path, function(err, data) {
          if (err) {
            return callback(null);
          } else {
            return callback(String(data));
          }
        });
      } else {
        data = fs.readFileSync(path);
        if (data != null) {
          return String(data);
        }
        return null;
      }
    }
  };

  return Utils;

})();

module.exports = Utils;


},{"./Pattern":8}],11:[function(require,module,exports){
var Dumper, Parser, Utils, Yaml;

Parser = require('./Parser');

Dumper = require('./Dumper');

Utils = require('./Utils');

Yaml = (function() {
  function Yaml() {}

  Yaml.parse = function(input, exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    return new Parser().parse(input, exceptionOnInvalidType, objectDecoder);
  };

  Yaml.parseFile = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    var input;
    if (callback == null) {
      callback = null;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    if (callback != null) {
      return Utils.getStringFromFile(path, (function(_this) {
        return function(input) {
          var result;
          result = null;
          if (input != null) {
            result = _this.parse(input, exceptionOnInvalidType, objectDecoder);
          }
          callback(result);
        };
      })(this));
    } else {
      input = Utils.getStringFromFile(path);
      if (input != null) {
        return this.parse(input, exceptionOnInvalidType, objectDecoder);
      }
      return null;
    }
  };

  Yaml.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var yaml;
    if (inline == null) {
      inline = 2;
    }
    if (indent == null) {
      indent = 4;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    yaml = new Dumper();
    yaml.indentation = indent;
    return yaml.dump(input, inline, 0, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.stringify = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    return this.dump(input, inline, indent, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.load = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    return this.parseFile(path, callback, exceptionOnInvalidType, objectDecoder);
  };

  return Yaml;

})();

if (typeof window !== "undefined" && window !== null) {
  window.YAML = Yaml;
}

if (typeof window === "undefined" || window === null) {
  this.YAML = Yaml;
}

module.exports = Yaml;


},{"./Dumper":1,"./Parser":7,"./Utils":10}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9EdW1wZXIuY29mZmVlIiwic3JjL0VzY2FwZXIuY29mZmVlIiwic3JjL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uLmNvZmZlZSIsInNyYy9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24uY29mZmVlIiwic3JjL0V4Y2VwdGlvbi9QYXJzZU1vcmUuY29mZmVlIiwic3JjL0lubGluZS5jb2ZmZWUiLCJzcmMvUGFyc2VyLmNvZmZlZSIsInNyYy9QYXR0ZXJuLmNvZmZlZSIsInNyYy9VbmVzY2FwZXIuY29mZmVlIiwic3JjL1V0aWxzLmNvZmZlZSIsInNyYy9ZYW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUE7O0FBQUEsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFJSjs7O0VBR0YsTUFBQyxDQUFBLFdBQUQsR0FBZ0I7O21CQWFoQixJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsTUFBUixFQUFvQixNQUFwQixFQUFnQyxzQkFBaEMsRUFBZ0UsYUFBaEU7QUFDRixRQUFBOztNQURVLFNBQVM7OztNQUFHLFNBQVM7OztNQUFHLHlCQUF5Qjs7O01BQU8sZ0JBQWdCOztJQUNsRixNQUFBLEdBQVM7SUFFVCxJQUFHLE9BQU8sS0FBUCxLQUFpQixVQUFwQjtBQUNJLGFBQU8sT0FEWDs7SUFHQSxNQUFBLEdBQVMsQ0FBSSxNQUFILEdBQWUsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEIsRUFBcUIsTUFBckIsQ0FBZixHQUFpRCxFQUFsRDtJQUVULElBQUcsTUFBQSxJQUFVLENBQVYsSUFBZSxPQUFPLEtBQVAsS0FBbUIsUUFBbEMsSUFBOEMsS0FBQSxZQUFpQixJQUEvRCxJQUF1RSxLQUFLLENBQUMs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SUFBRCxHQUFPLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsc0JBQWpCLEVBQXlDLGFBQXpDO0FBQ0gsV0FBTyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsUUFBakIsRUFBMkIsc0JBQTNCLEVBQW1ELGFBQW5EO0VBREo7Ozs7Ozs7RUFLWCxNQUFNLENBQUUsSUFBUixHQUFlOzs7QUFHZixJQUFPLGdEQUFQO0VBQ0ksSUFBQyxDQUFBLElBQUQsR0FBUSxLQURaOzs7QUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuVXRpbHMgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5JbmxpbmUgID0gcmVxdWlyZSAnLi9JbmxpbmUnXG5cbiMgRHVtcGVyIGR1bXBzIEphdmFTY3JpcHQgdmFyaWFibGVzIHRvIFlBTUwgc3RyaW5ncy5cbiNcbmNsYXNzIER1bXBlclxuXG4gICAgIyBUaGUgYW1vdW50IG9mIHNwYWNlcyB0byB1c2UgZm9yIGluZGVudGF0aW9uIG9mIG5lc3RlZCBub2Rlcy5cbiAgICBAaW5kZW50YXRpb246ICAgNFxuXG5cbiAgICAjIER1bXBzIGEgSmF2YVNjcmlwdCB2YWx1ZSB0byBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIFRoZSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmxpbmUgICAgICAgICAgICAgICAgICBUaGUgbGV2ZWwgd2hlcmUgeW91IHN3aXRjaCB0byBpbmxpbmUgWUFNTFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5kZW50ICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIG9mIGluZGVudGF0aW9uICh1c2VkIGludGVybmFsbHkpXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3RFbmNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIHNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgWUFNTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICBkdW1wOiAoaW5wdXQsIGlubGluZSA9IDAsIGluZGVudCA9IDAsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIG91dHB1dCA9ICcnXG4gICAgICAgIFxuICAgICAgICBpZiB0eXBlb2YoaW5wdXQpIGlzICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXRcbiAgICAgICAgXG4gICAgICAgIHByZWZpeCA9IChpZiBpbmRlbnQgdGhlbiBVdGlscy5zdHJSZXBlYXQoJyAnLCBpbmRlbnQpIGVsc2UgJycpXG5cbiAgICAgICAgaWYgaW5saW5lIDw9IDAgb3IgdHlwZW9mKGlucHV0KSBpc250ICdvYmplY3QnIG9yIGlucHV0IGluc3RhbmNlb2YgRGF0ZSBvciBVdGlscy5pc0VtcHR5KGlucHV0KVxuICAgICAgICAgICAgb3V0cHV0ICs9IHByZWZpeCArIElubGluZS5kdW1wKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKVxuICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgaW5wdXQgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIGZvciB2YWx1ZSBpbiBpbnB1dFxuICAgICAgICAgICAgICAgICAgICB3aWxsQmVJbmxpbmVkID0gKGlubGluZSAtIDEgPD0gMCBvciB0eXBlb2YodmFsdWUpIGlzbnQgJ29iamVjdCcgb3IgVXRpbHMuaXNFbXB0eSh2YWx1ZSkpXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggK1xuICAgICAgICAgICAgICAgICAgICAgICAgJy0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBAZHVtcCh2YWx1ZSwgaW5saW5lIC0gMSwgKGlmIHdpbGxCZUlubGluZWQgdGhlbiAwIGVsc2UgaW5kZW50ICsgQGluZGVudGF0aW9uKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHdpbGxCZUlubGluZWQgdGhlbiBcIlxcblwiIGVsc2UgJycpXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBpbnB1dFxuICAgICAgICAgICAgICAgICAgICB3aWxsQmVJbmxpbmVkID0gKGlubGluZSAtIDEgPD0gMCBvciB0eXBlb2YodmFsdWUpIGlzbnQgJ29iamVjdCcgb3IgVXRpbHMuaXNFbXB0eSh2YWx1ZSkpXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggK1xuICAgICAgICAgICAgICAgICAgICAgICAgSW5saW5lLmR1bXAoa2V5LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuICcgJyBlbHNlIFwiXFxuXCIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIEBkdW1wKHZhbHVlLCBpbmxpbmUgLSAxLCAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIDAgZWxzZSBpbmRlbnQgKyBAaW5kZW50YXRpb24pLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIFwiXFxuXCIgZWxzZSAnJylcblxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEdW1wZXJcbiIsIlxuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBFc2NhcGVyIGVuY2Fwc3VsYXRlcyBlc2NhcGluZyBydWxlcyBmb3Igc2luZ2xlXG4jIGFuZCBkb3VibGUtcXVvdGVkIFlBTUwgc3RyaW5ncy5cbmNsYXNzIEVzY2FwZXJcblxuICAgICMgTWFwcGluZyBhcnJheXMgZm9yIGVzY2FwaW5nIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuIFRoZSBiYWNrc2xhc2ggaXNcbiAgICAjIGZpcnN0IHRvIGVuc3VyZSBwcm9wZXIgZXNjYXBpbmcuXG4gICAgQExJU1RfRVNDQVBFRVM6ICAgICAgICAgICAgICAgICBbJ1xcXFwnLCAnXFxcXFxcXFwnLCAnXFxcXFwiJywgJ1wiJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDAwXCIsICBcIlxceDAxXCIsICBcIlxceDAyXCIsICBcIlxceDAzXCIsICBcIlxceDA0XCIsICBcIlxceDA1XCIsICBcIlxceDA2XCIsICBcIlxceDA3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgwOFwiLCAgXCJcXHgwOVwiLCAgXCJcXHgwYVwiLCAgXCJcXHgwYlwiLCAgXCJcXHgwY1wiLCAgXCJcXHgwZFwiLCAgXCJcXHgwZVwiLCAgXCJcXHgwZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MTBcIiwgIFwiXFx4MTFcIiwgIFwiXFx4MTJcIiwgIFwiXFx4MTNcIiwgIFwiXFx4MTRcIiwgIFwiXFx4MTVcIiwgIFwiXFx4MTZcIiwgIFwiXFx4MTdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDE4XCIsICBcIlxceDE5XCIsICBcIlxceDFhXCIsICBcIlxceDFiXCIsICBcIlxceDFjXCIsICBcIlxceDFkXCIsICBcIlxceDFlXCIsICBcIlxceDFmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNoID0gU3RyaW5nLmZyb21DaGFyQ29kZSkoMHgwMDg1KSwgY2goMHgwMEEwKSwgY2goMHgyMDI4KSwgY2goMHgyMDI5KV1cbiAgICBATElTVF9FU0NBUEVEOiAgICAgICAgICAgICAgICAgIFsnXFxcXFxcXFwnLCAnXFxcXFwiJywgJ1xcXFxcIicsICdcXFxcXCInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXDBcIiwgICBcIlxcXFx4MDFcIiwgXCJcXFxceDAyXCIsIFwiXFxcXHgwM1wiLCBcIlxcXFx4MDRcIiwgXCJcXFxceDA1XCIsIFwiXFxcXHgwNlwiLCBcIlxcXFxhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcYlwiLCAgIFwiXFxcXHRcIiwgICBcIlxcXFxuXCIsICAgXCJcXFxcdlwiLCAgIFwiXFxcXGZcIiwgICBcIlxcXFxyXCIsICAgXCJcXFxceDBlXCIsIFwiXFxcXHgwZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXHgxMFwiLCBcIlxcXFx4MTFcIiwgXCJcXFxceDEyXCIsIFwiXFxcXHgxM1wiLCBcIlxcXFx4MTRcIiwgXCJcXFxceDE1XCIsIFwiXFxcXHgxNlwiLCBcIlxcXFx4MTdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFx4MThcIiwgXCJcXFxceDE5XCIsIFwiXFxcXHgxYVwiLCBcIlxcXFxlXCIsICAgXCJcXFxceDFjXCIsIFwiXFxcXHgxZFwiLCBcIlxcXFx4MWVcIiwgXCJcXFxceDFmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcTlwiLCBcIlxcXFxfXCIsIFwiXFxcXExcIiwgXCJcXFxcUFwiXVxuXG4gICAgQE1BUFBJTkdfRVNDQVBFRVNfVE9fRVNDQVBFRDogICBkbyA9PlxuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5ATElTVF9FU0NBUEVFUy5sZW5ndGhdXG4gICAgICAgICAgICBtYXBwaW5nW0BMSVNUX0VTQ0FQRUVTW2ldXSA9IEBMSVNUX0VTQ0FQRURbaV1cbiAgICAgICAgcmV0dXJuIG1hcHBpbmdcblxuICAgICMgQ2hhcmFjdGVycyB0aGF0IHdvdWxkIGNhdXNlIGEgZHVtcGVkIHN0cmluZyB0byByZXF1aXJlIGRvdWJsZSBxdW90aW5nLlxuICAgIEBQQVRURVJOX0NIQVJBQ1RFUlNfVE9fRVNDQVBFOiAgbmV3IFBhdHRlcm4gJ1tcXFxceDAwLVxcXFx4MWZdfFxceGMyXFx4ODV8XFx4YzJcXHhhMHxcXHhlMlxceDgwXFx4YTh8XFx4ZTJcXHg4MFxceGE5J1xuXG4gICAgIyBPdGhlciBwcmVjb21waWxlZCBwYXR0ZXJuc1xuICAgIEBQQVRURVJOX01BUFBJTkdfRVNDQVBFRVM6ICAgICAgbmV3IFBhdHRlcm4gQExJU1RfRVNDQVBFRVMuam9pbignfCcpLnNwbGl0KCdcXFxcJykuam9pbignXFxcXFxcXFwnKVxuICAgIEBQQVRURVJOX1NJTkdMRV9RVU9USU5HOiAgICAgICAgbmV3IFBhdHRlcm4gJ1tcXFxcc1xcJ1wiOnt9W1xcXFxdLCYqIz9dfF5bLT98PD49ISVAYF0nXG5cblxuXG4gICAgIyBEZXRlcm1pbmVzIGlmIGEgSmF2YVNjcmlwdCB2YWx1ZSB3b3VsZCByZXF1aXJlIGRvdWJsZSBxdW90aW5nIGluIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWUgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlICAgIGlmIHRoZSB2YWx1ZSB3b3VsZCByZXF1aXJlIGRvdWJsZSBxdW90ZXMuXG4gICAgI1xuICAgIEByZXF1aXJlc0RvdWJsZVF1b3Rpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX0NIQVJBQ1RFUlNfVE9fRVNDQVBFLnRlc3QgdmFsdWVcblxuXG4gICAgIyBFc2NhcGVzIGFuZCBzdXJyb3VuZHMgYSBKYXZhU2NyaXB0IHZhbHVlIHdpdGggZG91YmxlIHF1b3Rlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBxdW90ZWQsIGVzY2FwZWQgc3RyaW5nXG4gICAgI1xuICAgIEBlc2NhcGVXaXRoRG91YmxlUXVvdGVzOiAodmFsdWUpIC0+XG4gICAgICAgIHJlc3VsdCA9IEBQQVRURVJOX01BUFBJTkdfRVNDQVBFRVMucmVwbGFjZSB2YWx1ZSwgKHN0cikgPT5cbiAgICAgICAgICAgIHJldHVybiBATUFQUElOR19FU0NBUEVFU19UT19FU0NBUEVEW3N0cl1cbiAgICAgICAgcmV0dXJuICdcIicrcmVzdWx0KydcIidcblxuXG4gICAgIyBEZXRlcm1pbmVzIGlmIGEgSmF2YVNjcmlwdCB2YWx1ZSB3b3VsZCByZXF1aXJlIHNpbmdsZSBxdW90aW5nIGluIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSB2YWx1ZSB3b3VsZCByZXF1aXJlIHNpbmdsZSBxdW90ZXMuXG4gICAgI1xuICAgIEByZXF1aXJlc1NpbmdsZVF1b3Rpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX1NJTkdMRV9RVU9USU5HLnRlc3QgdmFsdWVcblxuXG4gICAgIyBFc2NhcGVzIGFuZCBzdXJyb3VuZHMgYSBKYXZhU2NyaXB0IHZhbHVlIHdpdGggc2luZ2xlIHF1b3Rlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBxdW90ZWQsIGVzY2FwZWQgc3RyaW5nXG4gICAgI1xuICAgIEBlc2NhcGVXaXRoU2luZ2xlUXVvdGVzOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBcIidcIit2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIikrXCInXCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVzY2FwZXJcbiIsIlxuY2xhc3MgRHVtcEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPER1bXBFeGNlcHRpb24+ICcgKyBAbWVzc2FnZSArICcgKGxpbmUgJyArIEBwYXJzZWRMaW5lICsgJzogXFwnJyArIEBzbmlwcGV0ICsgJ1xcJyknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAnPER1bXBFeGNlcHRpb24+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IER1bXBFeGNlcHRpb25cbiIsIlxuY2xhc3MgUGFyc2VFeGNlcHRpb24gZXh0ZW5kcyBFcnJvclxuXG4gICAgY29uc3RydWN0b3I6IChAbWVzc2FnZSwgQHBhcnNlZExpbmUsIEBzbmlwcGV0KSAtPlxuXG4gICAgdG9TdHJpbmc6IC0+XG4gICAgICAgIGlmIEBwYXJzZWRMaW5lPyBhbmQgQHNuaXBwZXQ/XG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZUV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8UGFyc2VFeGNlcHRpb24+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlRXhjZXB0aW9uXG4iLCJcbmNsYXNzIFBhcnNlTW9yZSBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPFBhcnNlTW9yZT4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8UGFyc2VNb3JlPiAnICsgQG1lc3NhZ2VcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZU1vcmVcbiIsIlxuUGF0dGVybiAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuVW5lc2NhcGVyICAgICAgID0gcmVxdWlyZSAnLi9VbmVzY2FwZXInXG5Fc2NhcGVyICAgICAgICAgPSByZXF1aXJlICcuL0VzY2FwZXInXG5VdGlscyAgICAgICAgICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuUGFyc2VFeGNlcHRpb24gID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24nXG5QYXJzZU1vcmUgICAgICAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9QYXJzZU1vcmUnXG5EdW1wRXhjZXB0aW9uICAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uJ1xuXG4jIElubGluZSBZQU1MIHBhcnNpbmcgYW5kIGR1bXBpbmdcbmNsYXNzIElubGluZVxuXG4gICAgIyBRdW90ZWQgc3RyaW5nIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgIEBSRUdFWF9RVU9URURfU1RSSU5HOiAgICAgICAgICAgICAgICcoPzpcIig/OlteXCJcXFxcXFxcXF0qKD86XFxcXFxcXFwuW15cIlxcXFxcXFxcXSopKilcInxcXCcoPzpbXlxcJ10qKD86XFwnXFwnW15cXCddKikqKVxcJyknXG5cbiAgICAjIFByZS1jb21waWxlZCBwYXR0ZXJuc1xuICAgICNcbiAgICBAUEFUVEVSTl9UUkFJTElOR19DT01NRU5UUzogICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFxzKiMuKiQnXG4gICAgQFBBVFRFUk5fUVVPVEVEX1NDQUxBUjogICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14nK0BSRUdFWF9RVU9URURfU1RSSU5HXG4gICAgQFBBVFRFUk5fVEhPVVNBTkRfTlVNRVJJQ19TQ0FMQVI6ICAgbmV3IFBhdHRlcm4gJ14oLXxcXFxcKyk/WzAtOSxdKyhcXFxcLlswLTldKyk/JCdcbiAgICBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSUzogICAgICB7fVxuXG4gICAgIyBTZXR0aW5nc1xuICAgIEBzZXR0aW5nczoge31cblxuXG4gICAgIyBDb25maWd1cmUgWUFNTCBpbmxpbmUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgQGNvbmZpZ3VyZTogKGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBudWxsLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgIyBVcGRhdGUgc2V0dGluZ3NcbiAgICAgICAgQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBleGNlcHRpb25PbkludmFsaWRUeXBlXG4gICAgICAgIEBzZXR0aW5ncy5vYmplY3REZWNvZGVyID0gb2JqZWN0RGVjb2RlclxuICAgICAgICByZXR1cm5cblxuXG4gICAgIyBDb252ZXJ0cyBhIFlBTUwgc3RyaW5nIHRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBBIEphdmFTY3JpcHQgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXVxuICAgICNcbiAgICBAcGFyc2U6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgIyBVcGRhdGUgc2V0dGluZ3MgZnJvbSBsYXN0IGNhbGwgb2YgSW5saW5lLnBhcnNlKClcbiAgICAgICAgQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBleGNlcHRpb25PbkludmFsaWRUeXBlXG4gICAgICAgIEBzZXR0aW5ncy5vYmplY3REZWNvZGVyID0gb2JqZWN0RGVjb2RlclxuXG4gICAgICAgIGlmIG5vdCB2YWx1ZT9cbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgIHZhbHVlID0gVXRpbHMudHJpbSB2YWx1ZVxuXG4gICAgICAgIGlmIDAgaXMgdmFsdWUubGVuZ3RoXG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICAjIEtlZXAgYSBjb250ZXh0IG9iamVjdCB0byBwYXNzIHRocm91Z2ggc3RhdGljIG1ldGhvZHNcbiAgICAgICAgY29udGV4dCA9IHtleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyLCBpOiAwfVxuXG4gICAgICAgIHN3aXRjaCB2YWx1ZS5jaGFyQXQoMClcbiAgICAgICAgICAgIHdoZW4gJ1snXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlU2VxdWVuY2UgdmFsdWUsIGNvbnRleHRcbiAgICAgICAgICAgICAgICArK2NvbnRleHQuaVxuICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2VNYXBwaW5nIHZhbHVlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgKytjb250ZXh0LmlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2VTY2FsYXIgdmFsdWUsIG51bGwsIFsnXCInLCBcIidcIl0sIGNvbnRleHRcblxuICAgICAgICAjIFNvbWUgY29tbWVudHMgYXJlIGFsbG93ZWQgYXQgdGhlIGVuZFxuICAgICAgICBpZiBAUEFUVEVSTl9UUkFJTElOR19DT01NRU5UUy5yZXBsYWNlKHZhbHVlW2NvbnRleHQuaS4uXSwgJycpIGlzbnQgJydcbiAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5leHBlY3RlZCBjaGFyYWN0ZXJzIG5lYXIgXCInK3ZhbHVlW2NvbnRleHQuaS4uXSsnXCIuJ1xuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuXG4gICAgIyBEdW1wcyBhIGdpdmVuIEphdmFTY3JpcHQgdmFyaWFibGUgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBUaGUgSmF2YVNjcmlwdCB2YXJpYWJsZSB0byBjb252ZXJ0XG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3RFbmNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIHNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgWUFNTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICAjIEB0aHJvdyBbRHVtcEV4Y2VwdGlvbl1cbiAgICAjXG4gICAgQGR1bXA6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3RFbmNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgaWYgbm90IHZhbHVlP1xuICAgICAgICAgICAgcmV0dXJuICdudWxsJ1xuICAgICAgICB0eXBlID0gdHlwZW9mIHZhbHVlXG4gICAgICAgIGlmIHR5cGUgaXMgJ29iamVjdCdcbiAgICAgICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgRGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICBlbHNlIGlmIG9iamVjdEVuY29kZXI/XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gb2JqZWN0RW5jb2RlciB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIHR5cGVvZiByZXN1bHQgaXMgJ3N0cmluZycgb3IgcmVzdWx0P1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgICByZXR1cm4gQGR1bXBPYmplY3QgdmFsdWVcbiAgICAgICAgaWYgdHlwZSBpcyAnYm9vbGVhbidcbiAgICAgICAgICAgIHJldHVybiAoaWYgdmFsdWUgdGhlbiAndHJ1ZScgZWxzZSAnZmFsc2UnKVxuICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyh2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAoaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiJ1wiK3ZhbHVlK1wiJ1wiIGVsc2UgU3RyaW5nKHBhcnNlSW50KHZhbHVlKSkpXG4gICAgICAgIGlmIFV0aWxzLmlzTnVtZXJpYyh2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAoaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiJ1wiK3ZhbHVlK1wiJ1wiIGVsc2UgU3RyaW5nKHBhcnNlRmxvYXQodmFsdWUpKSlcbiAgICAgICAgaWYgdHlwZSBpcyAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIChpZiB2YWx1ZSBpcyBJbmZpbml0eSB0aGVuICcuSW5mJyBlbHNlIChpZiB2YWx1ZSBpcyAtSW5maW5pdHkgdGhlbiAnLS5JbmYnIGVsc2UgKGlmIGlzTmFOKHZhbHVlKSB0aGVuICcuTmFOJyBlbHNlIHZhbHVlKSkpXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNEb3VibGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoRG91YmxlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNTaW5nbGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoU2luZ2xlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmICcnIGlzIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gJ1wiXCInXG4gICAgICAgIGlmIFV0aWxzLlBBVFRFUk5fREFURS50ZXN0IHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCI7XG4gICAgICAgIGlmIHZhbHVlLnRvTG93ZXJDYXNlKCkgaW4gWydudWxsJywnficsJ3RydWUnLCdmYWxzZSddXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCJcbiAgICAgICAgIyBEZWZhdWx0XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgdmFsdWUgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgb2JqZWN0IHRvIGR1bXBcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gZG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gc3RyaW5nIFRoZSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wT2JqZWN0OiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdFN1cHBvcnQgPSBudWxsKSAtPlxuICAgICAgICAjIEFycmF5XG4gICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAgdmFsXG4gICAgICAgICAgICByZXR1cm4gJ1snK291dHB1dC5qb2luKCcsICcpKyddJ1xuXG4gICAgICAgICMgTWFwcGluZ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRwdXQgPSBbXVxuICAgICAgICAgICAgZm9yIGtleSwgdmFsIG9mIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAoa2V5KSsnOiAnK0BkdW1wKHZhbClcbiAgICAgICAgICAgIHJldHVybiAneycrb3V0cHV0LmpvaW4oJywgJykrJ30nXG5cblxuICAgICMgUGFyc2VzIGEgc2NhbGFyIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgc2NhbGFyXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBkZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBzdHJpbmdEZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBldmFsdWF0ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNjYWxhcjogKHNjYWxhciwgZGVsaW1pdGVycyA9IG51bGwsIHN0cmluZ0RlbGltaXRlcnMgPSBbJ1wiJywgXCInXCJdLCBjb250ZXh0ID0gbnVsbCwgZXZhbHVhdGUgPSB0cnVlKSAtPlxuICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIGlmIHNjYWxhci5jaGFyQXQoaSkgaW4gc3RyaW5nRGVsaW1pdGVyc1xuICAgICAgICAgICAgIyBRdW90ZWQgc2NhbGFyXG4gICAgICAgICAgICBvdXRwdXQgPSBAcGFyc2VRdW90ZWRTY2FsYXIgc2NhbGFyLCBjb250ZXh0XG4gICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgIGlmIGRlbGltaXRlcnM/XG4gICAgICAgICAgICAgICAgdG1wID0gVXRpbHMubHRyaW0gc2NhbGFyW2kuLl0sICcgJ1xuICAgICAgICAgICAgICAgIGlmIG5vdCh0bXAuY2hhckF0KDApIGluIGRlbGltaXRlcnMpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5leHBlY3RlZCBjaGFyYWN0ZXJzICgnK3NjYWxhcltpLi5dKycpLidcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIFwibm9ybWFsXCIgc3RyaW5nXG4gICAgICAgICAgICBpZiBub3QgZGVsaW1pdGVyc1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgaSArPSBvdXRwdXQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAjIFJlbW92ZSBjb21tZW50c1xuICAgICAgICAgICAgICAgIHN0cnBvcyA9IG91dHB1dC5pbmRleE9mICcgIydcbiAgICAgICAgICAgICAgICBpZiBzdHJwb3MgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBVdGlscy5ydHJpbSBvdXRwdXRbMC4uLnN0cnBvc11cblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGpvaW5lZERlbGltaXRlcnMgPSBkZWxpbWl0ZXJzLmpvaW4oJ3wnKVxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSU1tqb2luZWREZWxpbWl0ZXJzXVxuICAgICAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFBhdHRlcm4gJ14oLis/KSgnK2pvaW5lZERlbGltaXRlcnMrJyknXG4gICAgICAgICAgICAgICAgICAgIEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTW2pvaW5lZERlbGltaXRlcnNdID0gcGF0dGVyblxuICAgICAgICAgICAgICAgIGlmIG1hdGNoID0gcGF0dGVybi5leGVjIHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gb3V0cHV0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICgnK3NjYWxhcisnKS4nXG5cblxuICAgICAgICAgICAgaWYgZXZhbHVhdGVcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBAZXZhbHVhdGVTY2FsYXIgb3V0cHV0LCBjb250ZXh0XG5cbiAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxuICAgICMgUGFyc2VzIGEgcXVvdGVkIHNjYWxhciB0byBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNjYWxhclxuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlTW9yZV0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VRdW90ZWRTY2FsYXI6IChzY2FsYXIsIGNvbnRleHQpIC0+XG4gICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICB1bmxlc3MgbWF0Y2ggPSBAUEFUVEVSTl9RVU9URURfU0NBTEFSLmV4ZWMgc2NhbGFyW2kuLl1cbiAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZU1vcmUgJ01hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgKCcrc2NhbGFyW2kuLl0rJykuJ1xuXG4gICAgICAgIG91dHB1dCA9IG1hdGNoWzBdLnN1YnN0cigxLCBtYXRjaFswXS5sZW5ndGggLSAyKVxuXG4gICAgICAgIGlmICdcIicgaXMgc2NhbGFyLmNoYXJBdChpKVxuICAgICAgICAgICAgb3V0cHV0ID0gVW5lc2NhcGVyLnVuZXNjYXBlRG91YmxlUXVvdGVkU3RyaW5nIG91dHB1dFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRwdXQgPSBVbmVzY2FwZXIudW5lc2NhcGVTaW5nbGVRdW90ZWRTdHJpbmcgb3V0cHV0XG5cbiAgICAgICAgaSArPSBtYXRjaFswXS5sZW5ndGhcblxuICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgIHJldHVybiBvdXRwdXRcblxuXG4gICAgIyBQYXJzZXMgYSBzZXF1ZW5jZSB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNlcXVlbmNlXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VNb3JlXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNlcXVlbmNlOiAoc2VxdWVuY2UsIGNvbnRleHQpIC0+XG4gICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgIGxlbiA9IHNlcXVlbmNlLmxlbmd0aFxuICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgIGkgKz0gMVxuXG4gICAgICAgICMgW2ZvbywgYmFyLCAuLi5dXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgIHN3aXRjaCBzZXF1ZW5jZS5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VTZXF1ZW5jZSBzZXF1ZW5jZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgbWFwcGluZ1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VNYXBwaW5nIHNlcXVlbmNlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICB3aGVuICddJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICAgICAgICAgICAgd2hlbiAnLCcsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAjIERvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlzUXVvdGVkID0gKHNlcXVlbmNlLmNoYXJBdChpKSBpbiBbJ1wiJywgXCInXCJdKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNjYWxhciBzZXF1ZW5jZSwgWycsJywgJ10nXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90KGlzUXVvdGVkKSBhbmQgdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyBhbmQgKHZhbHVlLmluZGV4T2YoJzogJykgaXNudCAtMSBvciB2YWx1ZS5pbmRleE9mKFwiOlxcblwiKSBpc250IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBFbWJlZGRlZCBtYXBwaW5nP1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VNYXBwaW5nICd7Jyt2YWx1ZSsnfSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5vLCBpdCdzIG5vdFxuXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgKytpXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlTW9yZSAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAnK3NlcXVlbmNlXG5cblxuICAgICMgUGFyc2VzIGEgbWFwcGluZyB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIG1hcHBpbmdcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZU1vcmVdIFdoZW4gbWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyBpcyBwYXJzZWRcbiAgICAjXG4gICAgQHBhcnNlTWFwcGluZzogKG1hcHBpbmcsIGNvbnRleHQpIC0+XG4gICAgICAgIG91dHB1dCA9IHt9XG4gICAgICAgIGxlbiA9IG1hcHBpbmcubGVuZ3RoXG4gICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgaSArPSAxXG5cbiAgICAgICAgIyB7Zm9vOiBiYXIsIGJhcjpmb28sIC4uLn1cbiAgICAgICAgc2hvdWxkQ29udGludWVXaGlsZUxvb3AgPSBmYWxzZVxuICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICBzd2l0Y2ggbWFwcGluZy5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuICcgJywgJywnLCBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZENvbnRpbnVlV2hpbGVMb29wID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHdoZW4gJ30nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXRcblxuICAgICAgICAgICAgaWYgc2hvdWxkQ29udGludWVXaGlsZUxvb3BcbiAgICAgICAgICAgICAgICBzaG91bGRDb250aW51ZVdoaWxlTG9vcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgIyBLZXlcbiAgICAgICAgICAgIGtleSA9IEBwYXJzZVNjYWxhciBtYXBwaW5nLCBbJzonLCAnICcsIFwiXFxuXCJdLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0LCBmYWxzZVxuICAgICAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgICAgICAjIFZhbHVlXG4gICAgICAgICAgICBkb25lID0gZmFsc2VcblxuICAgICAgICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgICAgICBzd2l0Y2ggbWFwcGluZy5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnWydcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTmVzdGVkIHNlcXVlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNlcXVlbmNlIG1hcHBpbmcsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTmVzdGVkIG1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlTWFwcGluZyBtYXBwaW5nLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZXIgY2Fubm90IGFib3J0IHRoaXMgbWFwcGluZyBlYXJsaWVyLCBzaW5jZSBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBhcmUgcHJvY2Vzc2VkIHNlcXVlbnRpYWxseS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG91dHB1dFtrZXldID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzonLCAnICcsIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICMgRG8gbm90aGluZ1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNjYWxhciBtYXBwaW5nLCBbJywnLCAnfSddLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZXIgY2Fubm90IGFib3J0IHRoaXMgbWFwcGluZyBlYXJsaWVyLCBzaW5jZSBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBhcmUgcHJvY2Vzc2VkIHNlcXVlbnRpYWxseS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG91dHB1dFtrZXldID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgICAgICsraVxuXG4gICAgICAgICAgICAgICAgaWYgZG9uZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgIHRocm93IG5ldyBQYXJzZU1vcmUgJ01hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgJyttYXBwaW5nXG5cblxuICAgICMgRXZhbHVhdGVzIHNjYWxhcnMgYW5kIHJlcGxhY2VzIG1hZ2ljIHZhbHVlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzY2FsYXJcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgIEBldmFsdWF0ZVNjYWxhcjogKHNjYWxhciwgY29udGV4dCkgLT5cbiAgICAgICAgc2NhbGFyID0gVXRpbHMudHJpbShzY2FsYXIpXG4gICAgICAgIHNjYWxhckxvd2VyID0gc2NhbGFyLnRvTG93ZXJDYXNlKClcblxuICAgICAgICBzd2l0Y2ggc2NhbGFyTG93ZXJcbiAgICAgICAgICAgIHdoZW4gJ251bGwnLCAnJywgJ34nXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgIHdoZW4gJ3RydWUnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIHdoZW4gJ2ZhbHNlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgd2hlbiAnLmluZidcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5maW5pdHlcbiAgICAgICAgICAgIHdoZW4gJy5uYW4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hTlxuICAgICAgICAgICAgd2hlbiAnLS5pbmYnXG4gICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlyc3RDaGFyID0gc2NhbGFyTG93ZXIuY2hhckF0KDApXG4gICAgICAgICAgICAgICAgc3dpdGNoIGZpcnN0Q2hhclxuICAgICAgICAgICAgICAgICAgICB3aGVuICchJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTcGFjZSA9IHNjYWxhci5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXMgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFdvcmQgPSBzY2FsYXJMb3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0V29yZCA9IHNjYWxhckxvd2VyWzAuLi5maXJzdFNwYWNlXVxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGZpcnN0V29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50IEBwYXJzZVNjYWxhcihzY2FsYXJbMi4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchc3RyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMubHRyaW0gc2NhbGFyWzQuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIXN0cidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmx0cmltIHNjYWxhcls1Li5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFpbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChAcGFyc2VTY2FsYXIoc2NhbGFyWzUuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhYm9vbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnBhcnNlQm9vbGVhbihAcGFyc2VTY2FsYXIoc2NhbGFyWzYuLl0pLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIWZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChAcGFyc2VTY2FsYXIoc2NhbGFyWzcuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhdGltZXN0YW1wJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMuc3RyaW5nVG9EYXRlKFV0aWxzLmx0cmltKHNjYWxhclsxMS4uXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29iamVjdERlY29kZXIsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGV9ID0gY29udGV4dFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgb2JqZWN0RGVjb2RlciBmdW5jdGlvbiBpcyBnaXZlbiwgd2UgY2FuIGRvIGN1c3RvbSBkZWNvZGluZyBvZiBjdXN0b20gdHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaW1tZWRTY2FsYXIgPSBVdGlscy5ydHJpbSBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0U3BhY2UgPSB0cmltbWVkU2NhbGFyLmluZGV4T2YoJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3RTcGFjZSBpcyAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3REZWNvZGVyIHRyaW1tZWRTY2FsYXIsIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJWYWx1ZSA9IFV0aWxzLmx0cmltIHRyaW1tZWRTY2FsYXJbZmlyc3RTcGFjZSsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHN1YlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViVmFsdWUgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdERlY29kZXIgdHJpbW1lZFNjYWxhclswLi4uZmlyc3RTcGFjZV0sIHN1YlZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdDdXN0b20gb2JqZWN0IHN1cHBvcnQgd2hlbiBwYXJzaW5nIGEgWUFNTCBmaWxlIGhhcyBiZWVuIGRpc2FibGVkLidcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgJzB4JyBpcyBzY2FsYXJbMC4uLjJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmhleERlYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNEaWdpdHMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLm9jdERlYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNOdW1lcmljIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnKydcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIFV0aWxzLmlzRGlnaXRzIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdyA9IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc3QgPSBwYXJzZUludChyYXcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmF3IGlzIFN0cmluZyhjYXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyhzY2FsYXJbMS4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAnMCcgaXMgc2NhbGFyLmNoYXJBdCgxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLVV0aWxzLm9jdERlYyhzY2FsYXJbMS4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdyA9IHNjYWxhclsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc3QgPSBwYXJzZUludChyYXcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJhdyBpcyBTdHJpbmcoY2FzdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLXJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGRhdGUgPSBVdGlscy5zdHJpbmdUb0RhdGUoc2NhbGFyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzTnVtZXJpYyhzY2FsYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG5cbm1vZHVsZS5leHBvcnRzID0gSW5saW5lXG4iLCJcbklubGluZSAgICAgICAgICA9IHJlcXVpcmUgJy4vSW5saW5lJ1xuUGF0dGVybiAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuVXRpbHMgICAgICAgICAgID0gcmVxdWlyZSAnLi9VdGlscydcblBhcnNlRXhjZXB0aW9uICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlRXhjZXB0aW9uJ1xuUGFyc2VNb3JlICAgICAgID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vUGFyc2VNb3JlJ1xuXG4jIFBhcnNlciBwYXJzZXMgWUFNTCBzdHJpbmdzIHRvIGNvbnZlcnQgdGhlbSB0byBKYXZhU2NyaXB0IG9iamVjdHMuXG4jXG5jbGFzcyBQYXJzZXJcblxuICAgICMgUHJlLWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgI1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9BTEw6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/Oig/PHR5cGU+IVteXFxcXHw+XSopXFxcXHMrKT8oPzxzZXBhcmF0b3I+XFxcXHx8PikoPzxtb2RpZmllcnM+XFxcXCt8XFxcXC18XFxcXGQrfFxcXFwrXFxcXGQrfFxcXFwtXFxcXGQrfFxcXFxkK1xcXFwrfFxcXFxkK1xcXFwtKT8oPzxjb21tZW50cz4gKyMuKik/JCdcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfRU5EOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJyg/PHNlcGFyYXRvcj5cXFxcfHw+KSg/PG1vZGlmaWVycz5cXFxcK3xcXFxcLXxcXFxcZCt8XFxcXCtcXFxcZCt8XFxcXC1cXFxcZCt8XFxcXGQrXFxcXCt8XFxcXGQrXFxcXC0pPyg/PGNvbW1lbnRzPiArIy4qKT8kJ1xuICAgIFBBVFRFUk5fU0VRVUVOQ0VfSVRFTTogICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtKCg/PGxlYWRzcGFjZXM+XFxcXHMrKSg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9BTkNIT1JfVkFMVUU6ICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeJig/PHJlZj5bXiBdKykgKig/PHZhbHVlPi4qKSdcbiAgICBQQVRURVJOX0NPTVBBQ1RfTk9UQVRJT046ICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzxrZXk+JytJbmxpbmUuUkVHRVhfUVVPVEVEX1NUUklORysnfFteIFxcJ1wiXFxcXHtcXFxcW10uKj8pICpcXFxcOihcXFxccysoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fTUFQUElOR19JVEVNOiAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/PGtleT4nK0lubGluZS5SRUdFWF9RVU9URURfU1RSSU5HKyd8W14gXFwnXCJcXFxcW1xcXFx7XS4qPykgKlxcXFw6KFxcXFxzKyg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9ERUNJTUFMOiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdcXFxcZCsnXG4gICAgUEFUVEVSTl9JTkRFTlRfU1BBQ0VTOiAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeICsnXG4gICAgUEFUVEVSTl9UUkFJTElOR19MSU5FUzogICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICcoXFxuKikkJ1xuICAgIFBBVFRFUk5fWUFNTF9IRUFERVI6ICAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwlWUFNTFs6IF1bXFxcXGRcXFxcLl0rLipcXG4nLCAnbSdcbiAgICBQQVRURVJOX0xFQURJTkdfQ09NTUVOVFM6ICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oXFxcXCMuKj9cXG4pKycsICdtJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX1NUQVJUOiAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtXFxcXC1cXFxcLS4qP1xcbicsICdtJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX0VORDogICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwuXFxcXC5cXFxcLlxcXFxzKiQnLCAnbSdcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQllfSU5ERU5UQVRJT046ICAge31cblxuICAgICMgQ29udGV4dCB0eXBlc1xuICAgICNcbiAgICBDT05URVhUX05PTkU6ICAgICAgIDBcbiAgICBDT05URVhUX1NFUVVFTkNFOiAgIDFcbiAgICBDT05URVhUX01BUFBJTkc6ICAgIDJcblxuXG4gICAgIyBDb25zdHJ1Y3RvclxuICAgICNcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIG9mZnNldCAgVGhlIG9mZnNldCBvZiBZQU1MIGRvY3VtZW50ICh1c2VkIGZvciBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMpXG4gICAgI1xuICAgIGNvbnN0cnVjdG9yOiAoQG9mZnNldCA9IDApIC0+XG4gICAgICAgIEBsaW5lcyAgICAgICAgICA9IFtdXG4gICAgICAgIEBjdXJyZW50TGluZU5iICA9IC0xXG4gICAgICAgIEBjdXJyZW50TGluZSAgICA9ICcnXG4gICAgICAgIEByZWZzICAgICAgICAgICA9IHt9XG5cblxuICAgICMgUGFyc2VzIGEgWUFNTCBzdHJpbmcgdG8gYSBKYXZhU2NyaXB0IHZhbHVlLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbT2JqZWN0XSAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIHBhcnNlOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgIEBjdXJyZW50TGluZU5iID0gLTFcbiAgICAgICAgQGN1cnJlbnRMaW5lID0gJydcbiAgICAgICAgQGxpbmVzID0gQGNsZWFudXAodmFsdWUpLnNwbGl0IFwiXFxuXCJcblxuICAgICAgICBkYXRhID0gbnVsbFxuICAgICAgICBjb250ZXh0ID0gQENPTlRFWFRfTk9ORVxuICAgICAgICBhbGxvd092ZXJ3cml0ZSA9IGZhbHNlXG4gICAgICAgIHdoaWxlIEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICBpZiBAaXNDdXJyZW50TGluZUVtcHR5KClcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAjIFRhYj9cbiAgICAgICAgICAgIGlmIFwiXFx0XCIgaXMgQGN1cnJlbnRMaW5lWzBdXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdBIFlBTUwgZmlsZSBjYW5ub3QgY29udGFpbiB0YWJzIGFzIGluZGVudGF0aW9uLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlzUmVmID0gbWVyZ2VOb2RlID0gZmFsc2VcbiAgICAgICAgICAgIGlmIHZhbHVlcyA9IEBQQVRURVJOX1NFUVVFTkNFX0lURU0uZXhlYyBAY3VycmVudExpbmVcbiAgICAgICAgICAgICAgICBpZiBAQ09OVEVYVF9NQVBQSU5HIGlzIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZb3UgY2Fubm90IGRlZmluZSBhIHNlcXVlbmNlIGl0ZW0gd2hlbiBpbiBhIG1hcHBpbmcnXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IEBDT05URVhUX1NFUVVFTkNFXG4gICAgICAgICAgICAgICAgZGF0YSA/PSBbXVxuXG4gICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlPyBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0FOQ0hPUl9WQUxVRS5leGVjIHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpc1JlZiA9IG1hdGNoZXMucmVmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy52YWx1ZSA9IG1hdGNoZXMudmFsdWVcblxuICAgICAgICAgICAgICAgICMgQXJyYXlcbiAgICAgICAgICAgICAgICBpZiBub3QodmFsdWVzLnZhbHVlPykgb3IgJycgaXMgVXRpbHMudHJpbSh2YWx1ZXMudmFsdWUsICcgJykgb3IgVXRpbHMubHRyaW0odmFsdWVzLnZhbHVlLCAnICcpLmluZGV4T2YoJyMnKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgIGlmIEBjdXJyZW50TGluZU5iIDwgQGxpbmVzLmxlbmd0aCAtIDEgYW5kIG5vdCBAaXNOZXh0TGluZVVuSW5kZW50ZWRDb2xsZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlciA9IG5ldyBQYXJzZXIgY1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLnJlZnMgPSBAcmVmc1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIHBhcnNlci5wYXJzZShAZ2V0TmV4dEVtYmVkQmxvY2sobnVsbCwgdHJ1ZSksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXIpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBudWxsXG5cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlcy5sZWFkc3BhY2VzPy5sZW5ndGggYW5kIG1hdGNoZXMgPSBAUEFUVEVSTl9DT01QQUNUX05PVEFUSU9OLmV4ZWMgdmFsdWVzLnZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgVGhpcyBpcyBhIGNvbXBhY3Qgbm90YXRpb24gZWxlbWVudCwgYWRkIHRvIG5leHQgYmxvY2sgYW5kIHBhcnNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlciA9IG5ldyBQYXJzZXIgY1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLnJlZnMgPSBAcmVmc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayA9IHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGlzTmV4dExpbmVJbmRlbnRlZChmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9jayArPSBcIlxcblwiK0BnZXROZXh0RW1iZWRCbG9jayhpbmRlbnQgKyB2YWx1ZXMubGVhZHNwYWNlcy5sZW5ndGggKyAxLCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggcGFyc2VyLnBhcnNlIGJsb2NrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIEBwYXJzZVZhbHVlIHZhbHVlcy52YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZXMgPSBAUEFUVEVSTl9NQVBQSU5HX0lURU0uZXhlYyBAY3VycmVudExpbmUpIGFuZCB2YWx1ZXMua2V5LmluZGV4T2YoJyAjJykgaXMgLTFcbiAgICAgICAgICAgICAgICBpZiBAQ09OVEVYVF9TRVFVRU5DRSBpcyBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWW91IGNhbm5vdCBkZWZpbmUgYSBtYXBwaW5nIGl0ZW0gd2hlbiBpbiBhIHNlcXVlbmNlJ1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBAQ09OVEVYVF9NQVBQSU5HXG4gICAgICAgICAgICAgICAgZGF0YSA/PSB7fVxuXG4gICAgICAgICAgICAgICAgIyBGb3JjZSBjb3JyZWN0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgSW5saW5lLmNvbmZpZ3VyZSBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IElubGluZS5wYXJzZVNjYWxhciB2YWx1ZXMua2V5XG4gICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgICAgICAgICAgaWYgJzw8JyBpcyBrZXlcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VOb2RlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBhbGxvd092ZXJ3cml0ZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlPy5pbmRleE9mKCcqJykgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmTmFtZSA9IHZhbHVlcy52YWx1ZVsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgQHJlZnNbcmVmTmFtZV0/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdSZWZlcmVuY2UgXCInK3JlZk5hbWUrJ1wiIGRvZXMgbm90IGV4aXN0LicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZlZhbHVlID0gQHJlZnNbcmVmTmFtZV1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIHJlZlZhbHVlIGlzbnQgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lBTUwgbWVyZ2Uga2V5cyB1c2VkIHdpdGggYSBzY2FsYXIgdmFsdWUgaW5zdGVhZCBvZiBhbiBvYmplY3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVmVmFsdWUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2UgYXJyYXkgd2l0aCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWUsIGkgaW4gcmVmVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtTdHJpbmcoaSldID89IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmVmVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID89IHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlPyBhbmQgdmFsdWVzLnZhbHVlIGlzbnQgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGdldE5leHRFbWJlZEJsb2NrKClcblxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZXIucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHR5cGVvZiBwYXJzZWQgaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lBTUwgbWVyZ2Uga2V5cyB1c2VkIHdpdGggYSBzY2FsYXIgdmFsdWUgaW5zdGVhZCBvZiBhbiBvYmplY3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyc2VkIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIG1lcmdlIGtleSBpcyBhIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBhbmQgZWFjaCBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS4gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpbiBsYXRlciBtYXBwaW5nIG5vZGVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBwYXJzZWRJdGVtIGluIHBhcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgdHlwZW9mIHBhcnNlZEl0ZW0gaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnTWVyZ2UgaXRlbXMgbXVzdCBiZSBvYmplY3RzLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgcGFyc2VkSXRlbVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBhcnNlZEl0ZW0gaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBhcnJheSB3aXRoIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLCBpIGluIHBhcnNlZEl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrID0gU3RyaW5nKGkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGRhdGEuaGFzT3duUHJvcGVydHkoaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2Ugb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcGFyc2VkSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBkYXRhLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZiBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5IGFscmVhZHkgZXhpc3RzIGluIGl0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHBhcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB2YWx1ZXMudmFsdWU/IGFuZCBtYXRjaGVzID0gQFBBVFRFUk5fQU5DSE9SX1ZBTFVFLmV4ZWMgdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlzUmVmID0gbWF0Y2hlcy5yZWZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnZhbHVlID0gbWF0Y2hlcy52YWx1ZVxuXG5cbiAgICAgICAgICAgICAgICBpZiBtZXJnZU5vZGVcbiAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBrZXlzXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBub3QodmFsdWVzLnZhbHVlPykgb3IgJycgaXMgVXRpbHMudHJpbSh2YWx1ZXMudmFsdWUsICcgJykgb3IgVXRpbHMubHRyaW0odmFsdWVzLnZhbHVlLCAnICcpLmluZGV4T2YoJyMnKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICMgSGFzaFxuICAgICAgICAgICAgICAgICAgICAjIGlmIG5leHQgbGluZSBpcyBsZXNzIGluZGVudGVkIG9yIGVxdWFsLCB0aGVuIGl0IG1lYW5zIHRoYXQgdGhlIGN1cnJlbnQgdmFsdWUgaXMgbnVsbFxuICAgICAgICAgICAgICAgICAgICBpZiBub3QoQGlzTmV4dExpbmVJbmRlbnRlZCgpKSBhbmQgbm90KEBpc05leHRMaW5lVW5JbmRlbnRlZENvbGxlY3Rpb24oKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEJ1dCBvdmVyd3JpdGluZyBpcyBhbGxvd2VkIHdoZW4gYSBtZXJnZSBub2RlIGlzIHVzZWQgaW4gY3VycmVudCBibG9jay5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGFsbG93T3ZlcndyaXRlIG9yIGRhdGFba2V5XSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBudWxsXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBwYXJzZXIucGFyc2UgQGdldE5leHRFbWJlZEJsb2NrKCksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbFxuXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB2YWwgPSBAcGFyc2VWYWx1ZSB2YWx1ZXMudmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAjIEJ1dCBvdmVyd3JpdGluZyBpcyBhbGxvd2VkIHdoZW4gYSBtZXJnZSBub2RlIGlzIHVzZWQgaW4gY3VycmVudCBibG9jay5cbiAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIDEtbGluZXIgb3B0aW9uYWxseSBmb2xsb3dlZCBieSBuZXdsaW5lXG4gICAgICAgICAgICAgICAgbGluZUNvdW50ID0gQGxpbmVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIDEgaXMgbGluZUNvdW50IG9yICgyIGlzIGxpbmVDb3VudCBhbmQgVXRpbHMuaXNFbXB0eShAbGluZXNbMV0pKVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gSW5saW5lLnBhcnNlIEBsaW5lc1swXSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIHZhbHVlIGlzICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSB2YWx1ZVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSB2YWx1ZVtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBmaXJzdCBpcyAnc3RyaW5nJyBhbmQgZmlyc3QuaW5kZXhPZignKicpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgYWxpYXMgaW4gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIEByZWZzW2FsaWFzWzEuLl1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmx0cmltKHZhbHVlKS5jaGFyQXQoMCkgaW4gWydbJywgJ3snXVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdVbmFibGUgdG8gcGFyc2UuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgaXNSZWZcbiAgICAgICAgICAgICAgICBpZiBkYXRhIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgQHJlZnNbaXNSZWZdID0gZGF0YVtkYXRhLmxlbmd0aC0xXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0S2V5ID0ga2V5XG4gICAgICAgICAgICAgICAgICAgIEByZWZzW2lzUmVmXSA9IGRhdGFbbGFzdEtleV1cblxuXG4gICAgICAgIGlmIFV0aWxzLmlzRW1wdHkoZGF0YSlcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG5cblxuXG4gICAgIyBSZXR1cm5zIHRoZSBjdXJyZW50IGxpbmUgbnVtYmVyICh0YWtlcyB0aGUgb2Zmc2V0IGludG8gYWNjb3VudCkuXG4gICAgI1xuICAgICMgQHJldHVybiBbSW50ZWdlcl0gICAgIFRoZSBjdXJyZW50IGxpbmUgbnVtYmVyXG4gICAgI1xuICAgIGdldFJlYWxDdXJyZW50TGluZU5iOiAtPlxuICAgICAgICByZXR1cm4gQGN1cnJlbnRMaW5lTmIgKyBAb2Zmc2V0XG5cblxuICAgICMgUmV0dXJucyB0aGUgY3VycmVudCBsaW5lIGluZGVudGF0aW9uLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdICAgICBUaGUgY3VycmVudCBsaW5lIGluZGVudGF0aW9uXG4gICAgI1xuICAgIGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb246IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmUubGVuZ3RoIC0gVXRpbHMubHRyaW0oQGN1cnJlbnRMaW5lLCAnICcpLmxlbmd0aFxuXG5cbiAgICAjIFJldHVybnMgdGhlIG5leHQgZW1iZWQgYmxvY2sgb2YgWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICAgICAgICAgIGluZGVudGF0aW9uIFRoZSBpbmRlbnQgbGV2ZWwgYXQgd2hpY2ggdGhlIGJsb2NrIGlzIHRvIGJlIHJlYWQsIG9yIG51bGwgZm9yIGRlZmF1bHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSAgIFdoZW4gaW5kZW50YXRpb24gcHJvYmxlbSBhcmUgZGV0ZWN0ZWRcbiAgICAjXG4gICAgZ2V0TmV4dEVtYmVkQmxvY2s6IChpbmRlbnRhdGlvbiA9IG51bGwsIGluY2x1ZGVVbmluZGVudGVkQ29sbGVjdGlvbiA9IGZhbHNlKSAtPlxuICAgICAgICBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIG5vdCBpbmRlbnRhdGlvbj9cbiAgICAgICAgICAgIG5ld0luZGVudCA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcblxuICAgICAgICAgICAgdW5pbmRlbnRlZEVtYmVkQmxvY2sgPSBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlmIG5vdChAaXNDdXJyZW50TGluZUVtcHR5KCkpIGFuZCAwIGlzIG5ld0luZGVudCBhbmQgbm90KHVuaW5kZW50ZWRFbWJlZEJsb2NrKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnSW5kZW50YXRpb24gcHJvYmxlbS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5ld0luZGVudCA9IGluZGVudGF0aW9uXG5cblxuICAgICAgICBkYXRhID0gW0BjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1dXG5cbiAgICAgICAgdW5sZXNzIGluY2x1ZGVVbmluZGVudGVkQ29sbGVjdGlvblxuICAgICAgICAgICAgaXNJdFVuaW5kZW50ZWRDb2xsZWN0aW9uID0gQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtIEBjdXJyZW50TGluZVxuXG4gICAgICAgICMgQ29tbWVudHMgbXVzdCBub3QgYmUgcmVtb3ZlZCBpbnNpZGUgYSBzdHJpbmcgYmxvY2sgKGllLiBhZnRlciBhIGxpbmUgZW5kaW5nIHdpdGggXCJ8XCIpXG4gICAgICAgICMgVGhleSBtdXN0IG5vdCBiZSByZW1vdmVkIGluc2lkZSBhIHN1Yi1lbWJlZGRlZCBibG9jayBhcyB3ZWxsXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzUGF0dGVybiA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfRU5EXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzID0gbm90IHJlbW92ZUNvbW1lbnRzUGF0dGVybi50ZXN0IEBjdXJyZW50TGluZVxuXG4gICAgICAgIHdoaWxlIEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICBpbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG5cbiAgICAgICAgICAgIGlmIGluZGVudCBpcyBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICByZW1vdmVDb21tZW50cyA9IG5vdCByZW1vdmVDb21tZW50c1BhdHRlcm4udGVzdCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgcmVtb3ZlQ29tbWVudHMgYW5kIEBpc0N1cnJlbnRMaW5lQ29tbWVudCgpXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoIEBjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBpc0l0VW5pbmRlbnRlZENvbGxlY3Rpb24gYW5kIG5vdCBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0oQGN1cnJlbnRMaW5lKSBhbmQgaW5kZW50IGlzIG5ld0luZGVudFxuICAgICAgICAgICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIGluZGVudCA+PSBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXVxuICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5sdHJpbShAY3VycmVudExpbmUpLmNoYXJBdCgwKSBpcyAnIydcbiAgICAgICAgICAgICAgICAjIERvbid0IGFkZCBsaW5lIHdpdGggY29tbWVudHNcbiAgICAgICAgICAgIGVsc2UgaWYgMCBpcyBpbmRlbnRcbiAgICAgICAgICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnSW5kZW50YXRpb24gcHJvYmxlbS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG5cbiAgICAgICAgcmV0dXJuIGRhdGEuam9pbiBcIlxcblwiXG5cblxuICAgICMgTW92ZXMgdGhlIHBhcnNlciB0byB0aGUgbmV4dCBsaW5lLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dXG4gICAgI1xuICAgIG1vdmVUb05leHRMaW5lOiAtPlxuICAgICAgICBpZiBAY3VycmVudExpbmVOYiA+PSBAbGluZXMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgQGN1cnJlbnRMaW5lID0gQGxpbmVzWysrQGN1cnJlbnRMaW5lTmJdO1xuXG4gICAgICAgIHJldHVybiB0cnVlXG5cblxuICAgICMgTW92ZXMgdGhlIHBhcnNlciB0byB0aGUgcHJldmlvdXMgbGluZS5cbiAgICAjXG4gICAgbW92ZVRvUHJldmlvdXNMaW5lOiAtPlxuICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZXNbLS1AY3VycmVudExpbmVOYl1cbiAgICAgICAgcmV0dXJuXG5cblxuICAgICMgUGFyc2VzIGEgWUFNTCB2YWx1ZS5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBBIFlBTUwgdmFsdWVcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiByZWZlcmVuY2UgZG9lcyBub3QgZXhpc3RcbiAgICAjXG4gICAgcGFyc2VWYWx1ZTogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICBpZiAwIGlzIHZhbHVlLmluZGV4T2YoJyonKVxuICAgICAgICAgICAgcG9zID0gdmFsdWUuaW5kZXhPZiAnIydcbiAgICAgICAgICAgIGlmIHBvcyBpc250IC0xXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMSwgcG9zLTIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVsxLi5dXG5cbiAgICAgICAgICAgIGlmIEByZWZzW3ZhbHVlXSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1JlZmVyZW5jZSBcIicrdmFsdWUrJ1wiIGRvZXMgbm90IGV4aXN0LicsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICByZXR1cm4gQHJlZnNbdmFsdWVdXG5cblxuICAgICAgICBpZiBtYXRjaGVzID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9BTEwuZXhlYyB2YWx1ZVxuICAgICAgICAgICAgbW9kaWZpZXJzID0gbWF0Y2hlcy5tb2RpZmllcnMgPyAnJ1xuXG4gICAgICAgICAgICBmb2xkZWRJbmRlbnQgPSBNYXRoLmFicyhwYXJzZUludChtb2RpZmllcnMpKVxuICAgICAgICAgICAgaWYgaXNOYU4oZm9sZGVkSW5kZW50KSB0aGVuIGZvbGRlZEluZGVudCA9IDBcbiAgICAgICAgICAgIHZhbCA9IEBwYXJzZUZvbGRlZFNjYWxhciBtYXRjaGVzLnNlcGFyYXRvciwgQFBBVFRFUk5fREVDSU1BTC5yZXBsYWNlKG1vZGlmaWVycywgJycpLCBmb2xkZWRJbmRlbnRcbiAgICAgICAgICAgIGlmIG1hdGNoZXMudHlwZT9cbiAgICAgICAgICAgICAgICAjIEZvcmNlIGNvcnJlY3Qgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBJbmxpbmUuY29uZmlndXJlIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlU2NhbGFyIG1hdGNoZXMudHlwZSsnICcrdmFsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbFxuXG4gICAgICAgICMgVmFsdWUgY2FuIGJlIG11bHRpbGluZSBjb21wYWN0IHNlcXVlbmNlIG9yIG1hcHBpbmcgb3Igc3RyaW5nXG4gICAgICAgIGlmIHZhbHVlLmNoYXJBdCgwKSBpbiBbJ1snLCAneycsICdcIicsIFwiJ1wiXVxuICAgICAgICAgICAgd2hpbGUgdHJ1ZVxuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlIHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICBpZiBlIGluc3RhbmNlb2YgUGFyc2VNb3JlIGFuZCBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gXCJcXG5cIiArIFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBpc05leHRMaW5lSW5kZW50ZWQoKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9IFwiXFxuXCIgKyBAZ2V0TmV4dEVtYmVkQmxvY2soKVxuICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIFBhcnNlcyBhIGZvbGRlZCBzY2FsYXIuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHNlcGFyYXRvciAgIFRoZSBzZXBhcmF0b3IgdGhhdCB3YXMgdXNlZCB0byBiZWdpbiB0aGlzIGZvbGRlZCBzY2FsYXIgKHwgb3IgPilcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICBpbmRpY2F0b3IgICBUaGUgaW5kaWNhdG9yIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyICgrIG9yIC0pXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICAgICAgaW5kZW50YXRpb24gVGhlIGluZGVudGF0aW9uIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB0ZXh0IHZhbHVlXG4gICAgI1xuICAgIHBhcnNlRm9sZGVkU2NhbGFyOiAoc2VwYXJhdG9yLCBpbmRpY2F0b3IgPSAnJywgaW5kZW50YXRpb24gPSAwKSAtPlxuICAgICAgICBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICBpZiBub3Qgbm90RU9GXG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICBpc0N1cnJlbnRMaW5lQmxhbmsgPSBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgdGV4dCA9ICcnXG5cbiAgICAgICAgIyBMZWFkaW5nIGJsYW5rIGxpbmVzIGFyZSBjb25zdW1lZCBiZWZvcmUgZGV0ZXJtaW5pbmcgaW5kZW50YXRpb25cbiAgICAgICAgd2hpbGUgbm90RU9GIGFuZCBpc0N1cnJlbnRMaW5lQmxhbmtcbiAgICAgICAgICAgICMgbmV3bGluZSBvbmx5IGlmIG5vdCBFT0ZcbiAgICAgICAgICAgIGlmIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgaXNDdXJyZW50TGluZUJsYW5rID0gQGlzQ3VycmVudExpbmVCbGFuaygpXG5cblxuICAgICAgICAjIERldGVybWluZSBpbmRlbnRhdGlvbiBpZiBub3Qgc3BlY2lmaWVkXG4gICAgICAgIGlmIDAgaXMgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGlmIG1hdGNoZXMgPSBAUEFUVEVSTl9JTkRFTlRfU1BBQ0VTLmV4ZWMgQGN1cnJlbnRMaW5lXG4gICAgICAgICAgICAgICAgaW5kZW50YXRpb24gPSBtYXRjaGVzWzBdLmxlbmd0aFxuXG5cbiAgICAgICAgaWYgaW5kZW50YXRpb24gPiAwXG4gICAgICAgICAgICBwYXR0ZXJuID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTltpbmRlbnRhdGlvbl1cbiAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBuZXcgUGF0dGVybiAnXiB7JytpbmRlbnRhdGlvbisnfSguKikkJ1xuICAgICAgICAgICAgICAgIFBhcnNlcjo6UEFUVEVSTl9GT0xERURfU0NBTEFSX0JZX0lOREVOVEFUSU9OW2luZGVudGF0aW9uXSA9IHBhdHRlcm5cblxuICAgICAgICAgICAgd2hpbGUgbm90RU9GIGFuZCAoaXNDdXJyZW50TGluZUJsYW5rIG9yIG1hdGNoZXMgPSBwYXR0ZXJuLmV4ZWMgQGN1cnJlbnRMaW5lKVxuICAgICAgICAgICAgICAgIGlmIGlzQ3VycmVudExpbmVCbGFua1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IEBjdXJyZW50TGluZVtpbmRlbnRhdGlvbi4uXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBtYXRjaGVzWzFdXG5cbiAgICAgICAgICAgICAgICAjIG5ld2xpbmUgb25seSBpZiBub3QgRU9GXG4gICAgICAgICAgICAgICAgaWYgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgIGlzQ3VycmVudExpbmVCbGFuayA9IEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuXG4gICAgICAgIGVsc2UgaWYgbm90RU9GXG4gICAgICAgICAgICB0ZXh0ICs9IFwiXFxuXCJcblxuXG4gICAgICAgIGlmIG5vdEVPRlxuICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG5cblxuICAgICAgICAjIFJlbW92ZSBsaW5lIGJyZWFrcyBvZiBlYWNoIGxpbmVzIGV4Y2VwdCB0aGUgZW1wdHkgYW5kIG1vcmUgaW5kZW50ZWQgb25lc1xuICAgICAgICBpZiAnPicgaXMgc2VwYXJhdG9yXG4gICAgICAgICAgICBuZXdUZXh0ID0gJydcbiAgICAgICAgICAgIGZvciBsaW5lIGluIHRleHQuc3BsaXQgXCJcXG5cIlxuICAgICAgICAgICAgICAgIGlmIGxpbmUubGVuZ3RoIGlzIDAgb3IgbGluZS5jaGFyQXQoMCkgaXMgJyAnXG4gICAgICAgICAgICAgICAgICAgIG5ld1RleHQgPSBVdGlscy5ydHJpbShuZXdUZXh0LCAnICcpICsgbGluZSArIFwiXFxuXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG5ld1RleHQgKz0gbGluZSArICcgJ1xuICAgICAgICAgICAgdGV4dCA9IG5ld1RleHRcblxuICAgICAgICBpZiAnKycgaXNudCBpbmRpY2F0b3JcbiAgICAgICAgICAgICMgUmVtb3ZlIGFueSBleHRyYSBzcGFjZSBvciBuZXcgbGluZSBhcyB3ZSBhcmUgYWRkaW5nIHRoZW0gYWZ0ZXJcbiAgICAgICAgICAgIHRleHQgPSBVdGlscy5ydHJpbSh0ZXh0KVxuXG4gICAgICAgICMgRGVhbCB3aXRoIHRyYWlsaW5nIG5ld2xpbmVzIGFzIGluZGljYXRlZFxuICAgICAgICBpZiAnJyBpcyBpbmRpY2F0b3JcbiAgICAgICAgICAgIHRleHQgPSBAUEFUVEVSTl9UUkFJTElOR19MSU5FUy5yZXBsYWNlIHRleHQsIFwiXFxuXCJcbiAgICAgICAgZWxzZSBpZiAnLScgaXMgaW5kaWNhdG9yXG4gICAgICAgICAgICB0ZXh0ID0gQFBBVFRFUk5fVFJBSUxJTkdfTElORVMucmVwbGFjZSB0ZXh0LCAnJ1xuXG4gICAgICAgIHJldHVybiB0ZXh0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgaXMgaW5kZW50ZWQuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIGlzIGluZGVudGVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNOZXh0TGluZUluZGVudGVkOiAoaWdub3JlQ29tbWVudHMgPSB0cnVlKSAtPlxuICAgICAgICBjdXJyZW50SW5kZW50YXRpb24gPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgIEVPRiA9IG5vdCBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIGlnbm9yZUNvbW1lbnRzXG4gICAgICAgICAgICB3aGlsZSBub3QoRU9GKSBhbmQgQGlzQ3VycmVudExpbmVFbXB0eSgpXG4gICAgICAgICAgICAgICAgRU9GID0gbm90IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdoaWxlIG5vdChFT0YpIGFuZCBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgICAgICAgICBFT0YgPSBub3QgQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBFT0ZcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIHJldCA9IGZhbHNlXG4gICAgICAgIGlmIEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKCkgPiBjdXJyZW50SW5kZW50YXRpb25cbiAgICAgICAgICAgIHJldCA9IHRydWVcblxuICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuICAgICAgICByZXR1cm4gcmV0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmsgb3IgaWYgaXQgaXMgYSBjb21tZW50IGxpbmUuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGVtcHR5IG9yIGlmIGl0IGlzIGEgY29tbWVudCBsaW5lLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUVtcHR5OiAtPlxuICAgICAgICB0cmltbWVkTGluZSA9IFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG4gICAgICAgIHJldHVybiB0cmltbWVkTGluZS5sZW5ndGggaXMgMCBvciB0cmltbWVkTGluZS5jaGFyQXQoMCkgaXMgJyMnXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmsuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUJsYW5rOiAtPlxuICAgICAgICByZXR1cm4gJycgaXMgVXRpbHMudHJpbShAY3VycmVudExpbmUsICcgJylcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBhIGNvbW1lbnQgbGluZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYSBjb21tZW50IGxpbmUsIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc0N1cnJlbnRMaW5lQ29tbWVudDogLT5cbiAgICAgICAgIyBDaGVja2luZyBleHBsaWNpdGx5IHRoZSBmaXJzdCBjaGFyIG9mIHRoZSB0cmltIGlzIGZhc3RlciB0aGFuIGxvb3BzIG9yIHN0cnBvc1xuICAgICAgICBsdHJpbW1lZExpbmUgPSBVdGlscy5sdHJpbShAY3VycmVudExpbmUsICcgJylcblxuICAgICAgICByZXR1cm4gbHRyaW1tZWRMaW5lLmNoYXJBdCgwKSBpcyAnIydcblxuXG4gICAgIyBDbGVhbnVwcyBhIFlBTUwgc3RyaW5nIHRvIGJlIHBhcnNlZC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSBUaGUgaW5wdXQgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIGNsZWFuZWQgdXAgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgY2xlYW51cDogKHZhbHVlKSAtPlxuICAgICAgICBpZiB2YWx1ZS5pbmRleE9mKFwiXFxyXCIpIGlzbnQgLTFcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoXCJcXHJcXG5cIikuam9pbihcIlxcblwiKS5zcGxpdChcIlxcclwiKS5qb2luKFwiXFxuXCIpXG5cbiAgICAgICAgIyBTdHJpcCBZQU1MIGhlYWRlclxuICAgICAgICBjb3VudCA9IDBcbiAgICAgICAgW3ZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9ZQU1MX0hFQURFUi5yZXBsYWNlQWxsIHZhbHVlLCAnJ1xuICAgICAgICBAb2Zmc2V0ICs9IGNvdW50XG5cbiAgICAgICAgIyBSZW1vdmUgbGVhZGluZyBjb21tZW50c1xuICAgICAgICBbdHJpbW1lZFZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9MRUFESU5HX0NPTU1FTlRTLnJlcGxhY2VBbGwgdmFsdWUsICcnLCAxXG4gICAgICAgIGlmIGNvdW50IGlzIDFcbiAgICAgICAgICAgICMgSXRlbXMgaGF2ZSBiZWVuIHJlbW92ZWQsIHVwZGF0ZSB0aGUgb2Zmc2V0XG4gICAgICAgICAgICBAb2Zmc2V0ICs9IFV0aWxzLnN1YlN0ckNvdW50KHZhbHVlLCBcIlxcblwiKSAtIFV0aWxzLnN1YlN0ckNvdW50KHRyaW1tZWRWYWx1ZSwgXCJcXG5cIilcbiAgICAgICAgICAgIHZhbHVlID0gdHJpbW1lZFZhbHVlXG5cbiAgICAgICAgIyBSZW1vdmUgc3RhcnQgb2YgdGhlIGRvY3VtZW50IG1hcmtlciAoLS0tKVxuICAgICAgICBbdHJpbW1lZFZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfU1RBUlQucmVwbGFjZUFsbCB2YWx1ZSwgJycsIDFcbiAgICAgICAgaWYgY291bnQgaXMgMVxuICAgICAgICAgICAgIyBJdGVtcyBoYXZlIGJlZW4gcmVtb3ZlZCwgdXBkYXRlIHRoZSBvZmZzZXRcbiAgICAgICAgICAgIEBvZmZzZXQgKz0gVXRpbHMuc3ViU3RyQ291bnQodmFsdWUsIFwiXFxuXCIpIC0gVXRpbHMuc3ViU3RyQ291bnQodHJpbW1lZFZhbHVlLCBcIlxcblwiKVxuICAgICAgICAgICAgdmFsdWUgPSB0cmltbWVkVmFsdWVcblxuICAgICAgICAgICAgIyBSZW1vdmUgZW5kIG9mIHRoZSBkb2N1bWVudCBtYXJrZXIgKC4uLilcbiAgICAgICAgICAgIHZhbHVlID0gQFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX0VORC5yZXBsYWNlIHZhbHVlLCAnJ1xuXG4gICAgICAgICMgRW5zdXJlIHRoZSBibG9jayBpcyBub3QgaW5kZW50ZWRcbiAgICAgICAgbGluZXMgPSB2YWx1ZS5zcGxpdChcIlxcblwiKVxuICAgICAgICBzbWFsbGVzdEluZGVudCA9IC0xXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBjb250aW51ZSBpZiBVdGlscy50cmltKGxpbmUsICcgJykubGVuZ3RoID09IDBcbiAgICAgICAgICAgIGluZGVudCA9IGxpbmUubGVuZ3RoIC0gVXRpbHMubHRyaW0obGluZSkubGVuZ3RoXG4gICAgICAgICAgICBpZiBzbWFsbGVzdEluZGVudCBpcyAtMSBvciBpbmRlbnQgPCBzbWFsbGVzdEluZGVudFxuICAgICAgICAgICAgICAgIHNtYWxsZXN0SW5kZW50ID0gaW5kZW50XG4gICAgICAgIGlmIHNtYWxsZXN0SW5kZW50ID4gMFxuICAgICAgICAgICAgZm9yIGxpbmUsIGkgaW4gbGluZXNcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IGxpbmVbc21hbGxlc3RJbmRlbnQuLl1cbiAgICAgICAgICAgIHZhbHVlID0gbGluZXMuam9pbihcIlxcblwiKVxuXG4gICAgICAgIHJldHVybiB2YWx1ZVxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIHN0YXJ0cyB1bmluZGVudGVkIGNvbGxlY3Rpb25cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgc3RhcnRzIHVuaW5kZW50ZWQgY29sbGVjdGlvbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbjogKGN1cnJlbnRJbmRlbnRhdGlvbiA9IG51bGwpIC0+XG4gICAgICAgIGN1cnJlbnRJbmRlbnRhdGlvbiA/PSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgd2hpbGUgbm90RU9GIGFuZCBAaXNDdXJyZW50TGluZUVtcHR5KClcbiAgICAgICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgZmFsc2UgaXMgbm90RU9GXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXQgPSBmYWxzZVxuICAgICAgICBpZiBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpIGlzIGN1cnJlbnRJbmRlbnRhdGlvbiBhbmQgQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtKEBjdXJyZW50TGluZSlcbiAgICAgICAgICAgIHJldCA9IHRydWVcblxuICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuICAgICAgICByZXR1cm4gcmV0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgaXMgdW4taW5kZW50ZWQgY29sbGVjdGlvbiBpdGVtXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3RyaW5nIGlzIHVuLWluZGVudGVkIGNvbGxlY3Rpb24gaXRlbSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtOiAtPlxuICAgICAgICByZXR1cm4gQGN1cnJlbnRMaW5lIGlzICctJyBvciBAY3VycmVudExpbmVbMC4uLjJdIGlzICctICdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIiwiXG4jIFBhdHRlcm4gaXMgYSB6ZXJvLWNvbmZsaWN0IHdyYXBwZXIgZXh0ZW5kaW5nIFJlZ0V4cCBmZWF0dXJlc1xuIyBpbiBvcmRlciB0byBtYWtlIFlBTUwgcGFyc2luZyByZWdleCBtb3JlIGV4cHJlc3NpdmUuXG4jXG5jbGFzcyBQYXR0ZXJuXG5cbiAgICAjIEBwcm9wZXJ0eSBbUmVnRXhwXSBUaGUgUmVnRXhwIGluc3RhbmNlXG4gICAgcmVnZXg6ICAgICAgICAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtTdHJpbmddIFRoZSByYXcgcmVnZXggc3RyaW5nXG4gICAgcmF3UmVnZXg6ICAgICAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtTdHJpbmddIFRoZSBjbGVhbmVkIHJlZ2V4IHN0cmluZyAodXNlZCB0byBjcmVhdGUgdGhlIFJlZ0V4cCBpbnN0YW5jZSlcbiAgICBjbGVhbmVkUmVnZXg6ICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW09iamVjdF0gVGhlIGRpY3Rpb25hcnkgbWFwcGluZyBuYW1lcyB0byBjYXB0dXJpbmcgYnJhY2tldCBudW1iZXJzXG4gICAgbWFwcGluZzogICAgICAgIG51bGxcblxuICAgICMgQ29uc3RydWN0b3JcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gcmF3UmVnZXggVGhlIHJhdyByZWdleCBzdHJpbmcgZGVmaW5pbmcgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgY29uc3RydWN0b3I6IChyYXdSZWdleCwgbW9kaWZpZXJzID0gJycpIC0+XG4gICAgICAgIGNsZWFuZWRSZWdleCA9ICcnXG4gICAgICAgIGxlbiA9IHJhd1JlZ2V4Lmxlbmd0aFxuICAgICAgICBtYXBwaW5nID0gbnVsbFxuXG4gICAgICAgICMgQ2xlYW51cCByYXcgcmVnZXggYW5kIGNvbXB1dGUgbWFwcGluZ1xuICAgICAgICBjYXB0dXJpbmdCcmFja2V0TnVtYmVyID0gMFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICBfY2hhciA9IHJhd1JlZ2V4LmNoYXJBdChpKVxuICAgICAgICAgICAgaWYgX2NoYXIgaXMgJ1xcXFwnXG4gICAgICAgICAgICAgICAgIyBJZ25vcmUgbmV4dCBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gcmF3UmVnZXhbaS4uaSsxXVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgZWxzZSBpZiBfY2hhciBpcyAnKCdcbiAgICAgICAgICAgICAgICAjIEluY3JlYXNlIGJyYWNrZXQgbnVtYmVyLCBvbmx5IGlmIGl0IGlzIGNhcHR1cmluZ1xuICAgICAgICAgICAgICAgIGlmIGkgPCBsZW4gLSAyXG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSByYXdSZWdleFtpLi5pKzJdXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhcnQgaXMgJyg/OidcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTm9uLWNhcHR1cmluZyBicmFja2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcGFydCBpcyAnKD88J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDYXB0dXJpbmcgYnJhY2tldCB3aXRoIHBvc3NpYmx5IGEgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdHVyaW5nQnJhY2tldE51bWJlcisrXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgaSArIDEgPCBsZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDaGFyID0gcmF3UmVnZXguY2hhckF0KGkgKyAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN1YkNoYXIgaXMgJz4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSAnKCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBBc3NvY2lhdGUgYSBuYW1lIHdpdGggYSBjYXB0dXJpbmcgYnJhY2tldCBudW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcgPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmdbbmFtZV0gPSBjYXB0dXJpbmdCcmFja2V0TnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lICs9IHN1YkNoYXJcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gX2NoYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcHR1cmluZ0JyYWNrZXROdW1iZXIrK1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IF9jaGFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IF9jaGFyXG5cbiAgICAgICAgICAgIGkrK1xuXG4gICAgICAgIEByYXdSZWdleCA9IHJhd1JlZ2V4XG4gICAgICAgIEBjbGVhbmVkUmVnZXggPSBjbGVhbmVkUmVnZXhcbiAgICAgICAgQHJlZ2V4ID0gbmV3IFJlZ0V4cCBAY2xlYW5lZFJlZ2V4LCAnZycrbW9kaWZpZXJzLnJlcGxhY2UoJ2cnLCAnJylcbiAgICAgICAgQG1hcHBpbmcgPSBtYXBwaW5nXG5cblxuICAgICMgRXhlY3V0ZXMgdGhlIHBhdHRlcm4ncyByZWdleCBhbmQgcmV0dXJucyB0aGUgbWF0Y2hpbmcgdmFsdWVzXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHVzZSB0byBleGVjdXRlIHRoZSBwYXR0ZXJuXG4gICAgI1xuICAgICMgQHJldHVybiBbQXJyYXldIFRoZSBtYXRjaGluZyB2YWx1ZXMgZXh0cmFjdGVkIGZyb20gY2FwdHVyaW5nIGJyYWNrZXRzIG9yIG51bGwgaWYgbm90aGluZyBtYXRjaGVkXG4gICAgI1xuICAgIGV4ZWM6IChzdHIpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIG1hdGNoZXMgPSBAcmVnZXguZXhlYyBzdHJcblxuICAgICAgICBpZiBub3QgbWF0Y2hlcz9cbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgaWYgQG1hcHBpbmc/XG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5kZXggb2YgQG1hcHBpbmdcbiAgICAgICAgICAgICAgICBtYXRjaGVzW25hbWVdID0gbWF0Y2hlc1tpbmRleF1cblxuICAgICAgICByZXR1cm4gbWF0Y2hlc1xuXG5cbiAgICAjIFRlc3RzIHRoZSBwYXR0ZXJuJ3MgcmVnZXhcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdXNlIHRvIHRlc3QgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSBzdHJpbmcgbWF0Y2hlZFxuICAgICNcbiAgICB0ZXN0OiAoc3RyKSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gQHJlZ2V4LnRlc3Qgc3RyXG5cblxuICAgICMgUmVwbGFjZXMgb2NjdXJlbmNlcyBtYXRjaGluZyB3aXRoIHRoZSBwYXR0ZXJuJ3MgcmVnZXggd2l0aCByZXBsYWNlbWVudFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHNvdXJjZSBzdHJpbmcgdG8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByZXBsYWNlbWVudCBUaGUgc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiBlYWNoIHJlcGxhY2VkIG9jY3VyZW5jZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIFRoZSByZXBsYWNlZCBzdHJpbmdcbiAgICAjXG4gICAgcmVwbGFjZTogKHN0ciwgcmVwbGFjZW1lbnQpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSBAcmVnZXgsIHJlcGxhY2VtZW50XG5cblxuICAgICMgUmVwbGFjZXMgb2NjdXJlbmNlcyBtYXRjaGluZyB3aXRoIHRoZSBwYXR0ZXJuJ3MgcmVnZXggd2l0aCByZXBsYWNlbWVudCBhbmRcbiAgICAjIGdldCBib3RoIHRoZSByZXBsYWNlZCBzdHJpbmcgYW5kIHRoZSBudW1iZXIgb2YgcmVwbGFjZWQgb2NjdXJlbmNlcyBpbiB0aGUgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHNvdXJjZSBzdHJpbmcgdG8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByZXBsYWNlbWVudCBUaGUgc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiBlYWNoIHJlcGxhY2VkIG9jY3VyZW5jZS5cbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIG9jY3VyZW5jZXMgdG8gcmVwbGFjZSAoMCBtZWFucyBpbmZpbml0ZSBudW1iZXIgb2Ygb2NjdXJlbmNlcylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtBcnJheV0gQSBkZXN0cnVjdHVyYWJsZSBhcnJheSBjb250YWluaW5nIHRoZSByZXBsYWNlZCBzdHJpbmcgYW5kIHRoZSBudW1iZXIgb2YgcmVwbGFjZWQgb2NjdXJlbmNlcy4gRm9yIGluc3RhbmNlOiBbXCJteSByZXBsYWNlZCBzdHJpbmdcIiwgMl1cbiAgICAjXG4gICAgcmVwbGFjZUFsbDogKHN0ciwgcmVwbGFjZW1lbnQsIGxpbWl0ID0gMCkgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgY291bnQgPSAwXG4gICAgICAgIHdoaWxlIEByZWdleC50ZXN0KHN0cikgYW5kIChsaW1pdCBpcyAwIG9yIGNvdW50IDwgbGltaXQpXG4gICAgICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UgQHJlZ2V4LCByZXBsYWNlbWVudFxuICAgICAgICAgICAgY291bnQrK1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFtzdHIsIGNvdW50XVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblxuXG4iLCJcblV0aWxzICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBVbmVzY2FwZXIgZW5jYXBzdWxhdGVzIHVuZXNjYXBpbmcgcnVsZXMgZm9yIHNpbmdsZSBhbmQgZG91YmxlLXF1b3RlZCBZQU1MIHN0cmluZ3MuXG4jXG5jbGFzcyBVbmVzY2FwZXJcblxuICAgICMgUmVnZXggZnJhZ21lbnQgdGhhdCBtYXRjaGVzIGFuIGVzY2FwZWQgY2hhcmFjdGVyIGluXG4gICAgIyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgIEBQQVRURVJOX0VTQ0FQRURfQ0hBUkFDVEVSOiAgICAgbmV3IFBhdHRlcm4gJ1xcXFxcXFxcKFswYWJ0XFx0bnZmcmUgXCJcXFxcL1xcXFxcXFxcTl9MUF18eFswLTlhLWZBLUZdezJ9fHVbMC05YS1mQS1GXXs0fXxVWzAtOWEtZkEtRl17OH0pJztcblxuXG4gICAgIyBVbmVzY2FwZXMgYSBzaW5nbGUgcXVvdGVkIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICAgICAgdmFsdWUgQSBzaW5nbGUgcXVvdGVkIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgVGhlIHVuZXNjYXBlZCBzdHJpbmcuXG4gICAgI1xuICAgIEB1bmVzY2FwZVNpbmdsZVF1b3RlZFN0cmluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFwnXFwnL2csICdcXCcnKVxuXG5cbiAgICAjIFVuZXNjYXBlcyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAjXG4gICAgQHVuZXNjYXBlRG91YmxlUXVvdGVkU3RyaW5nOiAodmFsdWUpIC0+XG4gICAgICAgIEBfdW5lc2NhcGVDYWxsYmFjayA/PSAoc3RyKSA9PlxuICAgICAgICAgICAgcmV0dXJuIEB1bmVzY2FwZUNoYXJhY3RlcihzdHIpXG5cbiAgICAgICAgIyBFdmFsdWF0ZSB0aGUgc3RyaW5nXG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9FU0NBUEVEX0NIQVJBQ1RFUi5yZXBsYWNlIHZhbHVlLCBAX3VuZXNjYXBlQ2FsbGJhY2tcblxuXG4gICAgIyBVbmVzY2FwZXMgYSBjaGFyYWN0ZXIgdGhhdCB3YXMgZm91bmQgaW4gYSBkb3VibGUtcXVvdGVkIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBbiBlc2NhcGVkIGNoYXJhY3RlclxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIGNoYXJhY3RlclxuICAgICNcbiAgICBAdW5lc2NhcGVDaGFyYWN0ZXI6ICh2YWx1ZSkgLT5cbiAgICAgICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICAgICAgIHN3aXRjaCB2YWx1ZS5jaGFyQXQoMSlcbiAgICAgICAgICAgIHdoZW4gJzAnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDApXG4gICAgICAgICAgICB3aGVuICdhJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCg3KVxuICAgICAgICAgICAgd2hlbiAnYidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goOClcbiAgICAgICAgICAgIHdoZW4gJ3QnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFx0XCJcbiAgICAgICAgICAgIHdoZW4gXCJcXHRcIlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlxcdFwiXG4gICAgICAgICAgICB3aGVuICduJ1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlxcblwiXG4gICAgICAgICAgICB3aGVuICd2J1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgxMSlcbiAgICAgICAgICAgIHdoZW4gJ2YnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDEyKVxuICAgICAgICAgICAgd2hlbiAncidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMTMpXG4gICAgICAgICAgICB3aGVuICdlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgyNylcbiAgICAgICAgICAgIHdoZW4gJyAnXG4gICAgICAgICAgICAgICAgcmV0dXJuICcgJ1xuICAgICAgICAgICAgd2hlbiAnXCInXG4gICAgICAgICAgICAgICAgcmV0dXJuICdcIidcbiAgICAgICAgICAgIHdoZW4gJy8nXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvJ1xuICAgICAgICAgICAgd2hlbiAnXFxcXCdcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1xcXFwnXG4gICAgICAgICAgICB3aGVuICdOJ1xuICAgICAgICAgICAgICAgICMgVSswMDg1IE5FWFQgTElORVxuICAgICAgICAgICAgICAgIHJldHVybiBjaCgweDAwODUpXG4gICAgICAgICAgICB3aGVuICdfJ1xuICAgICAgICAgICAgICAgICMgVSswMEEwIE5PLUJSRUFLIFNQQUNFXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MDBBMClcbiAgICAgICAgICAgIHdoZW4gJ0wnXG4gICAgICAgICAgICAgICAgIyBVKzIwMjggTElORSBTRVBBUkFUT1JcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgyMDI4KVxuICAgICAgICAgICAgd2hlbiAnUCdcbiAgICAgICAgICAgICAgICAjIFUrMjAyOSBQQVJBR1JBUEggU0VQQVJBVE9SXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MjAyOSlcbiAgICAgICAgICAgIHdoZW4gJ3gnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnV0ZjhjaHIoVXRpbHMuaGV4RGVjKHZhbHVlLnN1YnN0cigyLCAyKSkpXG4gICAgICAgICAgICB3aGVuICd1J1xuICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy51dGY4Y2hyKFV0aWxzLmhleERlYyh2YWx1ZS5zdWJzdHIoMiwgNCkpKVxuICAgICAgICAgICAgd2hlbiAnVSdcbiAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMudXRmOGNocihVdGlscy5oZXhEZWModmFsdWUuc3Vic3RyKDIsIDgpKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gJydcblxubW9kdWxlLmV4cG9ydHMgPSBVbmVzY2FwZXJcbiIsIlxuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBBIGJ1bmNoIG9mIHV0aWxpdHkgbWV0aG9kc1xuI1xuY2xhc3MgVXRpbHNcblxuICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUjogICB7fVxuICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVI6ICB7fVxuICAgIEBSRUdFWF9TUEFDRVM6ICAgICAgICAgICAgICAvXFxzKy9nXG4gICAgQFJFR0VYX0RJR0lUUzogICAgICAgICAgICAgIC9eXFxkKyQvXG4gICAgQFJFR0VYX09DVEFMOiAgICAgICAgICAgICAgIC9bXjAtN10vZ2lcbiAgICBAUkVHRVhfSEVYQURFQ0lNQUw6ICAgICAgICAgL1teYS1mMC05XS9naVxuXG4gICAgIyBQcmVjb21waWxlZCBkYXRlIHBhdHRlcm5cbiAgICBAUEFUVEVSTl9EQVRFOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14nK1xuICAgICAgICAgICAgJyg/PHllYXI+WzAtOV1bMC05XVswLTldWzAtOV0pJytcbiAgICAgICAgICAgICctKD88bW9udGg+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICctKD88ZGF5PlswLTldWzAtOV0/KScrXG4gICAgICAgICAgICAnKD86KD86W1R0XXxbIFxcdF0rKScrXG4gICAgICAgICAgICAnKD88aG91cj5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJzooPzxtaW51dGU+WzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJzooPzxzZWNvbmQ+WzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJyg/OlxcLig/PGZyYWN0aW9uPlswLTldKikpPycrXG4gICAgICAgICAgICAnKD86WyBcXHRdKig/PHR6Plp8KD88dHpfc2lnbj5bLStdKSg/PHR6X2hvdXI+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICcoPzo6KD88dHpfbWludXRlPlswLTldWzAtOV0pKT8pKT8pPycrXG4gICAgICAgICAgICAnJCcsICdpJ1xuXG4gICAgIyBMb2NhbCB0aW1lem9uZSBvZmZzZXQgaW4gbXNcbiAgICBATE9DQUxfVElNRVpPTkVfT0ZGU0VUOiAgICAgbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpICogNjAgKiAxMDAwXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gYm90aCBzaWRlc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gX2NoYXIgVGhlIGNoYXJhY3RlciB0byB1c2UgZm9yIHRyaW1taW5nIChkZWZhdWx0OiAnXFxcXHMnKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gQSB0cmltbWVkIHN0cmluZ1xuICAgICNcbiAgICBAdHJpbTogKHN0ciwgX2NoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleExlZnQ/XG4gICAgICAgICAgICBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhMZWZ0ID0gbmV3IFJlZ0V4cCAnXicrX2NoYXIrJycrX2NoYXIrJyonXG4gICAgICAgIHJlZ2V4TGVmdC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJlZ2V4UmlnaHQgPSBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW19jaGFyXVxuICAgICAgICB1bmxlc3MgcmVnZXhSaWdodD9cbiAgICAgICAgICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgX2NoYXIrJycrX2NoYXIrJyokJ1xuICAgICAgICByZWdleFJpZ2h0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZ2V4TGVmdCwgJycpLnJlcGxhY2UocmVnZXhSaWdodCwgJycpXG5cblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiB0aGUgbGVmdCBzaWRlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBfY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEBsdHJpbTogKHN0ciwgX2NoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleExlZnQ/XG4gICAgICAgICAgICBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhMZWZ0ID0gbmV3IFJlZ0V4cCAnXicrX2NoYXIrJycrX2NoYXIrJyonXG4gICAgICAgIHJlZ2V4TGVmdC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleExlZnQsICcnKVxuXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gdGhlIHJpZ2h0IHNpZGVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdHJpbVxuICAgICMgQHBhcmFtIFtTdHJpbmddIF9jaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQHJ0cmltOiAoc3RyLCBfY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4UmlnaHQgPSBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW19jaGFyXVxuICAgICAgICB1bmxlc3MgcmVnZXhSaWdodD9cbiAgICAgICAgICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgX2NoYXIrJycrX2NoYXIrJyokJ1xuICAgICAgICByZWdleFJpZ2h0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZ2V4UmlnaHQsICcnKVxuXG5cbiAgICAjIENoZWNrcyBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgZW1wdHkgKG51bGwsIHVuZGVmaW5lZCwgZW1wdHkgc3RyaW5nLCBzdHJpbmcgJzAnLCBlbXB0eSBBcnJheSwgZW1wdHkgT2JqZWN0KVxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2tcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBlbXB0eVxuICAgICNcbiAgICBAaXNFbXB0eTogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gbm90KHZhbHVlKSBvciB2YWx1ZSBpcyAnJyBvciB2YWx1ZSBpcyAnMCcgb3IgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgYW5kIHZhbHVlLmxlbmd0aCBpcyAwKSBvciBAaXNFbXB0eU9iamVjdCh2YWx1ZSlcblxuICAgICMgQ2hlY2tzIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBlbXB0eSBvYmplY3RcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgZW1wdHkgYW5kIGlzIGFuIG9iamVjdFxuICAgICNcbiAgICBAaXNFbXB0eU9iamVjdDogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgYW5kIChrIGZvciBvd24gayBvZiB2YWx1ZSkubGVuZ3RoIGlzIDBcblxuICAgICMgQ291bnRzIHRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlcyBvZiBzdWJTdHJpbmcgaW5zaWRlIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHJpbmcgVGhlIHN0cmluZyB3aGVyZSB0byBjb3VudCBvY2N1cmVuY2VzXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3ViU3RyaW5nIFRoZSBzdWJTdHJpbmcgdG8gY291bnRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGxlbmd0aCBUaGUgc3RyaW5nIGxlbmd0aCB1bnRpbCB3aGVyZSB0byBjb3VudFxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlc1xuICAgICNcbiAgICBAc3ViU3RyQ291bnQ6IChzdHJpbmcsIHN1YlN0cmluZywgc3RhcnQsIGxlbmd0aCkgLT5cbiAgICAgICAgYyA9IDBcblxuICAgICAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICAgICAgICBzdWJTdHJpbmcgPSAnJyArIHN1YlN0cmluZ1xuXG4gICAgICAgIGlmIHN0YXJ0P1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nW3N0YXJ0Li5dXG4gICAgICAgIGlmIGxlbmd0aD9cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZ1swLi4ubGVuZ3RoXVxuXG4gICAgICAgIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAgICAgc3VibGVuID0gc3ViU3RyaW5nLmxlbmd0aFxuICAgICAgICBmb3IgaSBpbiBbMC4uLmxlbl1cbiAgICAgICAgICAgIGlmIHN1YlN0cmluZyBpcyBzdHJpbmdbaS4uLnN1Ymxlbl1cbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgICAgICBpICs9IHN1YmxlbiAtIDFcblxuICAgICAgICByZXR1cm4gY1xuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBpbnB1dCBpcyBvbmx5IGNvbXBvc2VkIG9mIGRpZ2l0c1xuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSBpbnB1dCBUaGUgdmFsdWUgdG8gdGVzdFxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgaW5wdXQgaXMgb25seSBjb21wb3NlZCBvZiBkaWdpdHNcbiAgICAjXG4gICAgQGlzRGlnaXRzOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9ESUdJVFMubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gQFJFR0VYX0RJR0lUUy50ZXN0IGlucHV0XG5cblxuICAgICMgRGVjb2RlIG9jdGFsIHZhbHVlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIGlucHV0IFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgZGVjb2RlZCB2YWx1ZVxuICAgICNcbiAgICBAb2N0RGVjOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9PQ1RBTC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBwYXJzZUludCgoaW5wdXQrJycpLnJlcGxhY2UoQFJFR0VYX09DVEFMLCAnJyksIDgpXG5cblxuICAgICMgRGVjb2RlIGhleGFkZWNpbWFsIHZhbHVlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIGlucHV0IFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgZGVjb2RlZCB2YWx1ZVxuICAgICNcbiAgICBAaGV4RGVjOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9IRVhBREVDSU1BTC5sYXN0SW5kZXggPSAwXG4gICAgICAgIGlucHV0ID0gQHRyaW0oaW5wdXQpXG4gICAgICAgIGlmIChpbnB1dCsnJylbMC4uLjJdIGlzICcweCcgdGhlbiBpbnB1dCA9IChpbnB1dCsnJylbMi4uXVxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoKGlucHV0KycnKS5yZXBsYWNlKEBSRUdFWF9IRVhBREVDSU1BTCwgJycpLCAxNilcblxuXG4gICAgIyBHZXQgdGhlIFVURi04IGNoYXJhY3RlciBmb3IgdGhlIGdpdmVuIGNvZGUgcG9pbnQuXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBjIFRoZSB1bmljb2RlIGNvZGUgcG9pbnRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIFRoZSBjb3JyZXNwb25kaW5nIFVURi04IGNoYXJhY3RlclxuICAgICNcbiAgICBAdXRmOGNocjogKGMpIC0+XG4gICAgICAgIGNoID0gU3RyaW5nLmZyb21DaGFyQ29kZVxuICAgICAgICBpZiAweDgwID4gKGMgJT0gMHgyMDAwMDApXG4gICAgICAgICAgICByZXR1cm4gY2goYylcbiAgICAgICAgaWYgMHg4MDAgPiBjXG4gICAgICAgICAgICByZXR1cm4gY2goMHhDMCB8IGM+PjYpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuICAgICAgICBpZiAweDEwMDAwID4gY1xuICAgICAgICAgICAgcmV0dXJuIGNoKDB4RTAgfCBjPj4xMikgKyBjaCgweDgwIHwgYz4+NiAmIDB4M0YpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuXG4gICAgICAgIHJldHVybiBjaCgweEYwIHwgYz4+MTgpICsgY2goMHg4MCB8IGM+PjEyICYgMHgzRikgKyBjaCgweDgwIHwgYz4+NiAmIDB4M0YpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuXG5cbiAgICAjIFJldHVybnMgdGhlIGJvb2xlYW4gdmFsdWUgZXF1aXZhbGVudCB0byB0aGUgZ2l2ZW4gaW5wdXRcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ3xPYmplY3RdICAgIGlucHV0ICAgICAgIFRoZSBpbnB1dCB2YWx1ZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgICAgICAgICBzdHJpY3QgICAgICBJZiBzZXQgdG8gZmFsc2UsIGFjY2VwdCAneWVzJyBhbmQgJ25vJyBhcyBib29sZWFuIHZhbHVlc1xuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICAgICAgdGhlIGJvb2xlYW4gdmFsdWVcbiAgICAjXG4gICAgQHBhcnNlQm9vbGVhbjogKGlucHV0LCBzdHJpY3QgPSB0cnVlKSAtPlxuICAgICAgICBpZiB0eXBlb2YoaW5wdXQpIGlzICdzdHJpbmcnXG4gICAgICAgICAgICBsb3dlcklucHV0ID0gaW5wdXQudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgaWYgbm90IHN0cmljdFxuICAgICAgICAgICAgICAgIGlmIGxvd2VySW5wdXQgaXMgJ25vJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnMCcgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIGlmIGxvd2VySW5wdXQgaXMgJ2ZhbHNlJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuICEhaW5wdXRcblxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBpbnB1dCBpcyBudW1lcmljXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIGlucHV0IFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiBpbnB1dCBpcyBudW1lcmljXG4gICAgI1xuICAgIEBpc051bWVyaWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX1NQQUNFUy5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiB0eXBlb2YoaW5wdXQpIGlzICdudW1iZXInIG9yIHR5cGVvZihpbnB1dCkgaXMgJ3N0cmluZycgYW5kICFpc05hTihpbnB1dCkgYW5kIGlucHV0LnJlcGxhY2UoQFJFR0VYX1NQQUNFUywgJycpIGlzbnQgJydcblxuXG4gICAgIyBSZXR1cm5zIGEgcGFyc2VkIGRhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgZGF0ZSBzdHJpbmcgdG8gcGFyc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtEYXRlXSBUaGUgcGFyc2VkIGRhdGUgb3IgbnVsbCBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICNcbiAgICBAc3RyaW5nVG9EYXRlOiAoc3RyKSAtPlxuICAgICAgICB1bmxlc3Mgc3RyPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgIyBQZXJmb3JtIHJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJuXG4gICAgICAgIGluZm8gPSBAUEFUVEVSTl9EQVRFLmV4ZWMgc3RyXG4gICAgICAgIHVubGVzcyBpbmZvXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgICMgRXh0cmFjdCB5ZWFyLCBtb250aCwgZGF5XG4gICAgICAgIHllYXIgPSBwYXJzZUludCBpbmZvLnllYXIsIDEwXG4gICAgICAgIG1vbnRoID0gcGFyc2VJbnQoaW5mby5tb250aCwgMTApIC0gMSAjIEluIGphdmFzY3JpcHQsIGphbnVhcnkgaXMgMCwgZmVicnVhcnkgMSwgZXRjLi4uXG4gICAgICAgIGRheSA9IHBhcnNlSW50IGluZm8uZGF5LCAxMFxuXG4gICAgICAgICMgSWYgbm8gaG91ciBpcyBnaXZlbiwgcmV0dXJuIGEgZGF0ZSB3aXRoIGRheSBwcmVjaXNpb25cbiAgICAgICAgdW5sZXNzIGluZm8uaG91cj9cbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5KVxuICAgICAgICAgICAgcmV0dXJuIGRhdGVcblxuICAgICAgICAjIEV4dHJhY3QgaG91ciwgbWludXRlLCBzZWNvbmRcbiAgICAgICAgaG91ciA9IHBhcnNlSW50IGluZm8uaG91ciwgMTBcbiAgICAgICAgbWludXRlID0gcGFyc2VJbnQgaW5mby5taW51dGUsIDEwXG4gICAgICAgIHNlY29uZCA9IHBhcnNlSW50IGluZm8uc2Vjb25kLCAxMFxuXG4gICAgICAgICMgRXh0cmFjdCBmcmFjdGlvbiwgaWYgZ2l2ZW5cbiAgICAgICAgaWYgaW5mby5mcmFjdGlvbj9cbiAgICAgICAgICAgIGZyYWN0aW9uID0gaW5mby5mcmFjdGlvblswLi4uM11cbiAgICAgICAgICAgIHdoaWxlIGZyYWN0aW9uLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmcmFjdGlvbiArPSAnMCdcbiAgICAgICAgICAgIGZyYWN0aW9uID0gcGFyc2VJbnQgZnJhY3Rpb24sIDEwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZyYWN0aW9uID0gMFxuXG4gICAgICAgICMgQ29tcHV0ZSB0aW1lem9uZSBvZmZzZXQgaWYgZ2l2ZW5cbiAgICAgICAgaWYgaW5mby50ej9cbiAgICAgICAgICAgIHR6X2hvdXIgPSBwYXJzZUludCBpbmZvLnR6X2hvdXIsIDEwXG4gICAgICAgICAgICBpZiBpbmZvLnR6X21pbnV0ZT9cbiAgICAgICAgICAgICAgICB0el9taW51dGUgPSBwYXJzZUludCBpbmZvLnR6X21pbnV0ZSwgMTBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0el9taW51dGUgPSAwXG5cbiAgICAgICAgICAgICMgQ29tcHV0ZSB0aW1lem9uZSBkZWx0YSBpbiBtc1xuICAgICAgICAgICAgdHpfb2Zmc2V0ID0gKHR6X2hvdXIgKiA2MCArIHR6X21pbnV0ZSkgKiA2MDAwMFxuICAgICAgICAgICAgaWYgJy0nIGlzIGluZm8udHpfc2lnblxuICAgICAgICAgICAgICAgIHR6X29mZnNldCAqPSAtMVxuXG4gICAgICAgICMgQ29tcHV0ZSBkYXRlXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhY3Rpb24pXG4gICAgICAgIGlmIHR6X29mZnNldFxuICAgICAgICAgICAgZGF0ZS5zZXRUaW1lIGRhdGUuZ2V0VGltZSgpIC0gdHpfb2Zmc2V0XG5cbiAgICAgICAgcmV0dXJuIGRhdGVcblxuXG4gICAgIyBSZXBlYXRzIHRoZSBnaXZlbiBzdHJpbmcgYSBudW1iZXIgb2YgdGltZXNcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzdHIgICAgIFRoZSBzdHJpbmcgdG8gcmVwZWF0XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBudW1iZXIgIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcmVwZWF0IHRoZSBzdHJpbmdcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgcmVwZWF0ZWQgc3RyaW5nXG4gICAgI1xuICAgIEBzdHJSZXBlYXQ6IChzdHIsIG51bWJlcikgLT5cbiAgICAgICAgcmVzID0gJydcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bWJlclxuICAgICAgICAgICAgcmVzICs9IHN0clxuICAgICAgICAgICAgaSsrXG4gICAgICAgIHJldHVybiByZXNcblxuXG4gICAgIyBSZWFkcyB0aGUgZGF0YSBmcm9tIHRoZSBnaXZlbiBmaWxlIHBhdGggYW5kIHJldHVybnMgdGhlIHJlc3VsdCBhcyBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICBUaGUgcGF0aCB0byB0aGUgZmlsZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gY2FsbGJhY2sgICAgQSBjYWxsYmFjayB0byByZWFkIGZpbGUgYXN5bmNocm9ub3VzbHkgKG9wdGlvbmFsKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSByZXN1bHRpbmcgZGF0YSBhcyBzdHJpbmdcbiAgICAjXG4gICAgQGdldFN0cmluZ0Zyb21GaWxlOiAocGF0aCwgY2FsbGJhY2sgPSBudWxsKSAtPlxuICAgICAgICB4aHIgPSBudWxsXG4gICAgICAgIGlmIHdpbmRvdz9cbiAgICAgICAgICAgIGlmIHdpbmRvdy5YTUxIdHRwUmVxdWVzdFxuICAgICAgICAgICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICAgICAgICBlbHNlIGlmIHdpbmRvdy5BY3RpdmVYT2JqZWN0XG4gICAgICAgICAgICAgICAgZm9yIG5hbWUgaW4gW1wiTXN4bWwyLlhNTEhUVFAuNi4wXCIsIFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIsIFwiTXN4bWwyLlhNTEhUVFBcIiwgXCJNaWNyb3NvZnQuWE1MSFRUUFwiXVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IG5ldyBBY3RpdmVYT2JqZWN0KG5hbWUpXG5cbiAgICAgICAgaWYgeGhyP1xuICAgICAgICAgICAgIyBCcm93c2VyXG4gICAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIHhoci5yZWFkeVN0YXRlIGlzIDRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgaXMgMjAwIG9yIHhoci5zdGF0dXMgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbClcbiAgICAgICAgICAgICAgICB4aHIub3BlbiAnR0VUJywgcGF0aCwgdHJ1ZVxuICAgICAgICAgICAgICAgIHhoci5zZW5kIG51bGxcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgICAgIHhoci5vcGVuICdHRVQnLCBwYXRoLCBmYWxzZVxuICAgICAgICAgICAgICAgIHhoci5zZW5kIG51bGxcblxuICAgICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgaXMgMjAwIG9yIHhoci5zdGF0dXMgPT0gMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBOb2RlLmpzLWxpa2VcbiAgICAgICAgICAgIHJlcSA9IHJlcXVpcmVcbiAgICAgICAgICAgIGZzID0gcmVxKCdmcycpICMgUHJldmVudCBicm93c2VyaWZ5IGZyb20gdHJ5aW5nIHRvIGxvYWQgJ2ZzJyBtb2R1bGVcbiAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICMgQXN5bmNcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZSBwYXRoLCAoZXJyLCBkYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrIG51bGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgU3RyaW5nKGRhdGEpXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIFN5bmNcbiAgICAgICAgICAgICAgICBkYXRhID0gZnMucmVhZEZpbGVTeW5jIHBhdGhcbiAgICAgICAgICAgICAgICBpZiBkYXRhP1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKGRhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiIsIlxuUGFyc2VyID0gcmVxdWlyZSAnLi9QYXJzZXInXG5EdW1wZXIgPSByZXF1aXJlICcuL0R1bXBlcidcblV0aWxzICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5cbiMgWWFtbCBvZmZlcnMgY29udmVuaWVuY2UgbWV0aG9kcyB0byBsb2FkIGFuZCBkdW1wIFlBTUwuXG4jXG5jbGFzcyBZYW1sXG5cbiAgICAjIFBhcnNlcyBZQU1MIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBUaGUgcGFyc2UgbWV0aG9kLCB3aGVuIHN1cHBsaWVkIHdpdGggYSBZQU1MIHN0cmluZyxcbiAgICAjIHdpbGwgZG8gaXRzIGJlc3QgdG8gY29udmVydCBZQU1MIGluIGEgZmlsZSBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgIFVzYWdlOlxuICAgICMgICAgIG15T2JqZWN0ID0gWWFtbC5wYXJzZSgnc29tZTogeWFtbCcpO1xuICAgICMgICAgIGNvbnNvbGUubG9nKG15T2JqZWN0KTtcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBpbnB1dCAgICAgICAgICAgICAgICAgICBBIHN0cmluZyBjb250YWluaW5nIFlBTUxcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMsIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBUaGUgWUFNTCBjb252ZXJ0ZWQgdG8gYSBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dIElmIHRoZSBZQU1MIGlzIG5vdCB2YWxpZFxuICAgICNcbiAgICBAcGFyc2U6IChpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgcmV0dXJuIG5ldyBQYXJzZXIoKS5wYXJzZShpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcilcblxuXG4gICAgIyBQYXJzZXMgWUFNTCBmcm9tIGZpbGUgcGF0aCBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgVGhlIHBhcnNlRmlsZSBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhIFlBTUwgZmlsZSxcbiAgICAjIHdpbGwgZG8gaXRzIGJlc3QgdG8gY29udmVydCBZQU1MIGluIGEgZmlsZSBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgIFVzYWdlOlxuICAgICMgICAgIG15T2JqZWN0ID0gWWFtbC5wYXJzZUZpbGUoJ2NvbmZpZy55bWwnKTtcbiAgICAjICAgICBjb25zb2xlLmxvZyhteU9iamVjdCk7XG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgcGF0aCAgICAgICAgICAgICAgICAgICAgQSBmaWxlIHBhdGggcG9pbnRpbmcgdG8gYSB2YWxpZCBZQU1MIGZpbGVcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMsIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBUaGUgWUFNTCBjb252ZXJ0ZWQgdG8gYSBKYXZhU2NyaXB0IG9iamVjdCBvciBudWxsIGlmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QuXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIEBwYXJzZUZpbGU6IChwYXRoLCBjYWxsYmFjayA9IG51bGwsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgIyBBc3luY1xuICAgICAgICAgICAgVXRpbHMuZ2V0U3RyaW5nRnJvbUZpbGUgcGF0aCwgKGlucHV0KSA9PlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgICAgICAgICBpZiBpbnB1dD9cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlIGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgcmVzdWx0XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgaW5wdXQgPSBVdGlscy5nZXRTdHJpbmdGcm9tRmlsZSBwYXRoXG4gICAgICAgICAgICBpZiBpbnB1dD9cbiAgICAgICAgICAgICAgICByZXR1cm4gQHBhcnNlIGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG5cbiAgICAjIER1bXBzIGEgSmF2YVNjcmlwdCBvYmplY3QgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBUaGUgZHVtcCBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhbiBvYmplY3QsIHdpbGwgZG8gaXRzIGJlc3RcbiAgICAjIHRvIGNvbnZlcnQgdGhlIG9iamVjdCBpbnRvIGZyaWVuZGx5IFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgaW5wdXQgICAgICAgICAgICAgICAgICAgSmF2YVNjcmlwdCBvYmplY3RcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGlubGluZSAgICAgICAgICAgICAgICAgIFRoZSBsZXZlbCB3aGVyZSB5b3Ugc3dpdGNoIHRvIGlubGluZSBZQU1MXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmRlbnQgICAgICAgICAgICAgICAgICBUaGUgYW1vdW50IG9mIHNwYWNlcyB0byB1c2UgZm9yIGluZGVudGF0aW9uIG9mIG5lc3RlZCBub2Rlcy5cbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBvcmlnaW5hbCBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICBAZHVtcDogKGlucHV0LCBpbmxpbmUgPSAyLCBpbmRlbnQgPSA0LCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdEVuY29kZXIgPSBudWxsKSAtPlxuICAgICAgICB5YW1sID0gbmV3IER1bXBlcigpXG4gICAgICAgIHlhbWwuaW5kZW50YXRpb24gPSBpbmRlbnRcblxuICAgICAgICByZXR1cm4geWFtbC5kdW1wKGlucHV0LCBpbmxpbmUsIDAsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpXG5cblxuICAgICMgQWxpYXMgb2YgZHVtcCgpIG1ldGhvZCBmb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLlxuICAgICNcbiAgICBAc3RyaW5naWZ5OiAoaW5wdXQsIGlubGluZSwgaW5kZW50LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSAtPlxuICAgICAgICByZXR1cm4gQGR1bXAgaW5wdXQsIGlubGluZSwgaW5kZW50LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyXG5cblxuICAgICMgQWxpYXMgb2YgcGFyc2VGaWxlKCkgbWV0aG9kIGZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMuXG4gICAgI1xuICAgIEBsb2FkOiAocGF0aCwgY2FsbGJhY2ssIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXIpIC0+XG4gICAgICAgIHJldHVybiBAcGFyc2VGaWxlIHBhdGgsIGNhbGxiYWNrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cblxuIyBFeHBvc2UgWUFNTCBuYW1lc3BhY2UgdG8gYnJvd3Nlclxud2luZG93Py5ZQU1MID0gWWFtbFxuXG4jIE5vdCBpbiB0aGUgYnJvd3Nlcj9cbnVubGVzcyB3aW5kb3c/XG4gICAgQFlBTUwgPSBZYW1sXG5cbm1vZHVsZS5leHBvcnRzID0gWWFtbFxuIl19
