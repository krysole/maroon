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
let unify    = require("./unify.js");


function AnalyzeDeclarationInfo(ast) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, AnalyzeDeclarationInfo);
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    AnalyzeDeclarationInfo(ast.body);
    
    if (ast.body != null) ast.kind = "GlobalFunction";
    else                  ast.kind = "ExternalFunction";
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Block") {
    for (let statement of ast.statements) {
      AnalyzeDeclarationInfo(statement);
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) {
        AnalyzeDeclarationInfo(variable.value);
      }
      
      variable.kind = "LocalVariable";
    }
  }
  else if (ast.tag === "IfStatement") {
    AnalyzeDeclarationInfo(ast.condition);
    AnalyzeDeclarationInfo(ast.consiquent);
    AnalyzeDeclarationInfo(ast.alternative);
  }
  else if (ast.tag === "OnceStatement") {
    AnalyzeDeclarationInfo(ast.body);
  }
  else if (ast.tag === "ForeverStatement") {
    AnalyzeDeclarationInfo(ast.body);
  }
  else if (ast.tag === "WhileStatement") {
    AnalyzeDeclarationInfo(ast.condition);
    AnalyzeDeclarationInfo(ast.body);
  }
  else if (ast.tag === "DoWhileStatement") {
    AnalyzeDeclarationInfo(ast.body);
    AnalyzeDeclarationInfo(ast.condition);
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.expression != null) {
      AnalyzeDeclarationInfo(ast.expression);
    }
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    AnalyzeDeclarationInfo(ast.expression);
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    AnalyzeDeclarationInfo(ast.a);
    AnalyzeDeclarationInfo(ast.b);
  }
  else if (ast.tag === "XorCondition") {
    AnalyzeDeclarationInfo(ast.a);
    AnalyzeDeclarationInfo(ast.b);
  }
  else if (ast.tag === "AndCondition") {
    AnalyzeDeclarationInfo(ast.a);
    AnalyzeDeclarationInfo(ast.b);
  }
  else if (ast.tag === "NotCondition") {
    AnalyzeDeclarationInfo(ast.a);
  }
  else if (ast.tag === "ComparisonCondition") {
    AnalyzeDeclarationInfo(ast.a);
    AnalyzeDeclarationInfo(ast.b);
  }
  else if (ast.tag === "ValueCondition") {
    AnalyzeDeclarationInfo(ast.value);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    AnalyzeDeclarationInfo(ast.condition);
  }
  else if (ast.tag === "TypecastExpression") {
    AnalyzeDeclarationInfo(ast.argument);
  }
  else if (ast.tag === "TernaryExpression") {
    AnalyzeDeclarationInfo(ast.condition);
    AnalyzeDeclarationInfo(ast.consiquent);
    AnalyzeDeclarationInfo(ast.alternative);
  }
  else if (ast.tag === "InfixExpression") {
    AnalyzeDeclarationInfo(ast.a);
    AnalyzeDeclarationInfo(ast.b);
  }
  else if (ast.tag === "PrefixExpression") {
    AnalyzeDeclarationInfo(ast.a);
  }
  else if (ast.tag === "RefExpression") {
    AnalyzeDeclarationInfo(ast.a);
  }
  else if (ast.tag === "AddrExpression") {
  }
  else if (ast.tag === "LookupExpression") {
  }
  else if (ast.tag === "SetExpression") {
    AnalyzeDeclarationInfo(ast.a);
  }
  else if (ast.tag === "LookupPropertyExpression") {
    AnalyzeDeclarationInfo(ast.subject);
  }
  else if (ast.tag === "SetPropertyExpression") {
    AnalyzeDeclarationInfo(ast.subject);
    AnalyzeDeclarationInfo(ast.argument);
  }
  else if (ast.tag === "CallExpression") {
    AnalyzeDeclarationInfo(ast.subject);
    for (let argument of ast.arguments) {
      AnalyzeDeclarationInfo(argument);
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
  }
  else if (ast.tag === "StringLiteral") {
  }
  else if (ast.tag === "BooleanLiteral") {
  }
  else if (ast.tag === "NullLiteral") {
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeDeclarationInfo;
