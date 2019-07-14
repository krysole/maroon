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
  else if (ast.tag === "ArrayType") {
    Simplify(ast.type);
  }
  else if (ast.tag === "FunctionType") {
    for (let parameter of ast.parameters) {
      Simplify(parameter, context);
    }
    Simplify(ast.rtype, context);
  }
  else if (ast.tag === "PointerType") {
    Simplify(ast.element, context);
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
    Simplify(ast.rtype, { unit: context.unit, function: ast, scope: ast });
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
  else if (ast.tag === "ForStatement") {
    ast.conditions = ast.conditions.map(c => ConvertCondition(c));
    
    ast.parent = context.scope;
    ast.decls  = {};
    
    for (let v of ast.variables) {
      ast.decls[v.name] = v;
    }
    
    for (let v of ast.variables)  Simplify(v.value, { unit: context.unit, function: context.function, scope: ast });
    for (let c of ast.conditions) Simplify(c,       { unit: context.unit, function: context.function, scope: ast });
    for (let i of ast.increments) Simplify(i,       { unit: context.unit, function: context.function, scope: ast });
    Simplify(ast.body, { unit: context.unit, function: context.function, scope: ast })
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
    if (ast.argument.tag === "NullPtrLiteral" && ast.type.tag === "PointerType") {
      Object.transmute(ast, { tag: "NullPtrLiteral", type: ast.type });
      
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
  else if (ast.tag === "PtrExpression") {
    Simplify(ast.location, context);
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
  else if (ast.tag === "SubscriptExpression") {
    Simplify(ast.subject, context);
    Simplify(ast.index, context);
  }
  else if (ast.tag === "DereferenceExpression") {
    Simplify(ast.subject, context);
  }
  else if (ast.tag === "CallExpression") {
    Simplify(ast.subject, context);
    
    if (ast.subject.tag === "PointerType") {
      if (ast.arguments.length === 0) {
        Object.transmute(ast, { tag: "NullPtrLiteral", type: ast.subject });
        
        Simplify(ast, context);
      }
      else if (ast.arguments.length === 1) {
        Object.transmute(ast, { tag: "PtrExpression", location: ast.arguments[0], type: ast.subject });
        
        Simplify(ast, context);
      }
      else {
        throw new Error("ptr primitive must have no arguments or a location argument");
      }
    }
    else if (ast.subject.tag === "StructType") {
      Object.transmute(ast, { tag: "InitStructExpression", type: ast.subject, arguments: ast.arguments });
      
      Simplify(ast, context);
    }
    else if (ast.subject.tag === "ArrayType") {
      Object.transmute(ast, { tag: "InitArrayExpression", type: ast.subject, arguments: ast.arguments });
      
      Simplify(ast, context);
    }
    else if (ast.subject.tag === "IntegerType") {
      if (ast.arguments.length !== 1) {
        throw new Error("Typecast to integer expects a single argument.");
      }
      
      Object.transmute(ast, { tag: "TypecastExpression", type: ast.subject, argument: ast.arguments[0] });
      
      Simplify(ast, context);
    }
    else if (ast.subject.tag.match(/Type/)) {
      throw new Error("Cannot simplify call with type subject.");
    }
    else {
      for (let argument of ast.arguments) {
        Simplify(argument, context);
      }
    }
  }
  else if (ast.tag === "SpecExpression") {
    Simplify(ast.subject, context);
    
    if (ast.subject.tag === "PointerType") {
      if (ast.arguments.length !== 1) throw new Error(`Pointer specialization expected exactly one parameter.`);
      
      Simplify(ast.arguments[0], context);
      
      if (!ast.arguments[0].tag.match(/Type/)) throw new Error(`Cannot specialize pointer type over non type parameter.`);
      
      Object.transmute(ast, { tag: "PointerType", element: ast.arguments[0] });
      
      Simplify(ast);
    }
    else if (ast.subject.tag === "ArrayType") {
      for (let a of ast.arguments) {
        Simplify(a, context);
      }
      
      if (ast.arguments.length === 1 && ast.arguments[0].tag.match(/type/)) {
        Object.transmute(ast, { tag: "ArrayType", element: ast.arguments[0], count: ast.subject.count });
        
        Simplify(ast, context);
      }
      else if (ast.arguments.length === 1 && ast.arguments[0].tag === "IntegerLiteral") {
        Object.transmute(ast, { tag: "ArrayType", element: ast.subject.type, count: ast.arguments[0].value.toNumber() });
        
        Simplify(ast, context);
      }
      else if (ast.arguments.length === 2 &&
               ast.arguments[0].tag.match(/Type/) &&
               ast.arguments[1].tag === "IntegerLiteral") {
        Object.transmute(ast, { tag: "ArrayType", element: ast.arguments[0], count: ast.arguments[1].value.toNumber() });
        
        Simplify(ast, context);
      }
      else {
        throw new Error("Invalid specialization parameters for array type.");
      }
    }
    else if (ast.subject.tag.match(/Type/)) {
      throw new Error(`Could not specialize non parametric type ${ast.subject}.`);
    }
    else {
      throw new Error(`Cannot specialize non type ast node ${ast.subject.type}.`);
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
  else if (ast.tag === "InitArrayExpression") {
    Simplify(ast.type, context);
    
    for (let a of ast.arguments) {
      Simplify(a, context);
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
  }
  else if (ast.tag === "StringLiteral") {
  }
  else if (ast.tag === "BooleanLiteral") {
  }
  else if (ast.tag === "NullPtrLiteral") {
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
