/**
 * Test Suite Generator
 * Generates comprehensive error and success test cases
 */

import fs from "fs";
import path from "path";

const baseDir = "./test-suite";

// Helper: Write JSON file
function writeTestCase(category, filename, data, description) {
  const dir = path.join(baseDir, category);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  const content = {
    _test_info: {
      description,
      expected: category === "error-cases" ? "SHOULD_FAIL" : "SHOULD_PASS",
      category: category.replace("-cases", ""),
    },
    ...data,
  };

  fs.writeFileSync(filepath, JSON.stringify(content, null, 2));
  console.log(`✅ Created: ${filepath}`);
}

console.log("🔧 Generating Test Suite...\n");

// ============================================================================
// ERROR CASES
// ============================================================================

console.log("📛 GENERATING ERROR CASES\n");

// 01: Rule 1 Violation - Missing system_model
writeTestCase(
  "error-cases",
  "01-rule1-violation.json",
  { invalid: "No system_model" },
  "Rule 1: Must have system_model root object"
);

// 02: Rule 2 Violation - Duplicate class names
writeTestCase(
  "error-cases",
  "02-rule2-violation.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
            },
            {
              name: "Student",
              key_letter: "STU",
              class_number: 2,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
            },
          ],
        },
      ],
    },
  },
  "Rule 2: Duplicate class name 'Student'"
);

// 03: Rule 9 Violation - No identifier
writeTestCase(
  "error-cases",
  "03-rule9-violation.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Person",
              key_letter: "PRS",
              class_number: 1,
              attributes: [
                { name: "Name", type: "string" },
                { name: "Age", type: "integer" },
              ],
            },
          ],
        },
      ],
    },
  },
  "Rule 9: Class has no identifier attribute"
);

// 04: Rule 13 Violation - Invalid relationship
writeTestCase(
  "error-cases",
  "04-rule13-violation.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
            },
          ],
          relationships: [
            {
              label: "R1",
              type: "Simple",
              one_side: { key_letter: "STD" },
              other_side: { key_letter: "NONEXISTENT" },
            },
          ],
        },
      ],
    },
  },
  "Rule 13: Relationship references non-existent class"
);

// 05: OAL Create Invalid
writeTestCase(
  "error-cases",
  "05-oal-create-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "create object instance; // Missing variable name",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid create syntax - missing variable name"
);

// 06: OAL Select Invalid
writeTestCase(
  "error-cases",
  "06-oal-select-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "select students; // Missing cardinality (any/many/one)",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid select syntax - missing cardinality"
);

// 07: OAL Delete Invalid
writeTestCase(
  "error-cases",
  "07-oal-delete-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "delete instance student; // Missing 'object' keyword",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid delete syntax - missing 'object' keyword"
);

// 08: OAL Relate Invalid
writeTestCase(
  "error-cases",
  "08-oal-relate-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "relate student course across R1; // Missing 'to' keyword",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid relate syntax - missing 'to' keyword"
);

// 09: OAL If Invalid
writeTestCase(
  "error-cases",
  "09-oal-if-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal: "if (x == 1)\n  y = 2;\n// Missing 'end if;'",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid if syntax - missing 'end if;'"
);

// 10: OAL Loop Invalid
writeTestCase(
  "error-cases",
  "10-oal-loop-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "for each item list\n  count = count + 1;\n// Missing 'in' keyword",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid loop syntax - missing 'in' keyword"
);

// 11: OAL Self Invalid
writeTestCase(
  "error-cases",
  "11-oal-self-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          external_entities: [
            {
              name: "Logging",
              key_letter: "LOG",
              bridges: [
                {
                  name: "LogInfo",
                  parameters: [{ name: "message", type: "string" }],
                  return_type: "void",
                },
              ],
            },
          ],
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "LOG::LogInfo(message: self); // self without . or ->",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid self usage - must be followed by . or ->"
);

