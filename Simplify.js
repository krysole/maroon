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


function Simplify(ast, context) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, decl => Simplify(decl, { unit: ast, function: null, scope: ast }));
  }
  
  
  else if (ast.tag === "StructType") {
    for (let field of ast.fields) {
      Simplify(field, context);
    }
  }
  else if (ast.tag === "FunctionType") {
    for (let parameter of ast.parameters) {
      Simplify(parameter, context);
    }
    Simplify(ast.return, context);
  }
  else if (ast.tag === "PointerType") {
    Simplify(ast.target, context);
  }
  else if (ast.tag === "IntegerType") {
  }
  else if (ast.tag === "BooleanType") {
  }
  else if (ast.tag === "HaltType") {
  }
  else if (ast.tag === "VoidType") {
  }
  
  
  else if (ast.tag === "Primitive") {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    Simplify(ast.value, context);
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    ast.parent = context.scope;
    ast.decls  = {};
    
    for (let parameter of ast.parameters) {
      ast.decls[parameter.name] = parameter;
    }
    
    for (let parameter of ast.parameters) {
      Simplify(parameter, { unit: context.unit, function: ast, scope: ast });
    }
    Simplify(ast.return, { unit: context.unit, function: ast, scope: ast });
    Simplify(ast.body, { unit: context.unit, function: ast, scope: ast });
  }
  
  
  else if (ast.tag === "Parameter") {
    Simplify(ast.type, context);
  }
  
  
  else if (ast.tag === "Field") {
    Simplify(ast.type, context);
  }
  
  
  else if (ast.tag === "Block") {
    ast.parent = context.scope;
    ast.decls  = {};
    
    for (let statement of ast.statements) {
      if (statement.tag === "LetStatement") {
        for (let variable of statement.variables) {
          ast.decls[variable.name] = variable;
        }
      }
    }
    
    for (let statement of ast.statements) {
      Simplify(statement, { unit: context.unit, function: context.function, scope: ast });
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) Simplify(variable.value, context);
    }
  }
  else if (ast.tag === "IfStatement") {
    ast.condition = ConvertCondition(ast.condition);
    
    if (ast.negated) {
      ast.condition = { tag: "NotCondition", a: ast.condition };
    }
    
    Simplify(ast.condition, context);
    Simplify(ast.consiquent, context);
    if (ast.alternative != null) Simplify(ast.alternative, context);
  }
  else if (ast.tag === "OnceStatement") {
    Simplify(ast.body, context);
  }
  else if (ast.tag === "ForeverStatement") {
    Simplify(ast.body, context);
  }
  else if (ast.tag === "WhileStatement") {
    ast.condition = ConvertCondition(ast.condition);
    
    if (ast.negated) {
      ast.condition = { tag: "NotCondition", a: ast.condition };
    }
    
    Simplify(ast.condition, context);
    Simplify(ast.body, context);
  }
  else if (ast.tag === "DoWhileStatement") {
    ast.condition = ConvertCondition(ast.condition);
    
    if (ast.negated) {
      ast.condition = { tag: "NotCondition", a: ast.condition };
    }
    
    Simplify(ast.body, context);
    Simplify(ast.condition, context);
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    ast.function = context.function;
    
    Simplify(ast.expression, context);
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    Simplify(ast.expression, context);
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    ast.a = ConvertCondition(ast.a);
    ast.b = ConvertCondition(ast.b);
    
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "XorCondition") {
    // XOR does not convert arguments into conditions, they remain values.
    
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "AndCondition") {
    ast.a = ConvertCondition(ast.a);
    ast.b = ConvertCondition(ast.b);

    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "NotCondition") {
    ast.a = ConvertCondition(ast.a);

    Simplify(ast.a, context);
  }
  else if (ast.tag === "ComparisonCondition") {
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "ValueCondition") {
    Simplify(ast.value, context);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    ast.condition = ConvertCondition(ast.condition);
    
    Simplify(ast.condition, context);
  }
  else if (ast.tag === "OrExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "XorExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "AndExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "NotExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "TypecastExpression") {
    Simplify(ast.argument, context);
    Simplify(ast.type, context);
    
    if (ast.argument.tag === "IntegerLiteral" && ast.type.tag === "IntegerType") {
      Object.transmute(ast, { tag: "IntegerLiteral", value: ast.argument.value, type: ast.type });
      
      Simplify(ast, context);
      
      return;
    }
    if (ast.argument.tag === "NullLiteral" && ast.type.tag === "PointerType") {
      Object.transmute(ast, { tag: "NullLiteral", type: ast.type });
      
      Simplify(ast, context);
      
      return;
    }
  }
  else if (ast.tag === "TernaryExpression") {
    ast.condition = ConvertCondition(ast.condition);
    
    Simplify(ast.condition, context);
    Simplify(ast.consiquent, context);
    Simplify(ast.alternative, context);
  }
  else if (ast.tag === "ComparisonExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "InfixExpression") {
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "PrefixExpression") {
    Simplify(ast.a, context);
    
    if (ast.o === "+" && ast.a.tag === "IntegerLiteral") {
      Object.transmute(ast, ast.a);
    }
    else if (ast.o === "-" && ast.a.tag === "IntegerLiteral") {
      Object.transmute(ast, ast.a);
      
      ast.value = ast.value.negated();
    }
  }
  else if (ast.tag === "RefExpression") {
    if (ast.a.tag === "PointerType") {
      Object.transmute(ast, ast.a);
      
      Simplify(ast, context);
    }
    else if (ast.a.tag.match(/Type/)) {
      throw new Error(`Cannot simplify ref expression over non pointer type.`);
    }
    else {
      Simplify(ast.a, context);
    }
  }
  else if (ast.tag === "AddrExpression") {
    Simplify(ast.location, context);
    
    if (ast.location.tag.match(/Type/)) {
      Object.transmute(ast, { tag: "PointerType", target: ast.location });
      
      Simplify(ast);
    }
  }
  else if (ast.tag === "LookupExpression") {
    ast.declaration = Symtab.lookup(context.scope, ast.name);
    
    if (ast.declaration.tag.match(/Type$/)) {
      let decl = ast.declaration;
      Object.transmute(ast, decl);
      ast.orig = decl;
    }
    else if (ast.declaration.tag.match(/Primitive/)) {
      let decl = ast.declaration;
      Object.transmute(ast, decl);
      ast.orig = decl;
    }
  }
  else if (ast.tag === "SetExpression") {
    Simplify(ast.location, context);
    Simplify(ast.value,    context);
  }
  else if (ast.tag === "FieldExpression") {
    Simplify(ast.subject, context);
  }
  else if (ast.tag === "CallExpression") {
    Simplify(ast.subject, context);
    
    if (ast.subject.tag === "Primitive" && ast.subject.name === "ref") {
      if (ast.arguments.length !== 1) {
        throw new Error("ref primitive must have one argument");
      }
      
      Object.transmute(ast, { tag: "RefExpression", a: ast.arguments[0] });
      
      Simplify(ast, context);
    }
    else if (ast.subject.tag === "Primitive" && ast.subject.name === "addr") {
      if (ast.arguments.length !== 1) {
        throw new Error("addr primitive must have one argument");
      }
      
      Object.transmute(ast, { tag: "AddrExpression", location: ast.arguments[0] });
      
      Simplify(ast, context);
    }
    else if (ast.subject.tag === "StructType") {
      Object.transmute(ast, { tag: "InitStructExpression", type: ast.subject, arguments: ast.arguments });
      
      Simplify(ast, context);
    }
    else {
      for (let argument of ast.arguments) {
        Simplify(argument, context);
      }
    }
  }
  else if (ast.tag === "InitStructExpression") {
    Simplify(ast.type, context);
    
    if (ast.arguments.length === 0) {
    }
    else if (ast.arguments[0].tag === "Keyval") {
      for (let kv of ast.arguments) {
        if (kv.tag !== "Keyval") throw new Error("All arguments must be either keyvals or regular arguments.");
        
        Simplify(kv.value, context);
      }
    }
    else {
      for (let a of ast.arguments) {
        if (a.tag === "Keyval") throw new Error("All arguments must be either keyvals or regular arguments.");
        
        Simplify(a, context);
      }
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
  }
  else if (ast.tag === "StringLiteral") {
  }
  else if (ast.tag === "BooleanLiteral") {
  }
  else if (ast.tag === "NullLiteral") {
    Simplify(ast.type);
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


function ConvertCondition(ast) {
  if (ast.tag.match(/Condition$/)) {
    return ast;
  }
  else if (ast.tag === "OrExpression") {
    return { tag: "OrCondition", a: ast.a, b: ast.b };
  }
  else if (ast.tag === "XorExpression") {
    return { tag: "XorCondition", a: ast.a, b: ast.b };
  }
  else if (ast.tag === "AndExpression") {
    return { tag: "AndCondition", a: ast.a, b: ast.b };
  }
  else if (ast.tag === "NotExpression") {
    return { tag: "NotCondition", a: ast.a };
  }
  else if (ast.tag === "ComparisonExpression") {
    return { tag: "ComparisonCondition", o: ast.o, a: ast.a, b: ast.b };
  }
  else {
    return { tag: "ValueCondition", value: ast };
  }
};


module.exports = Simplify;
