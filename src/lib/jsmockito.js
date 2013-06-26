/*
 * JsHamcrest v0.7.0
 * http://danielfm.github.com/jshamcrest/
 *
 * Library of matcher objects for JavaScript.
 *
 * Copyright (c) 2009-2013 Daniel Fernandes Martins
 * Licensed under the BSD license.
 *
 * Revision: 13d2f6ac0272b6b679eca295514fe69c0a84251a
 * Date:     Sat Jan 26 12:47:27 2013 -0200
 */

var JsHamcrest = {
  /**
   * Library version.
   */
  version: '0.7.0',

  /**
   * Delegate function, useful when used to create a matcher that has a value-equalTo semantic
   */
  EqualTo: function (func) {
    return function (matcherOrValue) {
      if (!JsHamcrest.isMatcher(matcherOrValue)) {
        return func(JsHamcrest.Matchers.equalTo(matcherOrValue));
      }
      return func(matcherOrValue);
    };
  },

  /**
   * Returns whether the given object is a matcher.
   */
  isMatcher: function(obj) {
    return obj instanceof JsHamcrest.SimpleMatcher;
  },

  /**
   * Returns whether the given arrays are equivalent.
   */
  areArraysEqual: function(array, anotherArray) {
    if (array instanceof Array || anotherArray instanceof Array) {
      if (array.length != anotherArray.length) {
        return false;
      }

      for (var i = 0; i < array.length; i++) {
        var a = array[i];
        var b = anotherArray[i];

        if (a instanceof Array || b instanceof Array) {
          if(!JsHamcrest.areArraysEqual(a, b)) {
            return false;
          }
        } else if (a != b) {
          return false;
        }
      }
      return true;
    } else {
      return array == anotherArray;
    }
  },

  /**
   * Returns whether the given Arrays are equivalent. This will return true if the objects
   * inside the Arrays are equivalent i.e. they dont have to be the same object reference.
   * Two objects with the same key value pairs will be equivalent eventhough they are not
   * the same object.
   *
   * @param {type} expected A map of expected values.
   * @param {type} actual A map of the actual values.
   * @returns {Boolean} A Boolean signifing if the two Arrays are equivalent, true if they are.
   */
  areArraysEquivalent: function(expected, actual)
  {
    if (expected.length !== actual.length)
    {
        return false;
    }

    for (var i = 0; i < expected.length; i++)
    {
        var a = expected[i];
        var b = actual[i];

        if(JsHamcrest.areTwoEntitiesEquivalent(a, b) === false)
        {
            return false;
        }
    }

    return true;
  },

  /**
   * Returns whether the given maps are equivalent. This will return true if the objects
   * inside the maps are equivalent i.e. they dont have to be the same object reference.
   * Two objects with the same key value pairs will be equivalent eventhough they are not
   * the same object.
   *
   * @param {type} expected A map of expected values.
   * @param {type} actual A map of the actual values.
   * @returns {Boolean} A Boolean signifing if the two maps are equivalent, true if they are.
   */
  areMapsEquivalent: function(expected, actual)
  {
    // we need to do this both ways in case both maps have undefined values (which makes counting the number
    // of keys a non-acceptable comparison).
    if(JsHamcrest.simpleMapCompare(expected, actual) && JsHamcrest.simpleMapCompare(actual, expected))
    {
        return true;
    }

    return false;
  },

  simpleMapCompare: function(firstMap, secondMap)
  {
    for(var item in firstMap)
    {
        if(firstMap.hasOwnProperty(item))
        {
            if(!JsHamcrest.areTwoEntitiesEquivalent(firstMap[item], secondMap[item])) return false;
        }
    }

    return true;
  },

  areTwoEntitiesEquivalent: function(expected, actual)
  {
    var expectedsMatcher = JsHamcrest.retreiveEntityMatcherFunction(expected);
    var actualsMatcher = JsHamcrest.retreiveEntityMatcherFunction(actual);

    if(expectedsMatcher === actualsMatcher && expectedsMatcher(expected, actual))
    {
        return true;
    }

    return false;
  },

  /**
   * Returns the function that would be used to compare the entity with an entity of the same type.
   *
   * @param {type} entity A JavaScript entity, this method will try and figure out what type.
   */
  retreiveEntityMatcherFunction: function(entity) {
    if ( (Array.isArray && Array.isArray(entity)) || entity instanceof Array ) return JsHamcrest.areArraysEquivalent;

    if(entity instanceof Boolean) return JsHamcrest.areBooleansEqual;

    if(entity instanceof Date) return JsHamcrest.areDatesEqual;

    if(entity instanceof Function) return JsHamcrest.areFunctionsEqual;

    if(entity instanceof Number || typeof entity === "number") return JsHamcrest.areNumbersEqual;

    if(entity instanceof String || typeof entity === "string") return JsHamcrest.areStringsEqual;

    if(entity instanceof RegExp) return JsHamcrest.areRegExpEqual;

    if(entity instanceof Error) return JsHamcrest.areErrorsEqual;

    if(typeof entity === "undefined") return JsHamcrest.areEntitiesUndefined;

    if(entity === null) return JsHamcrest.areEntitiesNull;

    if(entity.constructor === Object) return JsHamcrest.areMapsEquivalent;

    return JsHamcrest.areEntitiesStrictlyEquals;
  },

  /**
   * Simple comparator functions.
   *
   * @param {type} expected The Object that is expected to be present.
   * @param {type} actual The Object that is actually present.
   */
  areBooleansEqual: function(expected, actual) { return expected.toString() === actual.toString(); },

  areDatesEqual: function(expected, actual) {    return expected.toString() === actual.toString(); },

  areFunctionsEqual: function(expected, actual) {    return expected === actual; },

  areNumbersEqual: function(expected, actual) { return expected.valueOf() === actual.valueOf(); },

  areStringsEqual: function(expected, actual) { return expected.valueOf() === actual.valueOf(); },

  areRegExpEqual: function(expected, actual) { return expected.toString() === actual.toString(); },

  areErrorsEqual: function(expected, actual) { return expected.constructor === actual.constructor && expected.message === actual.message; },

  areEntitiesUndefined: function(expected, actual) { return expected === actual; },

  areEntitiesNull: function(expected, actual) { return expected === actual; },

  areEntitiesStrictlyEquals: function(expected, actual) { return expected === actual; },

  /**
   * Builds a matcher object that uses external functions provided by the
   * caller in order to define the current matching logic.
   */
  SimpleMatcher: function(params) {
    params = params || {};

    this.matches = params.matches;
    this.describeTo = params.describeTo;

    // Replace the function to describe the actual value
    if (params.describeValueTo) {
      this.describeValueTo = params.describeValueTo;
    }
  },

  /**
   * Matcher that provides an easy way to wrap several matchers into one.
   */
  CombinableMatcher: function(params) {
    // Call superclass' constructor
    JsHamcrest.SimpleMatcher.apply(this, arguments);

    params = params || {};

    this.and = function(anotherMatcher) {
      var all = JsHamcrest.Matchers.allOf(this, anotherMatcher);
      return new JsHamcrest.CombinableMatcher({
        matches: all.matches,

        describeTo: function(description) {
          description.appendDescriptionOf(all);
        }
      });
    };

    this.or = function(anotherMatcher) {
      var any = JsHamcrest.Matchers.anyOf(this, anotherMatcher);
      return new JsHamcrest.CombinableMatcher({
        matches: any.matches,

        describeTo: function(description) {
          description.appendDescriptionOf(any);
        }
      });
    };
  },

  /**
   * Class that builds assertion error messages.
   */
  Description: function() {
    var value = '';

    this.get = function() {
      return value;
    };

    this.appendDescriptionOf = function(selfDescribingObject) {
      if (selfDescribingObject) {
        selfDescribingObject.describeTo(this);
      }
      return this;
    };

    this.append = function(text) {
      if (text != null) {
        value += text;
      }
      return this;
    };

    this.appendLiteral = function(literal) {
      var undefined;
      if (literal === undefined) {
        this.append('undefined');
      } else if (literal === null) {
        this.append('null');
      } else if (literal instanceof Array) {
        this.appendValueList('[', ', ', ']', literal);
      } else if (typeof literal == 'string') {
        this.append('"' + literal + '"');
      } else if (literal instanceof Function) {
        this.append('Function' + (literal.name ? ' ' + literal.name : ''));
      } else {
        this.append(literal);
      }
      return this;
    };

    this.appendValueList = function(start, separator, end, list) {
      this.append(start);
      for (var i = 0; i < list.length; i++) {
        if (i > 0) {
          this.append(separator);
        }
        this.appendLiteral(list[i]);
      }
      this.append(end);
      return this;
    };

    this.appendList = function(start, separator, end, list) {
      this.append(start);
      for (var i = 0; i < list.length; i++) {
        if (i > 0) {
          this.append(separator);
        }
        this.appendDescriptionOf(list[i]);
      }
      this.append(end);
      return this;
    };
  }
};


