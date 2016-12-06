"use strict"

const isStandardSyntaxDeclaration = require("../../utils/isStandardSyntaxDeclaration")
const isStandardSyntaxProperty = require("../../utils/isStandardSyntaxProperty")
const report = require("../../utils/report")
const ruleMessages = require("../../utils/ruleMessages")
const validateOptions = require("../../utils/validateOptions")
const shorthandData = require("../../reference/shorthandData")
const valueParser = require("postcss-value-parser")
const postcss = require("postcss")

const ruleName = "shorthand-property-no-redundant-values"

const messages = ruleMessages(ruleName, {
  rejected: (unexpected, expected) => `Unexpected longhand value '${unexpected}' instead of '${expected}'`,
})

const shorthandableProperties = new Set(Object.keys(shorthandData))

const ignoredCharacters = [
  "+",
  "-",
  "*",
  "/",
  "(",
  ")",
  "$",
  "@",
  "--",
  "var(",
]

const ignoredShorthandProperties = new Set([
  "background",
  "font",
  "border",
  "border-top",
  "border-bottom",
  "border-left",
  "border-right",
  "list-style",
  "transition",
])

function isIgnoredCharacters(value) {
  return ignoredCharacters.some(char => value.indexOf(char) !== -1)
}

function canCondense(top, right) {
  const bottom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null
  const left = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null

  const lowerTop = top.toLowerCase()
  const lowerRight = right.toLowerCase()
  const lowerBottom = bottom && bottom.toLowerCase()
  const lowerLeft = left && left.toLowerCase()

  if (canCondenseToOneValue(lowerTop, lowerRight, lowerBottom, lowerLeft)) {
    return [top]
  } else if (canCondenseToTwoValues(lowerTop, lowerRight, lowerBottom, lowerLeft)) {
    return [
      top,
      right,
    ]
  } else if (canCondenseToThreeValues(lowerTop, lowerRight, lowerBottom, lowerLeft)) {
    return [
      top,
      right,
      bottom,
    ]
  } else {
    return [
      top,
      right,
      bottom,
      left,
    ]
  }
}

function canCondenseToOneValue(top, right, bottom, left) {
  if (top !== right) {
    return false
  }

  return top === bottom && (bottom === left || !left) || !bottom && !left
}

function canCondenseToTwoValues(top, right, bottom, left) {
  return top === bottom && right === left || top === bottom && !left && top !== right
}

function canCondenseToThreeValues(top, right, bottom, left) {
  return right === left
}

const rule = function (actual) {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, { actual })
    if (!validOptions) {
      return
    }

    root.walkDecls(decl => {
      if (!isStandardSyntaxDeclaration(decl) || !isStandardSyntaxProperty(decl.prop)) {
        return
      }

      const prop = decl.prop,
        value = decl.value

      const normalizedProp = postcss.vendor.unprefixed(prop.toLowerCase())

      // Ignore not shorthandable properties, and math operations
      if (isIgnoredCharacters(value) || !shorthandableProperties.has(normalizedProp) || ignoredShorthandProperties.has(normalizedProp)) {
        return
      }

      const valuesToShorthand = []

      valueParser(value).walk(valueNode => {
        if (valueNode.type !== "word") {
          return
        }

        valuesToShorthand.push(valueParser.stringify(valueNode))
      })

      if (valuesToShorthand.length <= 1 || valuesToShorthand.length > 4) {
        return
      }

      const shortestForm = canCondense.apply(undefined, valuesToShorthand)
      const shortestFormString = shortestForm.filter(value => {
        return value
      }).join(" ")
      const valuesFormString = valuesToShorthand.join(" ")

      if (shortestFormString.toLowerCase() === valuesFormString.toLowerCase()) {
        return
      }

      report({
        message: messages.rejected(value, shortestFormString),
        node: decl,
        result,
        ruleName,
      })
    })
  }
}

rule.ruleName = ruleName
rule.messages = messages
module.exports = rule