// 12: OAL Bridge Invalid
writeTestCase(
  "error-cases",
  "12-oal-bridge-invalid.json",
  {
    system_model: {
      system_name: "Test",
      subsystems: [
        {
          name: "Sub1",
          external_entities: [
            {
              name: "Logging",
              key_letter: "LOG",
              bridges: [
                { name: "LogInfo", parameters: [], return_type: "void" },
              ],
            },
          ],
          classes: [
            {
              name: "Student",
              key_letter: "STD",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
              ],
              state_model: {
                lifecycle_type: "Instance",
                initial_state: "Active",
                states: [
                  {
                    name: "Active",
                    state_number: 1,
                    action_oal:
                      "NONEXISTENT::Method(); // Invalid external entity",
                  },
                ],
                events: [],
                transitions: [],
              },
            },
          ],
        },
      ],
    },
  },
  "OAL: Invalid bridge call - non-existent external entity"
);

// ============================================================================
// SUCCESS CASES
// ============================================================================

console.log("\n✅ GENERATING SUCCESS CASES\n");

// 01: Minimal Valid Model
writeTestCase(
  "success-cases",
  "01-minimal-valid.json",
  {
    system_model: {
      system_name: "Minimal System",
      version: "1.0.0",
      subsystems: [
        {
          name: "Core",
          prefix: "CORE",
          classes: [
            {
              name: "Entity",
              key_letter: "ENT",
              class_number: 1,
              attributes: [
                { name: "ID", type: "unique_ID", is_identifier: true },
                { name: "Name", type: "string" },
              ],
            },
          ],
          relationships: [],
        },
      ],
    },
  },
  "Minimal valid model - single class with identifier"
);

// 02: All Relationship Types
writeTestCase(
  "success-cases",
  "02-relationships-valid.json",
  {
    system_model: {
      system_name: "Relationship Demo",
      version: "1.0.0",
      subsystems: [
        {
          name: "Demo",
          prefix: "DEMO",
          classes: [
            {
              name: "Person",
              key_letter: "PRS",
              class_number: 1,
              attributes: [
                { name: "Person_ID", type: "unique_ID", is_identifier: true },
              ],
            },
            {
              name: "Student",
              key_letter: "STD",
              class_number: 2,
              attributes: [
                { name: "Student_ID", type: "unique_ID", is_identifier: true },
                { name: "Person_ID", type: "unique_ID", referential: "R1" },
              ],
            },
            {
              name: "Course",
              key_letter: "CRS",
              class_number: 3,
              attributes: [
                { name: "Course_ID", type: "unique_ID", is_identifier: true },
              ],
            },
            {
              name: "Enrollment",
              key_letter: "ENR",
              class_number: 4,
              type: "Association",
              attributes: [
                {
                  name: "Enrollment_ID",
                  type: "unique_ID",
                  is_identifier: true,
                },
                { name: "Student_ID", type: "unique_ID", referential: "R2" },
                { name: "Course_ID", type: "unique_ID", referential: "R2" },
                { name: "Grade", type: "string" },
              ],
            },
          ],
          relationships: [
            {
              label: "R1",
              type: "Subtype",
              description: "Person-Student subtype",
              superclass: { key_letter: "PRS" },
              subclasses: [{ key_letter: "STD" }],
            },
            {
              label: "R2",
              type: "Associative",
              description: "Student enrolls in Course",
              one_side: {
                key_letter: "STD",
                multiplicity: "*",
                phrase: "enrolls in",
              },
              other_side: {
                key_letter: "CRS",
                multiplicity: "*",
                phrase: "has",
              },
              association_class: { key_letter: "ENR" },
            },
          ],
        },
      ],
    },
  },
  "Valid model with Subtype and Associative relationships"
);

console.log("\n✨ Test Suite Generation Complete!");
console.log(`\nGenerated files in: ${baseDir}/`);
console.log("\nNext steps:");
console.log("1. Run: node test-runner.js");
console.log("2. Check results in test-results.json");