/**
 * Describes the actual value to the given description. This method is optional
 * and, if it's not present, the actual value will be described as a JavaScript
 * literal.
 */
JsHamcrest.SimpleMatcher.prototype.describeValueTo = function(actual, description) {
  description.appendLiteral(actual);
};


// CombinableMatcher is a specialization of SimpleMatcher
JsHamcrest.CombinableMatcher.prototype = new JsHamcrest.SimpleMatcher();
JsHamcrest.CombinableMatcher.prototype.constructor = JsHamcrest.CombinableMatcher;
JsHamcrest.Matchers = {};

/**
 * The actual value must be any value considered truth by the JavaScript
 * engine.
 */
JsHamcrest.Matchers.truth = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual;
    },

    describeTo: function(description) {
      description.append('truth');
    }
  });
};

/**
 * Delegate-only matcher frequently used to improve readability.
 */
JsHamcrest.Matchers.is = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return matcher.matches(actual);
    },

    describeTo: function(description) {
      description.append('is ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * The actual value must not match the given matcher or value.
 */
JsHamcrest.Matchers.not = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return !matcher.matches(actual);
    },

    describeTo: function(description) {
      description.append('not ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * The actual value must be equal to the given value.
 */
JsHamcrest.Matchers.equalTo = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      if (expected instanceof Array || actual instanceof Array) {
        return JsHamcrest.areArraysEqual(expected, actual);
      }
      return actual == expected;
    },

    describeTo: function(description) {
      description.append('equal to ').appendLiteral(expected);
    }
  });
};

/**
 * Useless always-match matcher.
 */
JsHamcrest.Matchers.anything = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return true;
    },

    describeTo: function(description) {
      description.append('anything');
    }
  });
};

/**
 * The actual value must be null (or undefined).
 */
JsHamcrest.Matchers.nil = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual == null;
    },

    describeTo: function(description) {
      description.appendLiteral(null);
    }
  });
};

/**
 * The actual value must be the same as the given value.
 */
JsHamcrest.Matchers.sameAs = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual === expected;
    },

    describeTo: function(description) {
      description.append('same as ').appendLiteral(expected);
    }
  });
};

/**
 * The actual value is a function and, when invoked, it should thrown an
 * exception with the given name.
 */
JsHamcrest.Matchers.raises = function(exceptionName) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actualFunction) {
      try {
        actualFunction();
      } catch (e) {
        if (e.name == exceptionName) {
          return true;
        } else {
          throw e;
        }
      }
      return false;
    },

    describeTo: function(description) {
      description.append('raises ').append(exceptionName);
    }
  });
};

/**
 * The actual value is a function and, when invoked, it should raise any
 * exception.
 */
JsHamcrest.Matchers.raisesAnything = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actualFunction) {
      try {
        actualFunction();
      } catch (e) {
        return true;
      }
      return false;
    },

    describeTo: function(description) {
      description.append('raises anything');
    }
  });
};

/**
 * Combinable matcher where the actual value must match both of the given
 * matchers.
 */
JsHamcrest.Matchers.both = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.CombinableMatcher({
    matches: matcher.matches,
    describeTo: function(description) {
      description.append('both ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * Combinable matcher where the actual value must match at least one of the
 * given matchers.
 */
JsHamcrest.Matchers.either = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.CombinableMatcher({
    matches: matcher.matches,
    describeTo: function(description) {
      description.append('either ').appendDescriptionOf(matcher);
    }
  });
});

/**
 * All the given values or matchers should match the actual value to be
 * sucessful. This matcher behaves pretty much like the && operator.
 */
JsHamcrest.Matchers.allOf = function() {
  var args = arguments;
  if (args[0] instanceof Array) {
    args = args[0];
  }
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      for (var i = 0; i < args.length; i++) {
        var matcher = args[i];
        if (!JsHamcrest.isMatcher(matcher)) {
          matcher = JsHamcrest.Matchers.equalTo(matcher);
        }
        if (!matcher.matches(actual)) {
          return false;
        }
      }
      return true;
    },

    describeTo: function(description) {
      description.appendList('(', ' and ', ')', args);
    }
  });
};

/**
 * At least one of the given matchers should match the actual value. This
 * matcher behaves pretty much like the || (or) operator.
 */
JsHamcrest.Matchers.anyOf = function() {
  var args = arguments;
  if (args[0] instanceof Array) {
    args = args[0];
  }
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      for (var i = 0; i < args.length; i++) {
        var matcher = args[i];
        if (!JsHamcrest.isMatcher(matcher)) {
          matcher = JsHamcrest.Matchers.equalTo(matcher);
        }
        if (matcher.matches(actual)) {
          return true;
        }
      }
      return false;
    },

    describeTo: function(description) {
      description.appendList('(', ' or ', ')', args);
    }
  });
};

/**
 * The actual number must be greater than the expected number.
 */
JsHamcrest.Matchers.greaterThan = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual > expected;
    },

    describeTo: function(description) {
      description.append('greater than ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be greater than or equal to the expected number
 */
JsHamcrest.Matchers.greaterThanOrEqualTo = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual >= expected;
    },

    describeTo: function(description) {
      description.append('greater than or equal to ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be less than the expected number.
 */
JsHamcrest.Matchers.lessThan = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual < expected;
    },

    describeTo: function(description) {
      description.append('less than ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be less than or equal to the expected number.
 */
JsHamcrest.Matchers.lessThanOrEqualTo = function(expected) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual <= expected;
    },

    describeTo: function(description) {
      description.append('less than or equal to ').append(expected);
    }
  });
};

/**
 * The actual value must not be a number.
 */
