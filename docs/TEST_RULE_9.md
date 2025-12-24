# Test Case: Rule 9 (Note) - Empty & Duplicate Relationship Labels

## Test Purpose

Verify that the parser correctly detects:

1. Empty or missing relationship labels
2. Duplicate relationship labels

## Test Model 1: Empty Label

```json
{
  "system_model": {
    "system_name": "Test Empty Relationship Label",
    "version": "1.0",
    "subsystems": [
      {
        "name": "Test Subsystem",
        "prefix": "TST",
        "classes": [
          {
            "name": "Person",
            "key_letter": "PRS",
            "class_number": 1,
            "attributes": [{ "name": "Person_ID", "type": "unique_ID", "is_identifier": true }]
          },
          {
            "name": "Mahasiswa",
            "key_letter": "MHS",
            "class_number": 2,
            "attributes": [{ "name": "MHS_ID", "type": "unique_ID", "is_identifier": true }]
          }
        ],
        "relationships": [
          {
            "label": "",
            "type": "Subtype",
            "description": "Person adalah supertype dari Mahasiswa",
            "superclass": { "key_letter": "PRS" },
            "subclasses": [{ "key_letter": "MHS" }]
          }
        ]
      }
    ]
  }
}
```

## Expected Error (Empty Label)

```
Severity: error
Message: Relationship missing or has empty label
Path: $.system_model.subsystems[0].relationships[0].label
Fix: Provide a valid relationship label (e.g., 'R1', 'R2', 'R3')
Phase: 2
```

## Test Model 2: Duplicate Labels

```json
{
  "relationships": [
    {
      "label": "R1",
      "type": "Subtype",
      "superclass": { "key_letter": "PRS" },
      "subclasses": [{ "key_letter": "MHS" }]
    },
    {
      "label": "R1",
      "type": "Associative",
      "one_side": { "key_letter": "MHS" },
      "other_side": { "key_letter": "MK" }
    }
  ]
}
```

## Expected Error (Duplicate Label)

```
Severity: error
Message: Duplicate relationship label 'R1'
Path: $.system_model.subsystems[0].relationships[1]
Fix: Use unique labels (R1, R2, R3, etc.)
Phase: 2
```

## Implementation

File: `consistency-validator.js`

```javascript
validateRelationshipConsistency(rel, relIdx, subsysIdx, subsystem) {
  const path = `$.system_model.subsystems[${subsysIdx}].relationships[${relIdx}]`;

  // Rule 9 (Note): Check label existence and uniqueness
  if (!rel.label || (typeof rel.label === 'string' && !rel.label.trim())) {
    this.errorManager.addError(
      `Relationship missing or has empty label`,
      `${path}.label`,
      "Provide a valid relationship label (e.g., 'R1', 'R2', 'R3')",
      "error",
      2
    );
  } else {
    // Check label uniqueness
    if (this.relationshipLabels.has(rel.label)) {
      this.errorManager.addError(
        `Duplicate relationship label '${rel.label}'`,
        path,
        "Use unique labels (R1, R2, R3, etc.)",
        "error",
        2
      );
    } else {
      this.relationshipLabels.add(rel.label);
    }
  }
}
```

## Edge Cases Tested

### 1. Empty String

```json
{ "label": "" } // ❌ Error: empty label
```

### 2. Whitespace Only

```json
{ "label": "   " } // ❌ Error: empty label (trimmed)
```

### 3. Missing Label

```json
{
  "type": "Subtype"
  // label missing
} // ❌ Error: missing label
```

### 4. Valid Label

```json
{ "label": "R1" } // ✅ Valid
```

### 5. Duplicate Labels

```json
[
  { "label": "R1" },
  { "label": "R1" } // ❌ Error: duplicate
]
```

## How to Test

```javascript
import { XtUMLParser } from "./src/features/parsers/utils/xtuml-validator.js";
import fs from "fs";

// Test 1: Empty label
const model1 = JSON.parse(fs.readFileSync("./test-empty-relationship-label.json", "utf8"));
const parser1 = new XtUMLParser();
const errors1 = parser1.parse(model1);

console.assert(
  errors1.some((e) => e.message.includes("missing or has empty label")),
  "Should detect empty relationship label"
);

// Test 2: Duplicate labels
const model2 = {
  system_model: {
    subsystems: [
      {
        name: "Test",
        classes: [
          { name: "A", key_letter: "A", class_number: 1, attributes: [{ name: "id", type: "int", is_identifier: true }] },
          { name: "B", key_letter: "B", class_number: 2, attributes: [{ name: "id", type: "int", is_identifier: true }] },
        ],
        relationships: [
          { label: "R1", type: "Simple", one_side: { key_letter: "A" }, other_side: { key_letter: "B" } },
          { label: "R1", type: "Simple", one_side: { key_letter: "B" }, other_side: { key_letter: "A" } },
        ],
      },
    ],
  },
};

const parser2 = new XtUMLParser();
const errors2 = parser2.parse(model2);

console.assert(
  errors2.some((e) => e.message.includes("Duplicate relationship label")),
  "Should detect duplicate relationship labels"
);
```

## Test Status

✅ **FIXED** - Rule 9 now correctly detects:

- Empty relationship labels
- Whitespace-only labels
- Missing labels
- Duplicate labels

## Related Rules

- Rule 10: Referential attributes must reference relationship labels
- Rule 12: Composition must reference existing relationship labels
