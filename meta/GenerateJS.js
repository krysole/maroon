//
// A Meta Compiler Language
//
// Copyright 2018 Lorenz Pretterhofer <krysole@alexicalmistake.com>
//
// Permission to use, copy, modify, and distribute this work for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE WORK IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS WORK INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS WORK.
//
"use strict";

module.exports =
class GenerateJS {
  
  constructor(system) {
    if (system === "meta") {
      this.builtins = this.meta_builtins;
      this.memoFlag = true;
    }
    else if (system === "maroon") {
      this.builtins = this.maroon_builtins;
      this.memoFlag = false;
    }
    else {
      throw new Error();
    }
  }
  
  handle(ast, ...rest) {
    if (this["handle" + ast.tag] != null) {
      return this["handle" + ast.tag](ast, ...rest);
    }
    else {
      throw new Error(`Unhandled ast node type ${ast.tag}.`);
    }
  }
  
  get meta_builtins() {
    return [
      `match(rule, input, name) {`,
      `  this.$input    = input;`,
      `  this.$name     = (name != null ? name : "unnamed");`,
      `  this.$position = 0;`,
      `  this.$furthest = 0;`,
      `  this.$memotab  = [];`,
      `  `,
      `  for (let i = 0, c = this.$input.length + 1; i < c; i++) {`,
      `    this.$memotab[i] = { rule: null, result: null, position: -1 }`,
      `  }`,
      `  `,
      `  let result = this[rule]();`,
      `  if (result !== FAIL) {`,
      `    return result;`,
      `  }`,
      `  else {`,
      `    throw new Error(\`Failed to match, furthest position \${this.linecol(this.$furthest)}.\`);`,
      `  }`,
      `}`,
      ``,
      `log(message) {`,
      `  console.log(\`\${this.constructor.name}.prototype.log() \${this.linecol()} \${message}\`);`,
      `}`,
      ``,
      `linecol(position) {`,
      `  if (position == null) position = this.$position;`,
      `  `,
      `  let line   = 1;`,
      `  let column = 1;`,
      `  `,
      `  for (let i = 0; i < position; i++) {`,
      `    if (this.$input[i] === "\\r") {`,
      `      if (this.$input[i + 1] === "\\n") i++;`,
      `      line++;`,
      `      column = 1;`,
      `    }`,
      `    else if (this.$input[i] === "\\n") {`,
      `      if (this.$input[i + 1] === "\\r") i++;`,
      `      line++;`,
      `      column = 1;`,
      `    }`,
      `    else {`,
      `      column++;`,
      `    }`,
      `  }`,
      `  `,
      `  return {`,
      `    name: this.$name,`,
      `    line: line,`,
      `    column: column,`,
      `    toString() { return \`\${this.name}:\${this.line}:\${this.column}\`; },`,
      `  };`,
      `}`,
      ``,
      `char(charset) {`,
      `  if (this.$position >= this.$input.length) return FAIL;`,
      `  `,
      `  let c = this.$input[this.$position];`,
      `  if (charset != null && !charset.includes(c)) return FAIL;`,
      `  `,
      `  this.$position += 1;`,
      `  if (this.$position > this.$furthest) this.$furthest = this.$position;`,
      `  `,
      `  return c;`,
      `}`,
      ``,
      `range(start, end) {`,
      `  if (this.$position >= this.$input.length) return FAIL;`,
      `  `,
      `  let c = this.$input[this.$position];`,
      `  if (c < start || c > end) return FAIL;`,
      `  `,
      `  this.$position += 1;`,
      `  if (this.$position > this.$furthest) this.$furthest = this.$position;`,
      `  `,
      `  return c;`,
      `}`,
      ``,
      `string(string) {`,
      `  if (this.$input.slice(this.$position, this.$position + string.length) === string) {`,
      `    this.$position += string.length;`,
      `    if (this.$position > this.$furthest) this.$furthest = this.$position;`,
      `    `,
      `    return string;`,
      `  }`,
      `  else {`,
      `    return FAIL;`,
      `  }`,
      `}`,
      ``,
      `nothing() {`,
      `  return null;`,
      `}`,
      ``,
      ``,
      `pos() {`,
      `  return this.$position;`,
      `}`,
      ``,
      `slice(start, end) {`,
      `  return this.$input.slice(start, end);`,
      `}`
    ];
  }
  