JsHamcrest.Matchers.notANumber = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return isNaN(actual);
    },

    describeTo: function(description) {
      description.append('not a number');
    }
  });
};

/**
 * The actual value must be divisible by the given number.
 */
JsHamcrest.Matchers.divisibleBy = function(divisor) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual % divisor === 0;
    },

    describeTo: function(description) {
      description.append('divisible by ').appendLiteral(divisor);
    }
  });
};

/**
 * The actual value must be even.
 */
JsHamcrest.Matchers.even = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual % 2 === 0;
    },

    describeTo: function(description) {
      description.append('even');
    }
  });
};

/**
 * The actual number must be odd.
 */
JsHamcrest.Matchers.odd = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual % 2 !== 0;
    },

    describeTo: function(description) {
      description.append('odd');
    }
  });
};

/**
 * The actual number must be between the given range (inclusive).
 */
JsHamcrest.Matchers.between = function(start) {
  return {
    and: function(end) {
      var greater = end;
      var lesser = start;

      if (start > end) {
        greater = start;
        lesser = end;
      }

      return new JsHamcrest.SimpleMatcher({
        matches: function(actual) {
          return actual >= lesser && actual <= greater;
        },

        describeTo: function(description) {
          description.append('between ').appendLiteral(lesser)
              .append(' and ').appendLiteral(greater);
        }
      });
    }
  };
};

/**
 * The actual number must be close enough to *expected*, that is, the actual
 *  number is equal to a value within some range of acceptable error.
 */
JsHamcrest.Matchers.closeTo = function(expected, delta) {
  if (!delta) {
    delta = 0;
  }

  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return (Math.abs(actual - expected) - delta) <= 0;
    },

    describeTo: function(description) {
      description.append('number within ')
          .appendLiteral(delta).append(' of ').appendLiteral(expected);
    }
  });
};

/**
 * The actual number must be zero.
 */
JsHamcrest.Matchers.zero = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual === 0;
    },

    describeTo: function(description) {
      description.append('zero');
    }
  });
};

/**
 * The actual string must be equal to the given string, ignoring case.
 */
JsHamcrest.Matchers.equalIgnoringCase = function(str) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual.toUpperCase() == str.toUpperCase();
    },

    describeTo: function(description) {
      description.append('equal ignoring case "').append(str).append('"');
    }
  });
};

/**
 * The actual string must have a substring equals to the given string.
 */
JsHamcrest.Matchers.containsString = function(str) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual.indexOf(str) >= 0;
    },

    describeTo: function(description) {
      description.append('contains string "').append(str).append('"');
    }
  });
};

/**
 * The actual string must start with the given string.
 */
JsHamcrest.Matchers.startsWith = function(str) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual.indexOf(str) === 0;
    },

    describeTo: function(description) {
      description.append('starts with ').appendLiteral(str);
    }
  });
};

/**
 * The actual string must end with the given string.
 */
JsHamcrest.Matchers.endsWith = function(str) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual.lastIndexOf(str) + str.length == actual.length;
    },

    describeTo: function(description) {
      description.append('ends with ').appendLiteral(str);
    }
  });
};

/**
 * The actual string must match the given regular expression.
 */
JsHamcrest.Matchers.matches = function(regex) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return regex.test(actual);
    },

    describeTo: function(description) {
      description.append('matches ').appendLiteral(regex);
    }
  });
};

/**
 * The actual string must look like an e-mail address.
 */
JsHamcrest.Matchers.emailAddress = function() {
  var regex = /^([a-z0-9_\.\-\+])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+$/i;

  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return regex.test(actual);
    },

    describeTo: function(description) {
      description.append('email address');
    }
  });
};

/**
 * The actual value has a member with the given name.
 */
JsHamcrest.Matchers.hasMember = function(memberName, matcherOrValue) {
  var undefined;
  if (matcherOrValue === undefined) {
    matcherOrValue = JsHamcrest.Matchers.anything();
  } else if (!JsHamcrest.isMatcher(matcherOrValue)) {
    matcherOrValue = JsHamcrest.Matchers.equalTo(matcherOrValue);
  }

  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      if (actual && memberName in actual) {
        return matcherOrValue.matches(actual[memberName]);
      }
      return false;
    },

    describeTo: function(description) {
      description.append('has member ').appendLiteral(memberName)
        .append(' (').appendDescriptionOf(matcherOrValue).append(')');
    }
  });
};

/**
 * The actual value has a function with the given name.
 */
JsHamcrest.Matchers.hasFunction = function(functionName) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      if (actual) {
        return functionName in actual &&
            actual[functionName] instanceof Function;
      }
      return false;
    },

    describeTo: function(description) {
      description.append('has function ').appendLiteral(functionName);
    }
  });
};

/**
 * The actual value must be an instance of the given class.
 */
JsHamcrest.Matchers.instanceOf = function(clazz) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return !!(actual instanceof clazz);
    },

    describeTo: function(description) {
      var className = clazz.name ? clazz.name : 'a class';
      description.append('instance of ').append(className);
    }
  });
};

/**
 * The actual value must be an instance of the given type.
 */
JsHamcrest.Matchers.typeOf = function(typeName) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return (typeof actual == typeName);
    },

    describeTo: function(description) {
      description.append('typeof ').append('"').append(typeName).append('"');
    }
  });
};

/**
 * The actual value must be an object.
 */
JsHamcrest.Matchers.object = function() {
  return new JsHamcrest.Matchers.instanceOf(Object);
};

/**
 * The actual value must be a string.
 */
JsHamcrest.Matchers.string = function() {
  return new JsHamcrest.Matchers.typeOf('string');
};

/**
 * The actual value must be a number.
 */
JsHamcrest.Matchers.number = function() {
  return new JsHamcrest.Matchers.typeOf('number');
};

/**
 * The actual value must be a boolean.
 */
JsHamcrest.Matchers.bool = function() {
  return new JsHamcrest.Matchers.typeOf('boolean');
};

/**
 * The actual value must be a function.
 */
JsHamcrest.Matchers.func = function() {
  return new JsHamcrest.Matchers.instanceOf(Function);
};

/**
 * The actual value should be an array and it must contain at least one value
 * that matches the given value or matcher.
 */
JsHamcrest.Matchers.hasItem = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      // Should be an array
      if (!(actual instanceof Array)) {
        return false;
      }

      for (var i = 0; i < actual.length; i++) {
        if (matcher.matches(actual[i])) {
          return true;
        }
      }
      return false;
    },

    describeTo: function(description) {
      description.append('array contains item ')
          .appendDescriptionOf(matcher);
      }
  });
});

/**
 * The actual value should be an array and the given values or matchers must
 * match at least one item.
 */
JsHamcrest.Matchers.hasItems = function() {
  var items = [];
  for (var i = 0; i < arguments.length; i++) {
    items.push(JsHamcrest.Matchers.hasItem(arguments[i]));
  }
  return JsHamcrest.Matchers.allOf(items);
};

/**
 * The actual value should be an array and the given value or matcher must
 * match all items.
 */
JsHamcrest.Matchers.everyItem = JsHamcrest.EqualTo(function(matcher) {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      // Should be an array
      if (!(actual instanceof Array)) {
        return false;
      }

      for (var i = 0; i < actual.length; i++) {
        if (!matcher.matches(actual[i])) {
          return false;
        }
      }
      return true;
    },

    describeTo: function(description) {
      description.append('every item ')
          .appendDescriptionOf(matcher);
    }
  });
});

