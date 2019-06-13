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


function AnalyzeTypeInferencing(ast) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, AnalyzeTypeInferencing);
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Primitive") {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    AnalyzeTypeInferencing(ast.value);
    
    ast.type = ast.value.type;
    ast.ref  = true;
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    AnalyzeTypeInferencing(ast.body);
  }
  
  
  else if (ast.tag === "Block") {
    for (let statement of ast.statements) {
      AnalyzeTypeInferencing(statement);
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) {
        AnalyzeTypeInferencing(variable.value);
        
        variable.type = variable.value.type;
        variable.ref  = true;
      }
    }
  }
  else if (ast.tag === "IfStatement") {
    AnalyzeTypeInferencing(ast.condition);
    AnalyzeTypeInferencing(ast.consiquent);
    AnalyzeTypeInferencing(ast.alternative);
  }
  else if (ast.tag === "OnceStatement") {
    AnalyzeTypeInferencing(ast.body);
  }
  else if (ast.tag === "ForeverStatement") {
    AnalyzeTypeInferencing(ast.body);
  }
  else if (ast.tag === "WhileStatement") {
    AnalyzeTypeInferencing(ast.condition);
    AnalyzeTypeInferencing(ast.body);
  }
  else if (ast.tag === "DoWhileStatement") {
    AnalyzeTypeInferencing(ast.body);
    AnalyzeTypeInferencing(ast.condition);
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.expression != null) {
      AnalyzeTypeInferencing(ast.expression);
    }
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    AnalyzeTypeInferencing(ast.expression);
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    AnalyzeTypeInferencing(ast.a);
    AnalyzeTypeInferencing(ast.b);
  }
  else if (ast.tag === "XorCondition") {
    AnalyzeTypeInferencing(ast.a);
    AnalyzeTypeInferencing(ast.b);
  }
  else if (ast.tag === "AndCondition") {
    AnalyzeTypeInferencing(ast.a);
    AnalyzeTypeInferencing(ast.b);
  }
  else if (ast.tag === "NotCondition") {
    AnalyzeTypeInferencing(ast.a);
  }
  else if (ast.tag === "ComparisonCondition") {
    AnalyzeTypeInferencing(ast.a);
    AnalyzeTypeInferencing(ast.b);
    
    unify(ast.a.type, ast.b.type);
  }
  else if (ast.tag === "ValueCondition") {
    AnalyzeTypeInferencing(ast.value);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    AnalyzeTypeInferencing(ast.condition);
    
    ast.type = { tag: "BooleanType" };
    ast.ref  = false;
  }
  else if (ast.tag === "TypecastExpression") {
    AnalyzeTypeInferencing(ast.argument);
    
    ast.ref = false;
    
    if (ast.argument.type.tag === ast.type.tag &&
        ast.argument.type.width === ast.type.width && // if present
        ast.argument.type.signed === ast.type.signed) { // if present
      // t => t
      
      ast.tag = "NullCast";
    }
    if (ast.type.tag === "FunctionType") {
      if (ast.argument.type.tag === "PointerType") {
        // [t] => fn [...] r;
        
        ast.tag = "NullCast";
      }
      else if (ast.argument.type.tag === "IntegerType" &&
               ast.argument.type.width === 64 &&
               ast.argument.type.signed === false) {
        // u64 => fn [...] r
        
        ast.tag = "NullCast";
      }
      else {
        throw new Error(`Cannot cast from ${ast.argument.type.tag} to ${ast.type.tag}.`);
      }
    }
    else if (ast.type.tag === "PointerType") {
      if (ast.argument.type.tag === "FunctionType") {
        // fn [...] r => [t]
        
        ast.tag = "NullCast";
      }
      else if (ast.argument.type.tag === "PointerType") {
        // [a] => [b]
        
        // For now who cares what the types are, assume the programmer knows
        // what they are doing.
        
        ast.tag = "NullCast";
      }
      else if (ast.argument.type.tag === "IntegerType" &&
               ast.argument.type.width === 64 &&
               ast.argument.type.signed === false) {
        // u64 => [t]
        
        ast.tag = "NullCast";
      }
      else {
        throw new Error(`Cannot cast from ${ast.argument.type.tag} to ${ast.type.tag}.`);
      }
    }
    else if (ast.type.tag === "IntegerType") {
      if (ast.argument.type.tag === "IntegerType" && ast.argument.type.signed === ast.type.signed) {
        // iXX => iYY
        // uXX => uYY
        
        if (ast.argument.type.width < ast.type.width) {
          ast.tag = "ExtendCast";
          ast.signed = ast.type.signed;
        }
        else {
          ast.tag = "NullCast";
        }
      }
      else if (ast.argument.type.tag === "IntegerType" && ast.argument.type.width === ast.type.width) {
        // iNN => uNN
        // uNN => iNN
        
        ast.tag = "NullCast";
      }
      else if (ast.type.width === 64 && ast.type.signed === false) {
        if (ast.argument.type.tag === "FunctionType") {
          // fn [...] r => u64
          
          ast.tag = "NullCast";
        }
        else if (ast.argument.type.tag === "PointerType") {
          // [t] => u64
          
          ast.tag = "NullCast";
        }
        else {
          throw new Error(`Cannot cast from ${ast.argument.type.tag} to ${ast.type.tag}.`);
        }
      }
      else if (ast.argument.type.tag === "BooleanType") {
        // boolean => uNN
        // boolean => iNN
        
        if (ast.type.width === 8) {
          ast.tag = "NullCast";
        }
        else {
          ast.tag = "ZeroExtendCast";
          ast.argument.type.width = 8;
        }
      }
      else {
        throw new Error(`Cannot cast from ${ast.argument.type.tag} to ${ast.type.tag}.`);
      }
    }
    else if (ast.type.tag === "BooleanType") {
      if (ast.argument.type.tag === "IntegerType") {
        // iNN => boolean
        // uNN => boolean
        
        ast.tag = "BooleanCast";
      }
      else {
        throw new Error(`Cannot cast from ${ast.argument.type.tag} to ${ast.type.tag}.`);
      }
    }
    else {
      throw new Error(`Cannot typecast to ${ast.type.tag}.`);
    }
  }
  else if (ast.tag === "TernaryExpression") {
    AnalyzeTypeInferencing(ast.condition);
    AnalyzeTypeInferencing(ast.consiquent);
    AnalyzeTypeInferencing(ast.alternative);
    
    ast.type = unify(ast.consiquent.type, ast.alternative.type);
    ast.ref  = (ast.consiquent.ref && ast.alternative.ref);
  }
  else if (ast.tag === "InfixExpression") {
    AnalyzeTypeInferencing(ast.a);
    AnalyzeTypeInferencing(ast.b);
    
    ast.type = unify(ast.a.type, ast.b.type);
    ast.ref  = false;
  }
  else if (ast.tag === "PrefixExpression") {
    AnalyzeTypeInferencing(ast.a);
    
    ast.type = ast.a.type;
    ast.ref  = false;
  }
  else if (ast.tag === "RefExpression") {
    AnalyzeTypeInferencing(ast.a);
    
    if (ast.a.type.tag === "PointerType") {
      ast.type = ast.a.type.target;
      ast.ref  = true;
    }
    else {
      throw new Error(`Cannot reference non pointer type.`);
    }
  }
  else if (ast.tag === "AddrExpression") {
    AnalyzeTypeInferencing(ast.location);
    
    if (ast.location.ref) {
      ast.type = { tag: "PointerType", target: ast.location.type };
      ast.ref  = false;
    }
    else {
      throw new Error(`Cannot get address of value, expected reference.`);
    }
  }
  else if (ast.tag === "LookupExpression") {
    if (ast.declaration.type != null) {
      ast.type = ast.declaration.type;
      ast.ref  = true;
    }
    else {
      throw new Error(`Invalid LookupExpression location ${ast.declaration.tag}.`);
    }
  }
  else if (ast.tag === "SetExpression") {
    AnalyzeTypeInferencing(ast.location);
    AnalyzeTypeInferencing(ast.value);
    
    
    if (ast.location.ref) {
      unify(ast.location.type, ast.value.type);
      
      ast.type = ast.location.type;
      ast.ref  = false;
    }
    else {
      throw new Error("Cannot assign to a value, expected reference.")
    }
  }
  else if (ast.tag === "FieldExpression") {
    AnalyzeTypeInferencing(ast.subject);
    
    let field;
    for (let f of ast.subject.type.fields) {
      if (f.name === ast.name) {
        field = f;
        break;
      }
    }
    
    if (field != null) {
      ast.field = field;
      ast.type  = field.type;
      ast.ref   = ast.subject.ref;
    }
    else {
      throw new Error(`Field does not exist on struct type ${ast.subject.type.name}.`);
    }
  }
  else if (ast.tag === "CallExpression") {
    AnalyzeTypeInferencing(ast.subject);
    for (let argument of ast.arguments) {
      AnalyzeTypeInferencing(argument);
    }
    
    ast.type = ast.subject.type.return;
    ast.ref  = false;
  }
  else if (ast.tag === "InitStructExpression") {
    for (let a of ast.arguments) {
      if (a.tag === "Keyval") AnalyzeTypeInferencing(a.v);
      else                    AnalyzeTypeInferencing(a);
    }
    
    ast.ref = false;
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
    if (ast.type == null) ast.type = { tag: "IntegerType", width: null, signed: (ast.value.isNegative() ? true : null) };
    ast.ref = false;
  }
  else if (ast.tag === "StringLiteral") {
    if (ast.type == null) ast.type = { tag: "PointerType", target: { tag: "IntegerType", width: 8, signed: true } };
    ast.ref = false;
  }
  else if (ast.tag === "BooleanLiteral") {
    if (ast.type == null) ast.type = { tag: "BooleanType" };
    ast.ref = false;
  }
  else if (ast.tag === "NullLiteral") {
    if (ast.type == null) ast.type = { tag: "PointerType", target: null };
    ast.ref = false;
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeTypeInferencing;
