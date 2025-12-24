# Test Case: Rule 8 - Duplicate Attribute Names

## Test Purpose

Verify that the parser correctly detects duplicate attribute names within a class (Rule 8).

## Test Model

```json
{
  "system_model": {
    "system_name": "Test Duplicate Attribute",
    "version": "1.0",
    "subsystems": [
      {
        "name": "Test Subsystem",
        "prefix": "TST",
        "classes": [
          {
            "name": "MataKuliah",
            "key_letter": "MK",
            "class_number": 4,
            "attributes": [
              { "name": "MK_ID", "type": "unique_ID", "is_identifier": true },
              { "name": "KodeMK", "type": "kode_mk", "is_identifier": false },
              { "name": "NamaMK", "type": "string", "is_identifier": false },
              { "name": "SKS", "type": "sks_type", "is_identifier": false },
              { "name": "SKS", "type": "sks_type", "is_identifier": false }
            ]
          }
        ]
      }
    ]
  }
}
```

## Expected Error

```
Severity: error
Message: Duplicate attribute name 'SKS' in class 'MataKuliah' (first defined at attributes[3])
Path: $.system_model.subsystems[0].classes[0].attributes[4]
Fix: Use unique attribute names within each class
Phase: 2
```

## Implementation

File: `consistency-validator.js`

```javascript
// Rule 8: Check attribute name uniqueness within class
const attributeNames = new Map();
cls.attributes.forEach((attr, attrIdx) => {
  if (attr.name) {
    if (attributeNames.has(attr.name)) {
      const firstIdx = attributeNames.get(attr.name);
      this.errorManager.addError(
        `Duplicate attribute name '${attr.name}' in class '${cls.name}' (first defined at attributes[${firstIdx}])`,
        `${clsPath}.attributes[${attrIdx}]`,
        "Use unique attribute names within each class",
        "error",
        2
      );
    } else {
      attributeNames.set(attr.name, attrIdx);
    }
  }
});
```

## How to Test

1. Save the test model to a JSON file
2. Import the parser
3. Run validation
4. Verify error is detected

```javascript
import { XtUMLParser } from "./src/features/parsers/utils/xtuml-validator.js";
import fs from "fs";

const model = JSON.parse(fs.readFileSync("./test-duplicate-attribute.json", "utf8"));
const parser = new XtUMLParser();
const errors = parser.parse(model);

// Should have at least 1 error for duplicate attribute
console.assert(errors.length > 0, "Rule 8 should detect duplicate attribute names");
console.assert(
  errors.some((e) => e.message.includes("Duplicate attribute name")),
  "Error message should mention duplicate attribute"
);
```

## Test Status

✅ **IMPLEMENTED** - Rule 8 now correctly detects duplicate attribute names

## Related Rules

- Rule 6: Unique class names
- Rule 7: Unique KeyLetters
- Rule 9: At least one identifier