/**
 * The given array must contain the actual value.
 */
JsHamcrest.Matchers.isIn = function() {
  var equalTo = JsHamcrest.Matchers.equalTo;

  var args = arguments;
  if (args[0] instanceof Array) {
    args = args[0];
  }

  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      for (var i = 0; i < args.length; i++) {
        if (equalTo(args[i]).matches(actual)) {
          return true;
        }
      }
      return false;
    },

    describeTo: function(description) {
      description.append('one of ').appendLiteral(args);
    }
  });
};

/**
 * Alias to 'isIn' matcher.
 */
JsHamcrest.Matchers.oneOf = JsHamcrest.Matchers.isIn;

/**
 * The actual value should be an array and it must be empty to be sucessful.
 */
JsHamcrest.Matchers.empty = function() {
  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return actual.length === 0;
    },

    describeTo: function(description) {
      description.append('empty');
    }
  });
};

/**
 * The length of the actual value value must match the given value or matcher.
 */
JsHamcrest.Matchers.hasSize = JsHamcrest.EqualTo(function(matcher) {
  var getSize = function(actual) {
    var size = actual.length;
    if (size === undefined && typeof actual === 'object') {
      size = 0;
      for (var key in actual)
        size++;
    }
    return size;
  };

  return new JsHamcrest.SimpleMatcher({
    matches: function(actual) {
      return matcher.matches(getSize(actual));
    },

    describeTo: function(description) {
      description.append('has size ').appendDescriptionOf(matcher);
    },

    describeValueTo: function(actual, description) {
      description.append(getSize(actual));
    }
  });
});

JsHamcrest.Matchers.equivalentMap = function(expected) {
    return new JsHamcrest.SimpleMatcher({
        matches: function(actual)
        {
            if(JsHamcrest.retreiveEntityMatcherFunction(actual) === JsHamcrest.areMapsEquivalent &&
                    JsHamcrest.retreiveEntityMatcherFunction(expected) === JsHamcrest.areMapsEquivalent)
            {
                return JsHamcrest.areMapsEquivalent(expected, actual);
            }

            return false; //The passed in objects aren't maps.
        },

        describeTo: function(description) {
            description.append('map equivalent to ').appendLiteral(expected);
        }
    });
};

JsHamcrest.Matchers.equivalentArray = function(expected) {
    return new JsHamcrest.SimpleMatcher({
        matches: function(actual)
        {
            if (expected instanceof Array && actual instanceof Array)
            {
                return JsHamcrest.areArraysEquivalent(expected, actual);
            }

            return false; //The passed in objects aren't Arrays.
        },

        describeTo: function(description) {
            description.append('array equivalent to ').appendLiteral(expected);
        }
    });
};
JsHamcrest.Operators = {};

/**
 * Returns those items of the array for which matcher matches.
 */
JsHamcrest.Operators.filter = function(array, matcherOrValue) {
  if (!(array instanceof Array) || matcherOrValue == null) {
    return array;
  }
  if (!(matcherOrValue instanceof JsHamcrest.SimpleMatcher)) {
    matcherOrValue = JsHamcrest.Matchers.equalTo(matcherOrValue);
  }

  var result = [];
  for (var i = 0; i < array.length; i++) {
    if (matcherOrValue.matches(array[i])) {
      result.push(array[i]);
    }
  }
  return result;
};

/**
 * Generic assert function.
 */
JsHamcrest.Operators.assert = function(actualValue, matcherOrValue, options) {
  options = options ? options : {};
  var description = new JsHamcrest.Description();

  if (matcherOrValue == null) {
    matcherOrValue = JsHamcrest.Matchers.truth();
  } else if (!JsHamcrest.isMatcher(matcherOrValue)) {
    matcherOrValue = JsHamcrest.Matchers.equalTo(matcherOrValue);
  }

  if (options.message) {
    description.append(options.message).append('. ');
  }

  description.append('Expected ');
  matcherOrValue.describeTo(description);

  if (!matcherOrValue.matches(actualValue)) {
    description.passed = false;
    description.append(' but was ');
    matcherOrValue.describeValueTo(actualValue, description);
    if (options.fail) {
      options.fail(description.get());
    }
  } else {
    description.append(': Success');
    description.passed = true;
    if (options.pass) {
      options.pass(description.get());
    }
  }
  return description;
};

/**
 * Delegate function, useful when used along with raises() and raisesAnything().
 */
JsHamcrest.Operators.callTo = function() {
  var func = [].shift.call(arguments);
  var args = arguments;
  return function() {
    return func.apply(this, args);
  };
};

JsHamcrest.Integration = {

   /**
   * Copies all members of an object to another.
   */
   copyMembers: function(source, target) {
   if (arguments.length == 1) {
      target = source;
      JsHamcrest.Integration.copyMembers(JsHamcrest.Matchers, target);
      JsHamcrest.Integration.copyMembers(JsHamcrest.Operators, target);
   } else if (source) {
      for (var method in source) {
         if (!(method in target)) {
         target[method] = source[method];
         }
      }
   }
   },

   /**
   * Adds the members of the given object to JsHamcrest.Matchers
   * namespace.
   */
   installMatchers: function(matchersNamespace) {
   var target = JsHamcrest.Matchers;
   JsHamcrest.Integration.copyMembers(matchersNamespace, target);
   },

   /**
   * Adds the members of the given object to JsHamcrest.Operators
   * namespace.
   */
   installOperators: function(operatorsNamespace) {
   var target = JsHamcrest.Operators;
   JsHamcrest.Integration.copyMembers(operatorsNamespace, target);
   }
};
JsHamcrest.Integration.copyMembers(this);

/* vi:ts=2 sw=2 expandtab
 *
 * JsMockito v1.0.4
 * http://github.com/chrisleishman/jsmockito
 *
 * Mockito port to JavaScript
 *
 * Copyright (c) 2009 Chris Leishman
 * Licensed under the BSD license
 */

