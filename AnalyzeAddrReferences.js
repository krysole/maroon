//
// The Maroon Programming Language
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

let Symtab   = require("./Symtab.js");


function AnalyzeAddrReferences(ast) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, AnalyzeAddrReferences);
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    AnalyzeAddrReferences(ast.value);
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    AnalyzeAddrReferences(ast.body);
  }
  
  
  else if (ast.tag === "Block") {
    for (let statement of ast.statements) {
      AnalyzeAddrReferences(statement);
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) {
        AnalyzeAddrReferences(variable.value);
      }
    }
  }
  else if (ast.tag === "IfStatement") {
    AnalyzeAddrReferences(ast.condition);
    AnalyzeAddrReferences(ast.consiquent);
    AnalyzeAddrReferences(ast.alternative);
  }
  else if (ast.tag === "OnceStatement") {
    AnalyzeAddrReferences(ast.body);
  }
  else if (ast.tag === "ForeverStatement") {
    AnalyzeAddrReferences(ast.body);
  }
  else if (ast.tag === "WhileStatement") {
    AnalyzeAddrReferences(ast.condition);
    AnalyzeAddrReferences(ast.body);
  }
  else if (ast.tag === "DoWhileStatement") {
    AnalyzeAddrReferences(ast.body);
    AnalyzeAddrReferences(ast.condition);
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.expression != null) {
      AnalyzeAddrReferences(ast.expression);
    }
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    AnalyzeAddrReferences(ast.expression);
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    AnalyzeAddrReferences(ast.a);
    AnalyzeAddrReferences(ast.b);
  }
  else if (ast.tag === "XorCondition") {
    AnalyzeAddrReferences(ast.a);
    AnalyzeAddrReferences(ast.b);
  }
  else if (ast.tag === "AndCondition") {
    AnalyzeAddrReferences(ast.a);
    AnalyzeAddrReferences(ast.b);
  }
  else if (ast.tag === "NotCondition") {
    AnalyzeAddrReferences(ast.a);
  }
  else if (ast.tag === "ComparisonCondition") {
    AnalyzeAddrReferences(ast.a);
    AnalyzeAddrReferences(ast.b);
  }
  else if (ast.tag === "ValueCondition") {
    AnalyzeAddrReferences(ast.value);
  }
  
  
  else if (ast.tag === "NullCast") {
    AnalyzeAddrReferences(ast.argument);
  }
  else if (ast.tag === "ExtendCast") {
    AnalyzeAddrReferences(ast.argument);
  }
  else if (ast.tag === "BooleanCast") {
    AnalyzeAddrReferences(ast.argument);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    AnalyzeAddrReferences(ast.condition);
  }
  else if (ast.tag === "TernaryExpression") {
    AnalyzeAddrReferences(ast.condition);
    AnalyzeAddrReferences(ast.consiquent);
    AnalyzeAddrReferences(ast.alternative);
  }
  else if (ast.tag === "InfixExpression") {
    AnalyzeAddrReferences(ast.a);
    AnalyzeAddrReferences(ast.b);
  }
  else if (ast.tag === "PrefixExpression") {
    AnalyzeAddrReferences(ast.a);
  }
  else if (ast.tag === "RefExpression") {
    AnalyzeAddrReferences(ast.a);
  }
  else if (ast.tag === "AddrExpression") {
    AnalyzeAddrReferences(ast.location);
    
    if (ast.location.type.ref) {
      ast.location.addr = true;
    }
    else {
      console.dir(ast);
      throw new Error(`Cannot return address of non reference location.`);
    }
  }
  else if (ast.tag === "LookupExpression") {
  }
  else if (ast.tag === "SetExpression") {
    AnalyzeAddrReferences(ast.location);
    AnalyzeAddrReferences(ast.value);
    
    if (ast.location.type.ref) {
      ast.location.addr = true;
    }
    else {
      throw new Error(`Cannot assign to non reference location.`);
    }
  }
  else if (ast.tag === "FieldExpression") {
    AnalyzeAddrReferences(ast.subject);
    
    if (ast.subject.type.ref) {
      ast.subject.addr = true;
    }
    else {
      throw new Error(`Expected struct reference for FieldExpression.`);
    }
  }
  else if (ast.tag === "CallExpression") {
    AnalyzeAddrReferences(ast.subject);
    for (let argument of ast.arguments) {
      AnalyzeAddrReferences(argument);
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {}
  else if (ast.tag === "StringLiteral") {}
  else if (ast.tag === "BooleanLiteral") {}
  else if (ast.tag === "NullLiteral") {}
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeAddrReferences;