  get maroon_builtins() {
    return [
      `match(rule, input) {`,
      `  this.$input    = input;`,
      `  this.$position = 0;`,
      `  this.$furthest = 0;`,
      `  `,
      `  let result = this[rule]();`,
      `  if (result !== FAIL) {`,
      `    return result;`,
      `  }`,
      `  else {`,
      `    throw new Error(\`Failed to match, furthest position \${this.loc(this.$furthest)}.\`);`,
      `  }`,
      `}`,
      ``,
      `log(message) {`,
      `  let t = this.$input.get(this.$position);`,
      ``,
      `  console.log(\`\${this.constructor.name}.prototype.log() \${this.loc(this.$position)} \${message}\`);`,
      `}`,
      ``,
      `loc(pos) {`,
      `  return this.$input.get(pos != null ? pos : this.$position).loc;`,
      `}`,
      ``,
      `token(tag) {`,
      `  let t = this.$input.get(this.$position++);`,
      `  if (tag != null && t.tag !== tag) return FAIL;`,
      `  `,
      `  if (this.$position > this.$furthest) this.$furthest = this.$position;`,
      `  `,
      `  return t;`,
      `}`,
      ``,
      `t(tag) { return this.token(tag); }`,
      ``,
      `nothing() {`,
      `  return null;`,
      `}`,
      ``,
      `pos() {`,
      `  return this.$position;`,
      `}`,
    ];
  }
  
  handleGrammar(ast, prefix) {
    if (prefix == null) prefix = ``;
    ast.js = ``;
    
    for (let rule of ast.rules) this.handle(rule, prefix + "  ");
    
    ast.js += prefix + `// Generated by meta.\n`;
    ast.js += prefix + `"use strict";\n`;
    ast.js += prefix + `\n`;
    ast.js += prefix + `const FAIL = Symbol("FAIL");\n`;
    ast.js += prefix + `\n`;
    ast.js += prefix + `module.exports =\n`;
    ast.js += prefix + `class ${ast.name} {\n`;
    ast.js += prefix + `  \n`;
    for (let line of this.builtins) {
      ast.js += prefix + `  ${line}\n`;
    }
    for (let rule of ast.rules) {
      ast.js += prefix + `  \n`;
      ast.js += rule.js;
    }
    ast.js += prefix + `  \n`;
    ast.js += prefix + `}\n`;
  }
  
  handleRule(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "  ");
    