/**
 * Main namespace.
 * @namespace
 *
 * <h2>Contents</h2>
 *
 * <ol>
 *  <li><a href="#1">Let's verify some behaviour!</a></li>
 *  <li><a href="#2">How about some stubbing?</a></li>
 *  <li><a href="#3">Matching Arguments</a></li>
 *  <li><a href="#4">Verifying exact number of invocations / at least once /
 *  never</a></li>
 *  <li><a href="#5">Matching the context ('this')</a></li>
 *  <li><a href="#6">Making sure interactions never happened on a mock</a></li>
 *  <li><a href="#7">Finding redundant invocations</a></li>
 * </ol>
 *
 * <p>In the following examples object mocking is done with Array as this is
 * well understood, although you probably wouldn't mock this in normal test
 * development.</p>
 *
 * <h2><a name="1">1. Let's verify some behaviour!</a></h2>
 *
 * <p>For an object:</p>
 * <pre>
 * //mock creation
 * var mockedArray = mock(Array);
 *
 * //using mock object
 * mockedArray.push("one");
 * mockedArray.reverse();
 *
 * //verification
 * verify(mockedArray).push("one");
 * verify(mockedArray).reverse();
 * </pre>
 *
 * <p>For a function:</p>
 * <pre>
 * //mock creation
 * var mockedFunc = mockFunction();
 *
 * //using mock function
 * mockedFunc('hello world');
 * mockedFunc.call(this, 'foobar');
 * mockedFunc.apply(this, [ 'barfoo' ]);
 *
 * //verification
 * verify(mockedFunc)('hello world');
 * verify(mockedFunc)('foobar');
 * verify(mockedFunc)('barfoo');
 * </pre>
 *
 * <p>Once created a mock will remember all interactions.  Then you selectively
 * verify whatever interactions you are interested in.</p>
 *
 * <h2><a name="2">2. How about some stubbing?</a></h2>
 *
 * <p>For an object:</p>
 * <pre>
 * var mockedArray = mock(Array);
 *
 * //stubbing
 * when(mockedArray).slice(0).thenReturn('f');
 * when(mockedArray).slice(1).thenThrow('An exception');
 * when(mockedArray).slice(2).then(function() { return 1+2 });
 *
 * //the following returns "f"
 * assertThat(mockedArray.slice(0), equalTo('f'));
 *
 * //the following throws exception 'An exception'
 * var ex = undefined;
 * try {
 *   mockedArray.slice(1);
 * } catch (e) {
 *   ex = e;
 * }
 * assertThat(ex, equalTo('An exception');
 *
 * //the following invokes the stub method, which returns 3
 * assertThat(mockedArray.slice(2), equalTo(3));
 *
 * //the following returns undefined as slice(999) was not stubbed
 * assertThat(mockedArray.slice(999), typeOf('undefined'));
 *
 * //stubs can take multiple values to return in order (same for 'thenThrow' and 'then' as well)
 * when(mockedArray).pop().thenReturn('a', 'b', 'c');
 * assertThat(mockedArray.pop(), equalTo('a'));
 * assertThat(mockedArray.pop(), equalTo('b'));
 * assertThat(mockedArray.pop(), equalTo('c'));
 * assertThat(mockedArray.pop(), equalTo('c'));
 *
 * //stubs can also be chained to return values in order
 * when(mockedArray).unshift().thenReturn('a').thenReturn('b').then(function() { return 'c' });
 * assertThat(mockedArray.unshift(), equalTo('a'));
 * assertThat(mockedArray.unshift(), equalTo('b'));
 * assertThat(mockedArray.unshift(), equalTo('c'));
 * assertThat(mockedArray.unshift(), equalTo('c'));
 *
 * //stub matching can overlap, allowing for specific cases and defaults
 * when(mockedArray).slice(3).thenReturn('abcde');
 * when(mockedArray).slice(3, lessThan(0)).thenReturn('edcba');
 * assertThat(mockedArray.slice(3, -1), equalTo('edcba'));
 * assertThat(mockedArray.slice(3, 1), equalTo('abcde'));
 * assertThat(mockedArray.slice(3), equalTo('abcde'));
 *
 * //can also verify a stubbed invocation, although this is usually redundant
 * verify(mockedArray).slice(0);
 * </pre>
 *
 * <p>For a function:</p>
 * <pre>
 * var mockedFunc = mockFunction();
 *
 * //stubbing
 * when(mockedFunc)(0).thenReturn('f');
 * when(mockedFunc)(1).thenThrow('An exception');
 * when(mockedFunc)(2).then(function() { return 1+2 });
 *
 * //the following returns "f"
 * assertThat(mockedFunc(0), equalTo('f'))
 *
 * //following throws exception 'An exception'
 * mockedFunc(1);
 * //the following throws exception 'An exception'
 * var ex = undefined;
 * try {
 *   mockedFunc(1);
 * } catch (e) {
 *   ex = e;
 * }
 * assertThat(ex, equalTo('An exception');
 *
 * //the following invokes the stub method, which returns 3
 * assertThat(mockedFunc(2), equalTo(3));
 *
 * //following returns undefined as mockedFunc(999) was not stubbed
 * assertThat(mockedFunc(999), typeOf('undefined'));
 *
 * //stubs can take multiple values to return in order (same for 'thenThrow' and 'then' as well)
 * when(mockedFunc)(3).thenReturn('a', 'b', 'c');
 * assertThat(mockedFunc(3), equalTo('a'));
 * assertThat(mockedFunc(3), equalTo('b'));
 * assertThat(mockedFunc(3), equalTo('c'));
 * assertThat(mockedFunc(3), equalTo('c'));
 *
 * //stubs can also be chained to return values in order
 * when(mockedFunc)(4).thenReturn('a').thenReturn('b').then(function() { return 'c' });
 * assertThat(mockedFunc(4), equalTo('a'));
 * assertThat(mockedFunc(4), equalTo('b'));
 * assertThat(mockedFunc(4), equalTo('c'));
 * assertThat(mockedFunc(4), equalTo('c'));
 *
 * //stub matching can overlap, allowing for specific cases and defaults
 * when(mockedFunc)(5).thenReturn('abcde')
 * when(mockedFunc)(5, lessThan(0)).thenReturn('edcba')
 * assertThat(mockedFunc(5, -1), equalTo('edcba'))
 * assertThat(mockedFunc(5, 1), equalTo('abcde'))
 * assertThat(mockedFunc(5), equalTo('abcde'))
 *
 * //can also verify a stubbed invocation, although this is usually redundant
 * verify(mockedFunc)(0);
 * </pre>
 *
 * <ul>
 * <li>By default mocks return undefined from all invocations;</li>
 * <li>Stubs can be overwritten;</li>
 * <li>Once stubbed, the method will always return the stubbed value regardless
 * of how many times it is called;</li>
 * <li>Last stubbing is more important - when you stubbed the same method with
 * the same (or overlapping) matchers many times.</li>
 * </ul>
 *
 * <h2><a name="3">3. Matching Arguments</a></h2>
 *
 * <p>JsMockito verifies arguments using
 * <a href="http://jshamcrest.destaquenet.com/">JsHamcrest</a> matchers.
 *
 * <pre>
 * var mockedArray = mock(Array);
 * var mockedFunc = mockFunction();
 *
 * //stubbing using JsHamcrest
 * when(mockedArray).slice(lessThan(10)).thenReturn('f');
 * when(mockedFunc)(containsString('world')).thenReturn('foobar');
 *
 * //following returns "f"
 * mockedArray.slice(5);
 *
 * //following returns "foobar"
 * mockedFunc('hello world');
 *
 * //you can also use matchers in verification
 * verify(mockedArray).slice(greaterThan(4));
 * verify(mockedFunc)(equalTo('hello world'));
 *
 * //if not specified then the matcher is anything(), thus either of these
 * //will match an invocation with a single argument
 * verify(mockedFunc)();
 * verify(mockedFunc)(anything());
 * </pre>
 *
 * <ul>
 * <li>If the argument provided during verification/stubbing is not a
 * JsHamcrest matcher, then 'equalTo(arg)' is used instead;</li>
 * <li>Where a function/method was invoked with an argument, but the stub or
 * verification does not provide a matcher, then anything() is assumed;</li>
 * <li>The reverse, however, is not true - the anything() matcher will
 * <em>not</em> match an argument that was never provided.</li>
 * </ul>
 *
 * <h2><a name="4">4. Verifying exact number of invocations / at least once /
 * never</a></h2>
 *
 * <pre>
 * var mockedArray = mock(Array);
 * var mockedFunc = mockFunction();
 *
 * mockedArray.slice(5);
 * mockedArray.slice(6);
 * mockedFunc('a');
 * mockedFunc('b');
 *
 * //verification of multiple matching invocations
 * verify(mockedArray, times(2)).slice(anything());
 * verify(mockedFunc, times(2))(anything());
 *
 * //the default is times(1), making these are equivalent
 * verify(mockedArray, times(1)).slice(5);
 * verify(mockedArray).slice(5);
 * </pre>
 *
 * <h2><a name="5">5. Matching the context ('this')</a></h2>
 *
 * Functions can be invoked with a specific context, using the 'call' or
 * 'apply' methods. JsMockito mock functions (and mock object methods)
 * will remember this context and verification/stubbing can match on it.
 *
 * <p>For a function:</p>
 * <pre>
 * var mockedFunc = mockFunction();
 * var context1 = {};
 * var context2 = {};
 *
 * when(mockedFunc).call(equalTo(context2), anything()).thenReturn('hello');
 *
 * mockedFunc.call(context1, 'foo');
 * //the following returns 'hello'
 * mockedFunc.apply(context2, [ 'bar' ]);
 *
 * verify(mockedFunc).apply(context1, [ 'foo' ]);
 * verify(mockedFunc).call(context2, 'bar');
 * </pre>
 *
 * <p>For object method invocations, the context is usually the object itself.
 * But sometimes people do strange things, and you need to test it - so
 * the same approach can be used for an object:</p>
 * <pre>
 * var mockedArray = mock(Array);
 * var otherContext = {};
 *
 * when(mockedArray).slice.call(otherContext, 5).thenReturn('h');
 *
 * //the following returns 'h'
 * mockedArray.slice.apply(otherContext, [ 5 ]);
 *
 * verify(mockedArray).slice.call(equalTo(otherContext), 5);
 * </pre>
 *
 * <ul>
 * <li>For mock functions, the default context matcher is anything();</li>
 * <li>For mock object methods, the default context matcher is
 * sameAs(mockObj).</li>
 * </ul>
 *
 * <h2><a name="6">6. Making sure interactions never happened on a mock</a></h2>
 *
 * <pre>
 * var mockOne = mock(Array);
 * var mockTwo = mock(Array);
 * var mockThree = mockFunction();
 *
 * //only mockOne is interacted with
 * mockOne.push(5);
 *
 * //verify a method was never called
 * verify(mockOne, never()).unshift('a');
 *
 * //verify that other mocks were not interacted with
 * verifyZeroInteractions(mockTwo, mockThree);
 * </pre>
 *
 * <h2><a name="7">7. Finding redundant invocations</a></h2>
 *
 * <pre>
 * var mockArray = mock(Array);
 *
 * mockArray.push(5);
 * mockArray.push(8);
 *
 * verify(mockArray).push(5);
 *
 * // following verification will fail
 * verifyNoMoreInteractions(mockArray);
 * </pre>
 */
