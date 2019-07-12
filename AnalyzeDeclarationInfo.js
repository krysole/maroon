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


function pad(offset, alignment) {
  return (alignment - (offset % alignment)) % alignment;
}

function align(type) {
  if      (type.tag === "StructType")   return (type.orig != null ? type.orig.align : type.align);
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else                                  throw new Error(`Invalid field type ${type.tag}.`);
}

function sizeof(type) {
  if      (type.tag === "StructType")   return (type.orig != null ? type.orig.size : type.size);
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else                                  throw new Error(`Invalid field type ${type.tag}.`);
}


function AnalyzeDeclarationInfo(ast, path) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, AnalyzeDeclarationInfo);
  }
  
  
  else if (ast.tag === "StructType") {
    if      (path == null)        path = [ast];
    else if (!path.includes(ast)) path.push(ast);
    else                          throw new Error(`Struct definition cycle detected: ${path}.`);
    
    ast.align = 0;
    ast.size  = 0;
    
    for (let field of ast.fields) {
      AnalyzeDeclarationInfo(field.type, path);
      
      field.offset = ast.size + pad(ast.size, align(field.type));
      
      ast.align = Math.max(ast.align, align(field.type));
      ast.size  = field.offset + sizeof(field.type);
    }
    ast.size = ast.size + pad(ast.size, ast.align);
    
    for (let i = 0, c = ast.fields.length - 1; i < c; i++) {
      ast.fields[i].space = align(ast.fields[i + 1].type);
    }
    ast.fields[ast.fields.length - 1].space = ast.align;
  }
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Primitive") {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    ast.kind = "GlobalVariable";
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    ast.type = { tag: "FunctionType", parameters: ast.parameters, vaparam: ast.vaparam, rtype: ast.rtype };
    
    for (let p of ast.parameters) {
      p.kind = "Parameter";
    }
    
    if (ast.body != null) ast.kind = "GlobalFunction";
    else                  ast.kind = "ExternalFunction";
    
    AnalyzeDeclarationInfo(ast.body);
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
  else if (ast.tag === "PtrExpression") {
  }
  else if (ast.tag === "LookupExpression") {
  }
  else if (ast.tag === "SetExpression") {
    AnalyzeDeclarationInfo(ast.a);
  }
  else if (ast.tag === "FieldExpression") {
    AnalyzeDeclarationInfo(ast.subject);
  }
  else if (ast.tag === "CallExpression") {
    AnalyzeDeclarationInfo(ast.subject);
    for (let argument of ast.arguments) {
      AnalyzeDeclarationInfo(argument);
    }
  }
  else if (ast.tag === "InitStructExpression") {
    if (ast.arguments.length === 0) {
    }
    else if (ast.arguments[0].tag === "Keyval") {
      for (let kv of ast.arguments) {
        AnalyzeDeclarationInfo(kv.value);
      }
    }
    else {
      for (let a of ast.arguments) {
        AnalyzeDeclarationInfo(a);
      }
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
  }
  else if (ast.tag === "StringLiteral") {
  }
  else if (ast.tag === "BooleanLiteral") {
  }
  else if (ast.tag === "NullPtrLiteral") {
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeDeclarationInfo;
