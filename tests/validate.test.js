const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { validatePayload, csvCell, stripCtrl } = require("../netlify/functions/validate");

function validPayload() {
  return {
    rater: { name: "Dr. Smith", email: "smith@example.com", role: "Faculty" },
    cases: [{ caseNumber: 1, scores: { 1: 3, 2: null }, wmsi: 1.5, comments: "ok" }],
  };
}

describe("validatePayload", () => {
  test("valid minimal payload returns empty array", () => {
    const errors = validatePayload(validPayload());
    assert.deepEqual(errors, []);
  });

  test("missing rater object produces error containing 'rater'", () => {
    const p = validPayload();
    delete p.rater;
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("rater")));
  });

  test("missing rater name produces 'Rater name is required'", () => {
    const p = validPayload();
    p.rater.name = "";
    const errors = validatePayload(p);
    assert.ok(errors.includes("Rater name is required"));
  });

  test("rater name that is only whitespace produces 'Rater name is required'", () => {
    const p = validPayload();
    p.rater.name = "   ";
    const errors = validatePayload(p);
    assert.ok(errors.includes("Rater name is required"));
  });

  test("rater name > 200 chars produces error containing 'too long'", () => {
    const p = validPayload();
    p.rater.name = "a".repeat(201);
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("too long")));
  });

  test("invalid email format produces 'Valid rater email is required'", () => {
    const p = validPayload();
    p.rater.email = "not-an-email";
    const errors = validatePayload(p);
    assert.ok(errors.includes("Valid rater email is required"));
  });

  test("email > 254 chars produces error containing 'too long'", () => {
    const p = validPayload();
    const local = "a".repeat(249);
    p.rater.email = `${local}@b.com`;
    assert.ok(p.rater.email.length > 254);
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("too long")));
  });

  test("invalid role produces error", () => {
    const p = validPayload();
    p.rater.role = "Attending";
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("role")));
  });

  test("role = 'Faculty' is valid", () => {
    const p = validPayload();
    p.rater.role = "Faculty";
    assert.deepEqual(validatePayload(p), []);
  });

  test("role = 'Fellow' is valid", () => {
    const p = validPayload();
    p.rater.role = "Fellow";
    assert.deepEqual(validatePayload(p), []);
  });

  test("empty cases array produces error", () => {
    const p = validPayload();
    p.cases = [];
    const errors = validatePayload(p);
    assert.ok(errors.length > 0);
  });

  test("cases array > 10 produces error", () => {
    const p = validPayload();
    p.cases = Array.from({ length: 11 }, (_, i) => ({
      caseNumber: i + 1,
      scores: { 1: 3 },
    }));
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("too many")));
  });

  test("case missing scores object produces error", () => {
    const p = validPayload();
    p.cases[0].scores = null;
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("scores")));
  });

  test("score of 6 produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: 6 };
    const errors = validatePayload(p);
    assert.ok(errors.length > 0);
  });

  test("score of -1 produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: -1 };
    const errors = validatePayload(p);
    assert.ok(errors.length > 0);
  });

  test("score of 1.5 (non-integer) produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: 1.5 };
    const errors = validatePayload(p);
    assert.ok(errors.length > 0);
  });

  test("score of 'foo' (string) produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: "foo" };
    const errors = validatePayload(p);
    assert.ok(errors.length > 0);
  });

  test("score = null is OK", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: null };
    assert.deepEqual(validatePayload(p), []);
  });

  test("score = 0 (boundary) is OK", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: 0 };
    assert.deepEqual(validatePayload(p), []);
  });

  test("score = 5 (boundary) is OK", () => {
    const p = validPayload();
    p.cases[0].scores = { 1: 5 };
    assert.deepEqual(validatePayload(p), []);
  });

  test("segment number 0 (out of range) produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { 0: 3 };
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("segment")));
  });

  test("segment number 18 (out of range) produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { 18: 3 };
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("segment")));
  });

  test("segment key 'abc' (non-numeric) produces error", () => {
    const p = validPayload();
    p.cases[0].scores = { abc: 3 };
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("segment")));
  });

  test("WMSI as string produces error", () => {
    const p = validPayload();
    p.cases[0].wmsi = "1.5";
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toUpperCase().includes("WMSI")));
  });

  test("WMSI as null is OK", () => {
    const p = validPayload();
    p.cases[0].wmsi = null;
    assert.deepEqual(validatePayload(p), []);
  });

  test("WMSI as number is OK", () => {
    const p = validPayload();
    p.cases[0].wmsi = 2.3;
    assert.deepEqual(validatePayload(p), []);
  });

  test("comments > 2000 chars produces error", () => {
    const p = validPayload();
    p.cases[0].comments = "x".repeat(2001);
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("comments")));
  });

  test("comments not a string produces error", () => {
    const p = validPayload();
    p.cases[0].comments = 42;
    const errors = validatePayload(p);
    assert.ok(errors.some((e) => e.toLowerCase().includes("comments")));
  });
});

describe("csvCell", () => {
  test("plain string is wrapped in double quotes", () => {
    assert.equal(csvCell("hello"), '"hello"');
  });

  test("string with embedded double-quote escapes it as double double-quote", () => {
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  });

  test("string starting with = is prefixed with single-quote", () => {
    assert.equal(csvCell("=SUM(A1)"), '"\'=SUM(A1)"');
  });

  test("string starting with + is prefixed with single-quote", () => {
    assert.equal(csvCell("+foo"), '"\'+foo"');
  });

  test("string starting with - is prefixed with single-quote", () => {
    assert.equal(csvCell("-foo"), '"\'-foo"');
  });

  test("string starting with @ is prefixed with single-quote", () => {
    assert.equal(csvCell("@foo"), '"\'@foo"');
  });

  test("string starting with tab is prefixed with single-quote", () => {
    assert.equal(csvCell("\tfoo"), '"\'\tfoo"');
  });

  test("string starting with carriage-return is prefixed with single-quote", () => {
    assert.equal(csvCell("\rfoo"), '"\'\rfoo"');
  });

  test("null returns empty quoted string", () => {
    assert.equal(csvCell(null), '""');
  });

  test("undefined returns empty quoted string", () => {
    assert.equal(csvCell(undefined), '""');
  });

  test("number is stringified and quoted", () => {
    assert.equal(csvCell(42), '"42"');
  });
});

describe("stripCtrl", () => {
  test("plain string is returned unchanged", () => {
    assert.equal(stripCtrl("hello world"), "hello world");
  });

  test("newline \\n is removed", () => {
    assert.equal(stripCtrl("foo\nbar"), "foobar");
  });

  test("carriage-return \\r is removed", () => {
    assert.equal(stripCtrl("foo\rbar"), "foobar");
  });

  test("tab \\t is removed", () => {
    assert.equal(stripCtrl("foo\tbar"), "foobar");
  });

  test("null byte \\x00 is removed", () => {
    assert.equal(stripCtrl("foo\x00bar"), "foobar");
  });

  test("DEL character \\x7F is removed", () => {
    assert.equal(stripCtrl("foo\x7Fbar"), "foobar");
  });

  test("number input is returned as-is", () => {
    assert.equal(stripCtrl(42), 42);
  });

  test("null input is returned as-is", () => {
    assert.equal(stripCtrl(null), null);
  });

  test("undefined input is returned as-is", () => {
    assert.equal(stripCtrl(undefined), undefined);
  });
});