JsMockito = {
  /**
   * Library version,
   */
  version: '1.0.4',

  _export: ['isMock', 'when', 'verify', 'verifyZeroInteractions',
            'verifyNoMoreInteractions', 'spy'],

  /**
   * Test if a given variable is a mock
   *
   * @param maybeMock An object
   * @return {boolean} true if the variable is a mock
   */
  isMock: function(maybeMock) {
    return typeof maybeMock._jsMockitoVerifier != 'undefined';
  },

  /**
   * Add a stub for a mock object method or mock function
   *
   * @param mock A mock object or mock anonymous function
   * @return {object or function} A stub builder on which the method or
   * function to be stubbed can be invoked
   */
  when: function(mock) {
    return mock._jsMockitoStubBuilder();
  },

  /**
   * Verify that a mock object method or mock function was invoked
   *
   * @param mock A mock object or mock anonymous function
   * @param verifier Optional JsMockito.Verifier instance (default: JsMockito.Verifiers.once())
   * @return {object or function} A verifier on which the method or function to
   * be verified can be invoked
   */
  verify: function(mock, verifier) {
    return (verifier || JsMockito.Verifiers.once()).verify(mock);
  },

  /**
   * Verify that no mock object methods or the mock function were ever invoked
   *
   * @param mock A mock object or mock anonymous function (multiple accepted)
   */
  verifyZeroInteractions: function() {
    JsMockito.each(arguments, function(mock) {
      JsMockito.Verifiers.zeroInteractions().verify(mock);
    });
  },

  /**
   * Verify that no mock object method or mock function invocations remain
   * unverified
   *
   * @param mock A mock object or mock anonymous function (multiple accepted)
   */
  verifyNoMoreInteractions: function() {
    JsMockito.each(arguments, function(mock) {
      JsMockito.Verifiers.noMoreInteractions().verify(mock);
    });
  },

  /**
   * Create a mock that proxies a real function or object.  All un-stubbed
   * invocations will be passed through to the real implementation, but can
   * still be verified.
   *
   * @param {object or function} delegate A 'real' (concrete) object or
   * function that the mock will delegate unstubbed invocations to
   * @return {object or function} A mock object (as per mock) or mock function
   * (as per mockFunction)
   */
  spy: function(delegate) {
    return (typeof delegate == 'function')?
      JsMockito.mockFunction(delegate) : JsMockito.mock(delegate);
  },

  contextCaptureFunction: function(defaultContext, handler) {
    // generate a function with overridden 'call' and 'apply' methods
    // and apply a default context when these are not used to supply
    // one explictly.
    var captureFunction = function() {
      return captureFunction.apply(defaultContext,
        Array.prototype.slice.call(arguments, 0));
    };
    captureFunction.call = function(context) {
      return captureFunction.apply(context,
        Array.prototype.slice.call(arguments, 1));
    };
    captureFunction.apply = function(context, args) {
      return handler.apply(this, [ context, args||[] ]);
    };
    return captureFunction;
  },

  matchArray: function(matchers, array) {
    if (matchers.length > array.length)
      return false;
    return !JsMockito.any(matchers, function(matcher, i) {
      return !matcher.matches(array[i]);
    });
  },

  toMatcher: function(obj) {
    return JsHamcrest.isMatcher(obj)? obj :
      JsHamcrest.Matchers.equalTo(obj);
  },

  mapToMatchers: function(srcArray) {
    return JsMockito.map(srcArray, function(obj) {
      return JsMockito.toMatcher(obj);
    });
  },

  verifier: function(name, proto) {
    JsMockito.Verifiers[name] = function() { JsMockito.Verifier.apply(this, arguments) };
    JsMockito.Verifiers[name].prototype = new JsMockito.Verifier;
    JsMockito.Verifiers[name].prototype.constructor = JsMockito.Verifiers[name];
    JsMockito.extend(JsMockito.Verifiers[name].prototype, proto);
  },

  each: function(srcArray, callback) {
    for (var i = 0; i < srcArray.length; i++)
      callback(srcArray[i], i);
  },

  eachObject: function(srcObject, callback) {
      for (var key in srcObject)
        callback(srcObject[key], key);
  },

  extend: function(dstObject, srcObject) {
    for (var prop in srcObject) {
      dstObject[prop] = srcObject[prop];
    }
    return dstObject;
  },

  objectKeys: function(srcObject) {
    var result = [];
    JsMockito.eachObject(srcObject, function(elem, key) {
      result.push(key);
    });
    return result;
  },

  objectValues: function(srcObject) {
    var result = [];
    JsMockito.eachObject(srcObject, function(elem, key) {
      result.push(elem);
    });
    return result;
  },

  map: function(srcArray, callback) {
    var result = [];
    JsMockito.each(srcArray, function(elem, key) {
      var val = callback(elem, key);
      if (val != null)
        result.push(val);
    });
    return result;
  },

  mapObject: function(srcObject, callback) {
    var result = {};
    JsMockito.eachObject(srcObject, function(elem, key) {
      var val = callback(elem, key);
      if (val != null)
        result[key] = val;
    });
    return result;
  },

  mapInto: function(dstObject, srcObject, callback) {
    return JsMockito.extend(dstObject,
      JsMockito.mapObject(srcObject, function(elem, key) {
        return callback(elem, key);
      })
    );
  },

  grep: function(srcArray, callback) {
    var result = [];
    JsMockito.each(srcArray, function(elem, key) {
      if (callback(elem, key))
        result.push(elem);
    });
    return result;
  },

  find: function(array, callback) {
    for (var i = 0; i < array.length; i++)
      if (callback(array[i], i))
        return array[i];
    return undefined;
  },

  any: function(array, callback) {
    return (this.find(array, callback) != undefined);
  }
};


