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
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    AnalyzeTypePropagation(ast.value);
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    AnalyzeTypePropagation(ast.body);
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
  else if (ast.tag === "ExtendCast") {
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
  else if (ast.tag === "RefExpression") {
    ast.a.type.target = unify(ast.type, ast.a.type.target);
    
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "AddrExpression") {
    ast.location.type = unify(ast.type.target, ast.location.type);
    
    AnalyzeTypePropagation(ast.location);
  }
  else if (ast.tag === "LookupExpression") {
  }
  else if (ast.tag === "SetExpression") {
    ast.a.type = unify(ast.type, ast.a.type);
    
    AnalyzeTypePropagation(ast.a);
  }
  else if (ast.tag === "FieldExpression") {
    AnalyzeTypePropagation(ast.subject);
  }
  else if (ast.tag === "CallExpression") {
    if (ast.arguments.length < ast.subject.type.parameters.length) {
      throw new Error(`Cannot call function with too few arguments.`);
    }
    if (ast.arguments.length > ast.subject.type.parameters.length && !ast.subject.type.vaparameter) {
      throw new Error(`Cannot call function without varargs with varargs.`);
    }
    if (ast.arguments.length > 0 && ast.arguments[0].tag === "Keyval") {
      throw new Error(`Keyval arguments are not yet supported for function calls.`);
    }
    
    for (let i = 0, c = ast.arguments.length; i < c; i++) {
      if (i < ast.subject.type.parameters.length) {
        let p = ast.subject.type.parameters[i];
        let a = ast.arguments[i];
        
        a.type = unify(p.type, a.type);
      }
      else {
        let a = ast.arguments[i];
        
        if      (a.type.tag === "StructType")   throw new Error(`Cannot pass struct as parameter.`);
        else if (a.type.tag === "FunctionType") {}
        else if (a.type.tag === "PointerType")  {}
        else if (a.type.tag === "IntegerType")  {
          if (a.type.width == null) {
            a.type.width  = 64;
            a.type.signed = (a.type.signed === true ? true : false);
          }
          
          if (a.type.width < 64) {
            ast.arguments[i] = { tag: "ExtendCast", argument: a, type: { tag: "IntegerType", width: 64, signed: a.type.signed, ref: false }};
          }
        }
        else if (a.type.tag === "BooleanType") {
          a.type.width  = 8;
          a.type.signed = false;
          
          ast.arguments[i] = { tag: "ExtendCast", argument: a, type: { tag: "IntegerType", width: 64, signed: false, ref: false }};
        }
        else if (a.type.tag === "HaltType") throw new Error("Cannot pass argument of halt type as vararg.");
        else if (a.type.tag === "VoidType") throw new Error("Cannot pass argument of void type as vararg.");
        else                                throw new Error("Invalid type.");
      }
    }
    
    if (ast.type.tag === "StructType") {
      throw new Error(`Cannot return struct type.`);
    }
    
    AnalyzeTypePropagation(ast.subject);
    for (let argument of ast.arguments) {
      AnalyzeTypePropagation(argument);
    }
  }
  else if (ast.tag === "InitStructExpression") {
    if (ast.arguments.length === 0) {
    }
    else if (ast.arguments[0].tag === "Keyval") {
      let names = [];
      
      for (let kv of ast.arguments) {
        if (kv.tag !== "Keyval") throw new Error(`Expected all or none of the struct initializers to be keyed.`);
        
        kv.field = ast.type.fields.find(f => kv.key === f.name);
        
        if (names.includes(kv.name)) throw new Error(`Field already specified in struct initializer.`);
        if (kv.field == null)        throw new Error(`Field does not exist in struct ${kv.name}.`);
        
        names.push(kv.name);
        
        kv.value.type = unify(kv.field.type, kv.value.type);
      }
      
      ast.clear = [];
      
      for (let f of ast.type.fields) {
        if (ast.arguments.find(a => a.key === f.name) == null) {
          ast.clear.push(f);
        }
      }
    }
    else {
      if (ast.arguments.length !== ast.type.fields.length) {
        throw new Error(`Incorrect number of arguments in struct initializer.`);
      }
      
      for (let i = 0, c = ast.arguments.length; i < c; i++) {
        let f = ast.type.fields[i];
        let a = ast.arguments[i];
        
        a.type = unify(f.type, a.type);
      }
    }
    
    for (let a of ast.arguments) {
      if (a.tag === "Keyval") AnalyzeTypePropagation(a.v);
      else                    AnalyzeTypePropagation(a);
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
  
  
  else if (ast.tag === "Initializer") {
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeTypePropagation;
