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
class AnalyzeBindings {
  
  handle(ast, ...rest) {
    if (this["handle" + ast.tag] != null) {
      return this["handle" + ast.tag](ast, ...rest);
    }
    else {
      throw new Error(`Unhandled ast node type ${ast.tag}.`);
    }
  }
  
  handleGrammar(ast) {
    for (let rule of ast.rules) this.handle(rule);
  }
  
  handleRule(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  
  handleChoice(ast) {
    for (let pattern of ast.patterns) this.handle(pattern);
    
    ast.bound = [];
    for (let pattern of ast.patterns) {
      for (let name of pattern.bound) {
        if (!ast.bound.includes(name)) ast.bound.push(name);
      }
    }
  }
  handleSequence(ast) {
    for (let pattern of ast.patterns) this.handle(pattern);
    
    ast.bound = [];
    for (let pattern of ast.patterns) {
      for (let name of pattern.bound) {
        if (!ast.bound.includes(name)) ast.bound.push(name);
      }
    }
  }
  handleBind(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound.slice();
    if (!ast.bound.includes(ast.name)) {
      ast.bound.push(ast.name);
    }
  }
  handleDelimited(ast) {
    this.handle(ast.element);
    this.handle(ast.delimiter);

    ast.bound = [];
    for (let name of ast.element.bound) {
      if (!ast.bound.includes(name)) ast.bound.push(name);
    }
    for (let name of ast.delimiter.bound) {
      if (!ast.bound.includes(name)) ast.bound.push(name);
    }
  }
  handleDelimited1(ast) {
    this.handle(ast.element);
    this.handle(ast.delimiter);

    ast.bound = [];
    for (let name of ast.element.bound) {
      if (!ast.bound.includes(name)) ast.bound.push(name);
    }
    for (let name of ast.delimiter.bound) {
      if (!ast.bound.includes(name)) ast.bound.push(name);
    }
  }
  handleNegate(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  handleNegate(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  handleLookahead(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  handleRepeat(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  handleRepeat1(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  handleOptional(ast) {
    this.handle(ast.pattern);
    
    ast.bound = ast.pattern.bound;
  }
  handleImmediate(ast) {
    ast.bound = [];
  }
  handleAction(ast) {
    ast.bound = [];
  }
  handlePredicate(ast) {
    ast.bound = [];
  }
  handleCall(ast) {
    ast.bound = [];
  }
  handleCallByName(ast) {
    for (let pattern of ast.patterns) this.handle(pattern);
    
    ast.bound = [];
    for (let pattern of ast.patterns) {
      for (let name of pattern.bound) {
        if (!ast.bound.includes(name)) ast.bound.push(name);
      }
    }
  }
  
}