/**
 * Create a mockable and stubbable anonymous function.
 *
 * <p>Once created, the function can be invoked and will return undefined for
 * any interactions that do not match stub declarations.</p>
 *
 * <pre>
 * var mockFunc = JsMockito.mockFunction();
 * JsMockito.when(mockFunc).call(anything(), 1, 5).thenReturn(6);
 * mockFunc(1, 5); // result is 6
 * JsMockito.verify(mockFunc)(1, greaterThan(2));
 * </pre>
 *
 * @param funcName {string} The name of the mock function to use in messages
 *   (defaults to 'func')
 * @param delegate {function} The function to delegate unstubbed calls to
 *   (optional)
 * @return {function} an anonymous function
 */
JsMockito.mockFunction = function(funcName, delegate) {
  if (typeof funcName == 'function') {
    delegate = funcName;
    funcName = undefined;
  }
  funcName = funcName || 'func';
  delegate = delegate || function() { };

  var stubMatchers = []
  var interactions = [];

  var mockFunc = function() {
    var args = [this];
    args.push.apply(args, arguments);
    interactions.push({args: args});

    var stubMatcher = JsMockito.find(stubMatchers, function(stubMatcher) {
      return JsMockito.matchArray(stubMatcher[0], args);
    });
    if (stubMatcher == undefined)
      return delegate.apply(this, arguments);
    var stubs = stubMatcher[1];
    if (stubs.length == 0)
      return undefined;
    var stub = stubs[0];
    if (stubs.length > 1)
      stubs.shift();
    return stub.apply(this, arguments);
  };

  mockFunc.prototype = delegate.prototype;

  mockFunc._jsMockitoStubBuilder = function(contextMatcher) {
    var contextMatcher = contextMatcher || JsHamcrest.Matchers.anything();
    return matcherCaptureFunction(contextMatcher, function(matchers) {
      var stubMatch = [matchers, []];
      stubMatchers.unshift(stubMatch);
      return {
        then: function() {
          stubMatch[1].push.apply(stubMatch[1], arguments);
          return this;
        },
        thenReturn: function() {
          return this.then.apply(this,JsMockito.map(arguments, function(value) {
            return function() { return value };
          }));
        },
        thenThrow: function(exception) {
          return this.then.apply(this,JsMockito.map(arguments, function(value) {
            return function() { throw value };
          }));
        }
      };
    });
  };

  mockFunc._jsMockitoVerifier = function(verifier, contextMatcher) {
    var contextMatcher = contextMatcher || JsHamcrest.Matchers.anything();
    return matcherCaptureFunction(contextMatcher, function(matchers) {
      return verifier(funcName, interactions, matchers, matchers[0] != contextMatcher);
    });
  };

  mockFunc._jsMockitoMockFunctions = function() {
    return [ mockFunc ];
  };

  return mockFunc;

  function matcherCaptureFunction(contextMatcher, handler) {
    return JsMockito.contextCaptureFunction(contextMatcher,
      function(context, args) {
        var matchers = JsMockito.mapToMatchers([context].concat(args || []));
        return handler(matchers);
      }
    );
  };
};
JsMockito._export.push('mockFunction');


/**
 * Create a mockable and stubbable objects.
 *
 * <p>A mock is created with the constructor for an object as an argument.
 * Once created, the mock object will have all the same methods as the source
 * object which, when invoked, will return undefined by default.</p>
 *
 * <p>Stub declarations may then be made for these methods to have them return
 * useful values or perform actions when invoked.</p>
 *
 * <pre>
 * MyObject = function() {
 *   this.add = function(a, b) { return a + b }
 * };
 *
 * var mockObj = JsMockito.mock(MyObject);
 * mockObj.add(5, 4); // result is undefined
 *
 * JsMockito.when(mockFunc).add(1, 2).thenReturn(6);
 * mockObj.add(1, 2); // result is 6
 *
 * JsMockito.verify(mockObj).add(1, greaterThan(2)); // ok
 * JsMockito.verify(mockObj).add(1, equalTo(2)); // ok
 * JsMockito.verify(mockObj).add(1, 4); // will throw an exception
 * </pre>
 *
 * @param Obj {function} the constructor for the object to be mocked
 * @return {object} a mock object
 */
JsMockito.mock = function(Obj) {
  var delegate = {};
  if (typeof Obj != "function") {
    delegate = Obj;
    Obj = function() { };
    Obj.prototype = delegate;
    Obj.prototype.constructor = Obj;
  }
  var MockObject = function() { };
  MockObject.prototype = new Obj;
  MockObject.prototype.constructor = MockObject;

  var mockObject = new MockObject();
  var stubBuilders = {};
  var verifiers = {};

  var contextMatcher = JsHamcrest.Matchers.sameAs(mockObject);

  var addMockMethod = function(name) {
    var delegateMethod;
    if (delegate[name] != undefined) {
      delegateMethod = function() {
        var context = (this == mockObject)? delegate : this;
        return delegate[name].apply(context, arguments);
      };
    }
    mockObject[name] = JsMockito.mockFunction('obj.' + name, delegateMethod);
    stubBuilders[name] = mockObject[name]._jsMockitoStubBuilder;
    verifiers[name] = mockObject[name]._jsMockitoVerifier;
  };

  for (var methodName in mockObject) {
    if (methodName != 'constructor')
      addMockMethod(methodName);
  }

  for (var typeName in JsMockito.nativeTypes) {
    if (mockObject instanceof JsMockito.nativeTypes[typeName].type) {
      JsMockito.each(JsMockito.nativeTypes[typeName].methods, function(method) {
        addMockMethod(method);
      });
    }
  }

  mockObject._jsMockitoStubBuilder = function() {
    return JsMockito.mapInto(new MockObject(), stubBuilders, function(method) {
      return method.call(this, contextMatcher);
    });
  };

  mockObject._jsMockitoVerifier = function(verifier) {
    return JsMockito.mapInto(new MockObject(), verifiers, function(method) {
      return method.call(this, verifier, contextMatcher);
    });
  };

  mockObject._jsMockitoMockFunctions = function() {
    return JsMockito.objectValues(
      JsMockito.mapObject(mockObject, function(func) {
        return JsMockito.isMock(func)? func : null;
      })
    );
  };

  return mockObject;
};
JsMockito._export.push('mock');

