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


function AnalyzeTypePropagation(ast, context) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, AnalyzeTypePropagation);
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Primitive") {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    AnalyzeTypePropagation(ast.value, {});
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    AnalyzeTypePropagation(ast.body, { fn: ast });
  }
  
  
  else if (ast.tag === "Block") {
    for (let statement of ast.statements) {
      AnalyzeTypePropagation(statement, context);
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) {
        AnalyzeTypePropagation(variable.value, context);
      }
    }
  }
  else if (ast.tag === "IfStatement") {
    AnalyzeTypePropagation(ast.condition, context);
    AnalyzeTypePropagation(ast.consiquent, context);
    AnalyzeTypePropagation(ast.alternative, context);
  }
  else if (ast.tag === "OnceStatement") {
    AnalyzeTypePropagation(ast.body, context);
  }
  else if (ast.tag === "ForeverStatement") {
    AnalyzeTypePropagation(ast.body, context);
  }
  else if (ast.tag === "WhileStatement") {
    AnalyzeTypePropagation(ast.condition, context);
    AnalyzeTypePropagation(ast.body, context);
  }
  else if (ast.tag === "DoWhileStatement") {
    AnalyzeTypePropagation(ast.body, context);
    AnalyzeTypePropagation(ast.condition, context);
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.expression != null) {
      ast.type            = context.fn.return;
      ast.expression.type = unify(ast.type, ast.expression.type);
    
      AnalyzeTypePropagation(ast.expression, context);
    }
    else {
      ast.type = context.fn.return;
    }
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    AnalyzeTypePropagation(ast.expression, context);
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    AnalyzeTypePropagation(ast.a, context);
    AnalyzeTypePropagation(ast.b, context);
  }
  else if (ast.tag === "XorCondition") {
    AnalyzeTypePropagation(ast.a, context);
    AnalyzeTypePropagation(ast.b, context);
  }
  else if (ast.tag === "AndCondition") {
    AnalyzeTypePropagation(ast.a, context);
    AnalyzeTypePropagation(ast.b, context);
  }
  else if (ast.tag === "NotCondition") {
    AnalyzeTypePropagation(ast.a, context);
  }
  else if (ast.tag === "ComparisonCondition") {
    ast.a.type = ast.b.type = unify(ast.a.type, ast.b.type);
    
    AnalyzeTypePropagation(ast.a, context);
    AnalyzeTypePropagation(ast.b, context);
  }
  else if (ast.tag === "ValueCondition") {
    AnalyzeTypePropagation(ast.value, context);
  }
  
  
  else if (ast.tag === "NullCast") {
    AnalyzeTypePropagation(ast.argument, context);
  }
  else if (ast.tag === "ExtendCast") {
    AnalyzeTypePropagation(ast.argument, context);
  }
  else if (ast.tag === "BooleanCast") {
    AnalyzeTypePropagation(ast.argument, context);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    AnalyzeTypePropagation(ast.condition, context);
  }
  else if (ast.tag === "TernaryExpression") {
    ast.consiquent.type  = unify(ast.type, ast.consiquent.type);
    ast.alternative.type = unify(ast.type, ast.alternative.type);
    
    AnalyzeTypePropagation(ast.condition, context);
    AnalyzeTypePropagation(ast.consiquent, context);
    AnalyzeTypePropagation(ast.alternative, context);
  }
  else if (ast.tag === "InfixExpression") {
    ast.a.type = unify(ast.type, ast.a.type);
    ast.b.type = unify(ast.type, ast.b.type);
    
    AnalyzeTypePropagation(ast.a, context);
    AnalyzeTypePropagation(ast.b, context);
  }
  else if (ast.tag === "PrefixExpression") {
    ast.a.type = unify(ast.type, ast.a.type);
    
    AnalyzeTypePropagation(ast.a, context);
  }
  else if (ast.tag === "RefExpression") {
    ast.a.type.target = unify(ast.type, ast.a.type.target);
    
    AnalyzeTypePropagation(ast.a, context);
  }
  else if (ast.tag === "AddrExpression") {
    ast.location.type = unify(ast.type.target, ast.location.type);
    
    AnalyzeTypePropagation(ast.location, context);
  }
  else if (ast.tag === "LookupExpression") {
  }
  else if (ast.tag === "SetExpression") {
    ast.value.type = unify(ast.type, ast.value.type);
    
    AnalyzeTypePropagation(ast.location, context);
    AnalyzeTypePropagation(ast.value, context);
  }
  else if (ast.tag === "FieldExpression") {
    AnalyzeTypePropagation(ast.subject, context);
  }
  else if (ast.tag === "CallExpression") {
    if (ast.arguments.length < ast.subject.type.parameters.length) {
      throw new Error(`Cannot call function with too few arguments.`);
    }
    if (ast.arguments.length > ast.subject.type.parameters.length && !ast.subject.type.vaparam) {
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
    
    AnalyzeTypePropagation(ast.subject, context);
    for (let argument of ast.arguments) {
      AnalyzeTypePropagation(argument, context);
    }
  }
  else if (ast.tag === "InitStructExpression") {
    if (ast.arguments.length === 0) {
    }
    else if (ast.arguments[0].tag === "Keyval") {
      let names = [];
      
      for (let kv of ast.arguments) {
        kv.field = ast.type.fields.find(f => kv.key === f.name);
        
        if (kv.field == null) throw new Error(`Field does not exist in struct ${kv.key}.`);
        
        if (names.includes(kv.key)) throw new Error(`Field already specified in struct initializer.`);
        else                        names.push(kv.key);
        
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
      if (a.tag === "Keyval") AnalyzeTypePropagation(a.value, context);
      else                    AnalyzeTypePropagation(a, context);
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
