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
  
  
  else if (ast.tag === "Parameter") {
    Simplify(ast.type, context);
  }
  
  
  else if (ast.tag === "FunctionType") {
    for (let parameter of ast.parameters) {
      Simplify(ast.parameter, context);
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
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) Simplify(variable.value, context);
    }
  }
  else if (ast.tag === "IfStatement") {
    ast.condition = ConvertCondition(ast.condition);
    
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
    
    Simplify(ast.condition, context);
    Simplify(ast.body, context);
  }
  else if (ast.tag === "DoWhileStatement") {
    ast.condition = ConvertCondition(ast.condition);
    
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
  
  
  else if (ast.tag === "LogicalOrCondition") {
    ast.a = ConvertCondition(ast.a);
    ast.b = ConvertCondition(ast.b);
    
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "LogicalXorCondition") {
    ast.a = ConvertCondition(ast.a);
    ast.b = ConvertCondition(ast.b);
    
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "LogicalAndCondition") {
    ast.a = ConvertCondition(ast.a);
    ast.b = ConvertCondition(ast.b);
    
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "LogicalNotCondition") {
    ast.a = ConvertCondition(ast.a);
    
    Simplify(ast.a, context);
  }
  else if (ast.tag === "ValueCondition") {
    Simplify(ast.value, context);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    ast.condition = ConvertCondition(ast.condition);
    
    Simplify(ast.condition, context);
  }
  else if (ast.tag === "LogicalOrExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "LogicalXorExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "LogicalAndExpression") {
    Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
    
    Simplify(ast, context);
  }
  else if (ast.tag === "LogicalNotExpression") {
    if (ast.a.tag === "LogicalNotExpression") {
      Object.transmute(ast, ast.a.a);
      
      Simplify(ast, context);
    }
    else if (ast.a.tag.match(/Logical/)) {
      Object.transmute(ast, { tag: "ConditionExpression", condition: ConvertCondition(ast) });
      
      Simplify(ast, context);
    }
    else {
      Object.transmute(ast, { tag: "NotExpression", a: ast.a });
      
      Simplify(ast, context);
    }
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
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "InfixExpression") {
    Simplify(ast.a, context);
    Simplify(ast.b, context);
  }
  else if (ast.tag === "PrefixExpression") {
    Simplify(ast.a, context);
  }
  else if (ast.tag === "DerefExpression") {
    Simplify(ast.a, context);
  }
  else if (ast.tag === "AddrExpression") {
    Simplify(ast.a, context);
  }
  else if (ast.tag === "LookupExpression") {
    ast.declaration = Symtab.lookup(context.scope, ast.name);
    
    if (ast.declaration.tag.match(/Type$/)) {
      Object.transmute(ast, ast.declaration);
    }
  }
  else if (ast.tag === "SetExpression") {
    ast.declaration = Symtab.lookup(context.scope, ast.name);
    
    Simplify(ast.a);
  }
  else if (ast.tag === "LookupPropertyExpression") {
    Simplify(ast.subject, context);
  }
  else if (ast.tag === "SetPropertyExpression") {
    Simplify(ast.subject, context);
    Simplify(ast.argument, context);
  }
  else if (ast.tag === "CallExpression") {
    Simplify(ast.subject, context);
    for (let argument of ast.arguments) {
      Simplify(argument, context);
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
  else if (ast.tag === "LogicalOrExpression") {
    return { tag: "LogicalOrCondition", a: ast.a, b: ast.b };
  }
  else if (ast.tag === "LogicalXorExpression") {
    return { tag: "LogicalXorCondition", a: ast.a, b: ast.b };
  }
  else if (ast.tag === "LogicalAndExpression") {
    return { tag: "LogicalAndCondition", a: ast.a, b: ast.b };
  }
  else if (ast.tag === "LogicalNotExpression") {
    return { tag: "LogicalNotCondition", a: ast.a };
  }
  else if (ast.tag === "ComparisonExpression") {
    return { tag: "ComparisonCondition", o: ast.o, a: ast.a, b: ast.b };
  }
  else {
    return { tag: "ValueCondition", value: ast };
  }
};


module.exports = Simplify;
