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

let Symtab = require("./Symtab.js");
let unify  = require("./unify.js");


function AnalyzeTypePropagation(ast) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, AnalyzeTypePropagation);
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    AnalyzeTypePropagation(ast.body);
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Block") {
    for (let statement of ast.statements) {
      AnalyzeTypePropagation(statement);
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) {
        AnalyzeTypePropagation(variable.value);
      }
    }
  }
  else if (ast.tag === "IfStatement") {
    AnalyzeTypePropagation(ast.condition);
    AnalyzeTypePropagation(ast.consiquent);
    AnalyzeTypePropagation(ast.alternative);
  }
  else if (ast.tag === "OnceStatement") {
    AnalyzeTypePropagation(ast.body);
  }
  else if (ast.tag === "ForeverStatement") {
    AnalyzeTypePropagation(ast.body);
  }
  else if (ast.tag === "WhileStatement") {
    AnalyzeTypePropagation(ast.condition);
    AnalyzeTypePropagation(ast.body);
  }
  else if (ast.tag === "DoWhileStatement") {
    AnalyzeTypePropagation(ast.body);
    AnalyzeTypePropagation(ast.condition);
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.expression != null) {
      ast.expression.type = unify(ast.function.return, ast.expression.type);
    
      AnalyzeTypePropagation(ast.expression);
    }
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    AnalyzeTypePropagation(ast.expression);
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    AnalyzeTypePropagation(ast.a);
    AnalyzeTypePropagation(ast.b);
  }
  else if (ast.tag === "XorCondition") {
    AnalyzeTypePropagation(ast.a);
    AnalyzeTypePropagation(ast.b);
  }
  else if (ast.tag === "AndCondition") {
    AnalyzeTypePropagation(ast.a);
    AnalyzeTypePropagation(ast.b);
  }
  else if (ast.tag === "NotCondition") {
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "ComparisonCondition") {
    AnalyzeTypePropagation(ast.a);
    AnalyzeTypePropagation(ast.b);
  }
  else if (ast.tag === "ValueCondition") {
    AnalyzeTypePropagation(ast.value);
  }
  
  
  else if (ast.tag === "NullCast") {
    AnalyzeTypePropagation(ast.argument);
  }
  else if (ast.tag === "IntegerCast") {
    AnalyzeTypePropagation(ast.argument);
  }
  else if (ast.tag === "BooleanCast") {
    AnalyzeTypePropagation(ast.argument);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    AnalyzeTypePropagation(ast.condition);
  }
  else if (ast.tag === "TernaryExpression") {
    ast.consiquent.type  = unify(ast.type, ast.consiquent.type);
    ast.alternative.type = unify(ast.type, ast.alternative.type);
    
    AnalyzeTypePropagation(ast.condition);
    AnalyzeTypePropagation(ast.consiquent);
    AnalyzeTypePropagation(ast.alternative);
  }
  else if (ast.tag === "ComparisonExpression") {
    ast.a.type = ast.b.type = unify(ast.a.type, ast.b.type);
    
    AnalyzeTypePropagation(ast.a);
    AnalyzeTypePropagation(ast.b);
  }
  else if (ast.tag === "InfixExpression") {
    ast.a.type = unify(ast.type, ast.a.type);
    ast.b.type = unify(ast.type, ast.b.type);
    
    AnalyzeTypePropagation(ast.a);
    AnalyzeTypePropagation(ast.b);
  }
  else if (ast.tag === "PrefixExpression") {
    ast.a.type = unify(ast.type, ast.a.type);
    
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "DerefExpression") {
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "AddrExpression") {
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "LookupExpression") {
  }
  else if (ast.tag === "SetExpression") {
    ast.a.type = unify(ast.type, ast.a.type);
    
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "LookupPropertyExpression") {
    AnalyzeTypePropagation(ast.subject);
  }
  else if (ast.tag === "SetPropertyExpression") {
    ast.argument.type = unify(ast.type, ast.argument.type);
    
    AnalyzeTypePropagation(ast.subject);
    AnalyzeTypePropagation(ast.argument);
  }
  else if (ast.tag === "CallExpression") {
    if (ast.subject.type.tag === "FunctionType") {
      if (ast.subject.type.parameters.length !== ast.arguments.length) {
        throw new Error();
      }
      
      for (let i = 0, c = ast.arguments.length; i < c; i++) {
        let a = ast.arguments[i];
        let p = ast.subject.type.parameters[i];
        
        a.type = unify(p.type, a.type);
      }
    }
    else {
      throw new Error();
    }
    
    AnalyzeTypePropagation(ast.subject);
    for (let argument of ast.arguments) {
      AnalyzeTypePropagation(argument);
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
    if (ast.type.width != null && ast.type.signed != null) {
    }
    else {
      throw new Error("Integer literal was not typed during type propagation.");
    }
  }
  else if (ast.tag === "StringLiteral") {
  }
  else if (ast.tag === "BooleanLiteral") {
  }
  else if (ast.tag === "NullLiteral") {
    if (ast.type.target != null) {
    }
    else {
      throw new Error("Null literal was not typed during type propagation.");
    }
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeTypePropagation;