    ast.js += prefix + `${ast.name}(${ast.parameters.join(", ")}) {\n`;
    ast.js += prefix + `  let RESULT = FAIL;\n`;
    if (ast.bound.length > 0) {
      ast.js += prefix + `  let ${ast.bound.join(", ")};\n`;
    }
    if (ast.parameters.length === 0 && this.memoFlag) {
      ast.js += prefix + `  \n`;
      ast.js += prefix + `  let MEMO = this.$memotab[this.$position];\n`;
      ast.js += prefix + `  if (MEMO.rule === ${JSON.stringify(ast.name)}) {\n`;
      ast.js += prefix + `    this.$position = MEMO.position;\n`;
      ast.js += prefix + `    return MEMO.result;\n`;
      ast.js += prefix + `  }\n`;
    }
    ast.js += prefix + `  \n`;
    ast.js += ast.pattern.js;
    if (ast.parameters.length === 0 && this.memoFlag) {
      ast.js += prefix + `  \n`;
      ast.js += prefix + `  MEMO.rule = ${JSON.stringify(ast.name)};\n`;
      ast.js += prefix + `  MEMO.position = this.$position;\n`;
      ast.js += prefix + `  MEMO.result = RESULT;\n`;
    }
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  return RESULT;\n`;
    ast.js += prefix + `}\n`;
  }
  
  handleChoice(ast, prefix) {
      ast.js = ``;
      
      for (let pattern of ast.patterns) this.handle(pattern, prefix + "  ");
      
      ast.js += prefix + `while (true) { // CHOICE\n`;
      ast.js += prefix + `  let INITPOS = this.$position;\n`;
      for (let pattern of ast.patterns) {
        ast.js += prefix + `  \n`;
        ast.js += prefix + `  this.$position = INITPOS;\n`;
        ast.js += pattern.js;
        ast.js += prefix + `  if (RESULT !== FAIL) break;\n`;
      }
      ast.js += prefix + `  \n`;
      ast.js += prefix + `  break;\n`;
      ast.js += prefix + `}\n`;
  }
  handleSequence(ast, prefix) {
    ast.js = ``;
    
    for (let pattern of ast.patterns) this.handle(pattern, prefix + "  ");
    
    ast.js += prefix + `while (true) { // SEQUENCE\n`;
    for (let pattern of ast.patterns) {
      ast.js += pattern.js;
      ast.js += prefix + `  if (RESULT === FAIL) break;\n`;
      ast.js += prefix + `  \n`;
    }
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleBind(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "");
    
    ast.js += ast.pattern.js;
    ast.js += prefix + `${ast.name} = RESULT;\n`;
  }
  handleDelimited(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.element,   prefix + "    ");
    this.handle(ast.delimiter, prefix + "      ");
    
    ast.js += prefix + `while (true) { // DELIMITED\n`;
    ast.js += prefix + `  let ARRAY = [];\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  while (true) {\n`;
    ast.js += prefix + `    let INITPOS = this.$position;\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    if (ARRAY.length > 0) {\n`;
    ast.js += ast.delimiter.js;
    ast.js += prefix + `      if (RESULT === FAIL) {\n`;
    ast.js += prefix + `        this.$position = INITPOS;\n`;
    ast.js += prefix + `        break;\n`;
    ast.js += prefix + `      }\n`;
    ast.js += prefix + `    }\n`;
    ast.js += prefix + `    \n`;
    ast.js += ast.element.js;
    ast.js += prefix + `    if (RESULT === FAIL) {\n`;
    ast.js += prefix + `      this.$position = INITPOS;\n`;
    ast.js += prefix + `      break;\n`;
    ast.js += prefix + `    }\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    ARRAY.push(RESULT);\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  RESULT = ARRAY;\n`;
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleDelimited1(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.element,   prefix + "    ");
    this.handle(ast.delimiter, prefix + "      ");
    
    ast.js += prefix + `while (true) { // DELIMITED\n`;
    ast.js += prefix + `  let ARRAY = [];\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  while (true) {\n`;
    ast.js += prefix + `    let INITPOS = this.$position;\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    if (ARRAY.length > 0) {\n`;
    ast.js += ast.delimiter.js;
    ast.js += prefix + `      if (RESULT === FAIL) {\n`;
    ast.js += prefix + `        this.$position = INITPOS;\n`;
    ast.js += prefix + `        break;\n`;
    ast.js += prefix + `      }\n`;
    ast.js += prefix + `    }\n`;
    ast.js += prefix + `    \n`;
    ast.js += ast.element.js;
    ast.js += prefix + `    if (RESULT === FAIL) {\n`;
    ast.js += prefix + `      this.$position = INITPOS;\n`;
    ast.js += prefix + `      break;\n`;
    ast.js += prefix + `    }\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    ARRAY.push(RESULT);\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  if (ARRAY.length >= 1) RESULT = ARRAY;\n`;
    ast.js += prefix + `  else                   RESULT = FAIL;\n`;
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleNegate(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "  ");
    
    ast.js += prefix + `while (true) { // NEGATE\n`;
    ast.js += prefix + `  let INITPOS = this.$position;\n`;
    ast.js += prefix + `  \n`;
    ast.js += ast.pattern.js;
    ast.js += prefix + `  if (RESULT === FAIL) {\n`;
    ast.js += prefix + `    this.$position = INITPOS;\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    RESULT = null;\n`;
    ast.js += prefix + `    break;\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  else {\n`;
    ast.js += prefix + `    RESULT = FAIL;\n`;
    ast.js += prefix + `    break;\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `}\n`;
  }
  handleNegate(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "  ");
    
    ast.js += prefix + `while (true) { // NEGATE\n`;
    ast.js += prefix + `  let INITPOS = this.$position;\n`;
    ast.js += prefix + `  \n`;
    ast.js += ast.pattern.js;
    ast.js += prefix + `  if (RESULT === FAIL) {\n`;
    ast.js += prefix + `    this.$position = INITPOS;\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    RESULT = null;\n`;
    ast.js += prefix + `    break;\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  else {\n`;
    ast.js += prefix + `    RESULT = FAIL;\n`;
    ast.js += prefix + `    break;\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `}\n`;
  }
  handleLookahead(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "  ");
    
    ast.js += prefix + `while (true) { // LOOKAHEAD\n`;
    ast.js += prefix + `  let INITPOS = this.$position;\n`;
    ast.js += prefix + `  \n`;
    ast.js += ast.pattern.js;
    ast.js += prefix + `  this.$position = INITPOS;\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleRepeat(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "    ");
    
    ast.js += prefix + `while (true) { // REPEAT\n`;
    ast.js += prefix + `  let ARRAY = [];\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  while (true) {\n`;
    ast.js += prefix + `    let INITPOS = this.$position;\n`;
    ast.js += prefix + `    \n`;
    ast.js += ast.pattern.js;
    ast.js += prefix + `    if (RESULT === FAIL) {\n`;
    ast.js += prefix + `      this.$position = INITPOS;\n`;
    ast.js += prefix + `      break;\n`
    ast.js += prefix + `    }\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    ARRAY.push(RESULT);\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  RESULT = ARRAY;\n`;
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleRepeat1(ast, prefix) {
    ast.js = ``;
    
    this.handle(ast.pattern, prefix + "    ");
    
    ast.js += prefix + `while (true) { // REPEAT1\n`;
    ast.js += prefix + `  let ARRAY = [];\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  while (true) {\n`;
    ast.js += prefix + `    let INITPOS = this.$position;\n`;
    ast.js += prefix + `    \n`;
    ast.js += ast.pattern.js;
    ast.js += prefix + `    if (RESULT === FAIL) {\n`;
    ast.js += prefix + `      this.$position = INITPOS;\n`;
    ast.js += prefix + `      break;\n`
    ast.js += prefix + `    }\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    ARRAY.push(RESULT);\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  if (ARRAY.length === 0) RESULT = FAIL;\n`;
    ast.js += prefix + `  else                    RESULT = ARRAY;\n`;
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleOptional(ast, prefix) {
    ast.js = ``;
        
    this.handle(ast.pattern, prefix + "  ");
    
    ast.js += prefix + `while (true) { // OPTIONAL\n`;
    ast.js += prefix + `  let INITPOS = this.$position;\n`;
    ast.js += prefix + `  \n`;
    ast.js += ast.pattern.js;
    ast.js += prefix + `  if (RESULT === FAIL) {\n`;
    ast.js += prefix + `    this.$position = INITPOS;\n`;
    ast.js += prefix + `    \n`;
    ast.js += prefix + `    RESULT = ${ast.default != null ? ast.default : "null"};\n`;
    ast.js += prefix + `  }\n`;
    ast.js += prefix + `  \n`;
    ast.js += prefix + `  break;\n`;
    ast.js += prefix + `}\n`;
  }
  handleImmediate(ast, prefix) {
    ast.js = prefix + `RESULT = ${ast.code}();\n`;
  }
  handleAction(ast, prefix) {
    ast.js = prefix + `RESULT = ${ast.code};\n`;
  }
  handlePredicate(ast, prefix) {
    ast.js = prefix + `RESULT = (${ast.code} ? null : FAIL);\n`;
  }
  handleCall(ast, prefix) {
    ast.js = prefix + `RESULT = this.${ast.name}(${ast.code != null ? ast.code : ""});\n`;
  }
  handleCallByName(ast, prefix) {
    ast.js = ``;
    
    for (let pattern of ast.patterns) this.handle(pattern, prefix + "    ");
    
    ast.js += prefix + `RESULT = this.${ast.name}(\n`;
    for (let i = 0, c = ast.patterns.length; i < c; i++) {
      ast.js += prefix + `  () => {\n`;
      ast.js += prefix + `    let RESULT = FAIL;\n`;
      ast.js += prefix + `    \n`;
      ast.js += ast.patterns[i].js;
      ast.js += prefix + `    \n`;
      ast.js += prefix + `    return RESULT;\n`;
      ast.js += prefix + `  }${i === c - 1 ? "" : ","}\n`;
    }
    ast.js += prefix + `);\n`;
  }
  
}
