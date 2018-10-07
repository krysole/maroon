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
class Simplify {
  
  handle(ast, ...rest) {
    if (this["handle" + ast.tag] != null) {
      return this["handle" + ast.tag](ast, ...rest);
    }
    else {
      throw new Error(`Unhandled ast node type ${ast.tag}.`);
    }
  }
  
  transmute(target, source) {
    for (let name in target) {
      delete target[name];
    }
    for (let name in source) {
      target[name] = source[name];
    }
  }
  
  handleGrammar(ast) {
    for (let rule of ast.rules) this.handle(rule);
  }
  
  handleRule(ast) {
    this.handle(ast.pattern);
  }
  
  handleChoice(ast) {
    for (let pattern of ast.patterns) this.handle(pattern);
    
    let flattened = [];
    for (let pattern of ast.patterns) {
      if (pattern.tag === "Choice") {
        for (let subpattern of pattern.patterns) {
          flattened.push(subpattern);
        }
      }
      else {
        flattened.push(pattern);
      }
    }
    
    if (flattened.length > 1) {
      this.transmute(ast, { tag: "Choice", patterns: flattened });
    }
    else {
      this.transmute(ast, flattened[0]);
    }
  }
  handleSequence(ast) {
    for (let pattern of ast.patterns) this.handle(pattern);
    
    let flattened = [];
    for (let pattern of ast.patterns) {
      if (pattern.tag === "Sequence") {
        for (let subpattern of pattern.patterns) {
          flattened.push(subpattern);
        }
      }
      else {
        flattened.push(pattern);
      }
    }
    
    if (flattened.length > 1) {
      this.transmute(ast, { tag: "Sequence", patterns: flattened });
    }
    else {
      this.transmute(ast, flattened[0]);
    }
  }
  handleBind(ast) {
    this.handle(ast.pattern);
  }
  handleDelimited(ast) {
    this.handle(ast.element);
    this.handle(ast.delimiter);
  }
  handleDelimited1(ast) {
    this.handle(ast.element);
    this.handle(ast.delimiter);
  }
  handleNegate(ast) {
    this.handle(ast.pattern);
  }
  handleNegate(ast) {
    this.handle(ast.pattern);
  }
  handleLookahead(ast) {
    this.handle(ast.pattern);
  }
  handleRepeat(ast) {
    this.handle(ast.pattern);
  }
  handleRepeat1(ast) {
    this.handle(ast.pattern);
  }
  handleOptional(ast) {
    this.handle(ast.pattern);
  }
  handleImmediate(ast) {
  }
  handleAction(ast) {
  }
  handlePredicate(ast) {
  }
  handleCall(ast) {
  }
  handleCallByName(ast) {
    for (let pattern of ast.patterns) this.handle(pattern);
  }
  
}