JsMockito.nativeTypes = {
  'Array': {
    type: Array,
    methods: [
      'concat', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'sort',
      'splice', 'toString', 'unshift', 'valueOf'
    ]
  },
  'Boolean': {
    type: Boolean,
    methods: [
      'toString', 'valueOf'
    ]
  },
  'Date': {
    type: Date,
    methods: [
      'getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds',
      'getMinutes', 'getMonth', 'getSeconds', 'getTime', 'getTimezoneOffset',
      'getUTCDate', 'getUTCDay', 'getUTCMonth', 'getUTCFullYear',
      'getUTCHours', 'getUTCMinutes', 'getUTCSeconds', 'getUTCMilliseconds',
      'getYear', 'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
      'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate',
      'setUTCMonth', 'setUTCFullYear', 'setUTCHours', 'setUTCMinutes',
      'setUTCSeconds', 'setUTCMilliseconds', 'setYear', 'toDateString',
      'toGMTString', 'toLocaleDateString', 'toLocaleTimeString',
      'toLocaleString', 'toString', 'toTimeString', 'toUTCString',
      'valueOf'
    ]
  },
  'Number': {
    type: Number,
    methods: [
      'toExponential', 'toFixed', 'toLocaleString', 'toPrecision', 'toString',
      'valueOf'
    ]
  },
  'String': {
    type: String,
    methods: [
      'anchor', 'big', 'blink', 'bold', 'charAt', 'charCodeAt', 'concat',
      'fixed', 'fontcolor', 'fontsize', 'indexOf', 'italics',
      'lastIndexOf', 'link', 'match', 'replace', 'search', 'slice', 'small',
      'split', 'strike', 'sub', 'substr', 'substring', 'sup', 'toLowerCase',
      'toUpperCase', 'valueOf'
    ]
  },
  'RegExp': {
    type: RegExp,
    methods: [
      'compile', 'exec', 'test'
    ]
  }
};


/**
 * Verifiers
 * @namespace
 */
JsMockito.Verifiers = {
  _export: ['never', 'zeroInteractions', 'noMoreInteractions', 'times', 'once'],

  /**
   * Test that a invocation never occurred. For example:
   * <pre>
   * verify(mock, never()).method();
   * </pre>
   * @see JsMockito.Verifiers.times(0)
   */
  never: function() {
    return new JsMockito.Verifiers.Times(0);
  },

  /** Test that no interaction were made on the mock.  For example:
   * <pre>
   * verify(mock, zeroInteractions());
   * </pre>
   * @see JsMockito.verifyZeroInteractions()
   */
  zeroInteractions: function() {
    return new JsMockito.Verifiers.ZeroInteractions();
  },

  /** Test that no further interactions remain unverified on the mock.  For
   * example:
   * <pre>
   * verify(mock, noMoreInteractions());
   * </pre>
   * @see JsMockito.verifyNoMoreInteractions()
   */
  noMoreInteractions: function() {
    return new JsMockito.Verifiers.NoMoreInteractions();
  },

  /**
   * Test that an invocation occurred a specific number of times. For example:
   * <pre>
   * verify(mock, times(2)).method();
   * </pre>
   *
   * @param wanted The number of desired invocations
   */
  times: function(wanted) {
    return new JsMockito.Verifiers.Times(wanted);
  },

  /**
   * Test that an invocation occurred exactly once. For example:
   * <pre>
   * verify(mock, once()).method();
   * </pre>
   * This is the default verifier.
   * @see JsMockito.Verifiers.times(1)
   */
  once: function() {
    return new JsMockito.Verifiers.Times(1);
  }
};

JsMockito.Verifier = function() { this.init.apply(this, arguments) };
JsMockito.Verifier.prototype = {
  init: function() { },

  verify: function(mock) {
    var self = this;
    return mock._jsMockitoVerifier(function() {
      self.verifyInteractions.apply(self, arguments);
    });
  },

  verifyInteractions: function(funcName, interactions, matchers, describeContext) {
  },

  updateVerifiedInteractions: function(interactions) {
    JsMockito.each(interactions, function(interaction) {
      interaction.verified = true;
    });
  },

  buildDescription: function(message, funcName, matchers, describeContext) {
    var description = new JsHamcrest.Description();
    description.append(message + ': ' + funcName + '(');
    JsMockito.each(matchers.slice(1), function(matcher, i) {
      if (i > 0)
        description.append(', ');
      description.append('<');
      matcher.describeTo(description);
      description.append('>');
    });
    description.append(")");
    if (describeContext) {
      description.append(", 'this' being ");
      matchers[0].describeTo(description);
    }
    return description;
  }
};

JsMockito.verifier('Times', {
  init: function(wanted) {
    this.wanted = wanted;
  },

  verifyInteractions: function(funcName, allInteractions, matchers, describeContext) {
    var interactions = JsMockito.grep(allInteractions, function(interaction) {
      return JsMockito.matchArray(matchers, interaction.args);
    });
    if (interactions.length == this.wanted) {
      this.updateVerifiedInteractions(interactions);
      return;
    }

    var message;
    if (interactions.length == 0) {
      message = 'Wanted but not invoked';
    } else if (this.wanted == 0) {
      message = 'Never wanted but invoked';
    } else if (this.wanted == 1) {
      message = 'Wanted 1 invocation but got ' + interactions.length;
    } else {
      message = 'Wanted ' + this.wanted + ' invocations but got ' + interactions.length;
    }

    var description = this.buildDescription(message, funcName, matchers, describeContext);
    throw description.get();
  }
});

JsMockito.verifier('ZeroInteractions', {
  verify: function(mock) {
    var neverVerifier = JsMockito.Verifiers.never();
    JsMockito.each(mock._jsMockitoMockFunctions(), function(mockFunc) {
      neverVerifier.verify(mockFunc)();
    });
  }
});

JsMockito.verifier('NoMoreInteractions', {
  verify: function(mock) {
    var self = this;
    JsMockito.each(mock._jsMockitoMockFunctions(), function(mockFunc) {
      JsMockito.Verifier.prototype.verify.call(self, mockFunc)();
    });
  },

  verifyInteractions: function(funcName, allInteractions, matchers, describeContext) {
    var interactions = JsMockito.grep(allInteractions, function(interaction) {
      return interaction.verified != true;
    });
    if (interactions.length == 0)
      return;

    var description = this.buildDescription(
      "No interactions wanted, but " + interactions.length + " remains",
      funcName, matchers, describeContext);
    throw description.get();
  }
});


/**
 * Modified on 6/25/2013 to always assign JsMockito methods to the global scope.
 *
 * Import the public JsMockito API into the specified object (namespace)
 *
 * @param {object} target An object (namespace) that will be populated with
 * the functions from the public JsMockito API
 */
(function(target) {
  JsMockito.each(JsMockito._export, function(exported) {
    target[exported] = JsMockito[exported];
  });

  JsMockito.each(JsMockito.Verifiers._export, function(exported) {
    target[exported] = JsMockito.Verifiers[exported];
  });
})(this);

assert=require('assert');