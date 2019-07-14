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


function pad(offset, alignment) {
  return (alignment - (offset % alignment)) % alignment;
}

function align(type) {
  if      (type.tag === "StructType")   return (type.orig != null ? type.orig.align : type.align);
  else if (type.tag === "ArrayType")    return align(type.type);
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else if (type.tag === "HaltType")     throw new Error("HaltType does not have data alignment.");
  else if (type.tag === "VoidType")     throw new Error("VoidType does not have data alignment.");
  else                                  throw new Error("Invalid type.");
}

function sizeof(type) {
  if      (type.tag === "StructType")   return (type.orig != null ? type.orig.size : type.size);
  else if (type.tag === "ArrayType")    return type.count * sizeof(type.type);
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else if (type.tag === "HaltType")     throw new Error("HaltType does not have data size.");
  else if (type.tag === "VoidType")     throw new Error("VoidType does not have data size.");
  else                                  throw new Error("Invalid type.");
}


function AnalyzeFrameLayout(ast, context) {
  let preservedloffset;
  
  
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, decl => AnalyzeFrameLayout(decl, {}));
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Primitive") {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    context.fn      = ast;
    context.loffset = 0;
    context.lsize   = 0;
    context.psize   = 0;
    
    
    // [[Stack Frame Layout]]
    //     : stack parameters placed by caller
    //     : preserved rip
    // rbp : preserved rbp
    //     : preserved rbx
    //     : preserved register parameters
    //     : locals/temporaries
    //     : parameter window padding to 16 bytes
    // rsp : parameter window
    
    
    for (let i = 0, c = ast.parameters.length; i < c; i++) {
      let parameter = ast.parameters[i];
      if (i < 6) {
        parameter.loffset = context.loffset + pad(context.loffset, align(parameter.type)) + sizeof(parameter.type);
        context.loffset   = parameter.loffset;
        context.lsize     = Math.max(context.lsize, context.loffset);
      }
      else {
        let base      = 0;
        let preserved = 16;             // rbp and rip
        let size      = 8;              // size of register parameter in C ABI
        let params    = size * (i - 6); // previous stack parameters, not including register parameters
        
        parameter.loffset = base - preserved - size - params;
      }
    }
    
    
    AnalyzeFrameLayout(ast.body, context);
    
    
    ast.lsize = context.lsize + pad(context.lsize + context.psize, 16);
    ast.psize = context.psize;
    ast.fsize = ast.lsize + ast.psize;
  }
  
  
  else if (ast.tag === "Block") {
    preservedloffset = context.loffset;
    {
      for (let name in ast.decls) {
        let decl = ast.decls[name];

        decl.loffset    = context.loffset + pad(context.loffset, align(decl.type)) + sizeof(decl.type);
        context.loffset = decl.loffset;
        context.lsize   = Math.max(context.lsize, context.loffset);
      }

      for (let statement of ast.statements) {
        AnalyzeFrameLayout(statement, context);
      }
    }
    context.loffset = preservedloffset;
  }
  
  
  else if (ast.tag === "LabelStatement") {
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      preservedloffset = context.loffset;
      {
        if (variable.type.tag === "StructType" || variable.type.tag === "ArrayType") {
          // Provide a pointer temporary to the struct or array variable.
          let locationType = { tag: "PointerType", target: null };
          variable.addroffset = context.loffset + pad(context.loffset, align(locationType)) + sizeof(locationType);
          context.loffset     = variable.addroffset;
          context.lsize       = Math.max(context.lsize, context.loffset);
        }
        AnalyzeFrameLayout(variable.value, context);
      }
      context.loffset = preservedloffset;
    }
  }
  else if (ast.tag === "IfStatement") {
    AnalyzeFrameLayout(ast.condition, context);
    AnalyzeFrameLayout(ast.consiquent, context);
    AnalyzeFrameLayout(ast.alternative, context);
  }
  else if (ast.tag === "OnceStatement") {
    AnalyzeFrameLayout(ast.body, context);
  }
  else if (ast.tag === "ForeverStatement") {
    AnalyzeFrameLayout(ast.body, context);
  }
  else if (ast.tag === "WhileStatement") {
    AnalyzeFrameLayout(ast.condition, context);
    AnalyzeFrameLayout(ast.body, context);
  }
  else if (ast.tag === "DoWhileStatement") {
    AnalyzeFrameLayout(ast.body, context);
    AnalyzeFrameLayout(ast.condition, context);
  }
  else if (ast.tag === "ForStatement") {
    preservedloffset = context.loffset;
    {
      for (let name in ast.decls) {
        let decl = ast.decls[name];

        decl.loffset    = context.loffset + pad(context.loffset, align(decl.type)) + sizeof(decl.type);
        context.loffset = decl.loffset;
        context.lsize   = Math.max(context.lsize, context.loffset);
      }
      
      for (let variable of ast.variables) {
        preservedloffset = context.loffset;
        {
          if (variable.type.tag === "StructType" || variable.type.tag === "ArrayType") {
            // Provide a pointer temporary to the struct or array variable.
            let locationType = { tag: "PointerType", target: null };
            variable.addroffset = context.loffset + pad(context.loffset, align(locationType)) + sizeof(locationType);
            context.loffset     = variable.addroffset;
            context.lsize       = Math.max(context.lsize, context.loffset);
          }
          AnalyzeFrameLayout(variable.value, context);
        }
        context.loffset = preservedloffset;
      }
      for (let condition of ast.conditions) {
        AnalyzeFrameLayout(condition, context);
      }
      for (let increment of ast.increments) {
        AnalyzeFrameLayout(increment, context);
      }
      AnalyzeFrameLayout(ast.body, context);
    }
    context.loffset = preservedloffset;
  }
  else if (ast.tag === "BreakStatement") {
  }
  else if (ast.tag === "ContinueStatement") {
  }
  else if (ast.tag === "ReturnStatement") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.expression, context);
    }
    context.loffset = preservedloffset;
    
    // Actual function result is through register or indirect through register.
  }
  else if (ast.tag === "GotoStatement") {
  }
  else if (ast.tag === "ExpressionStatement") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.expression, context);
    }
    context.loffset = preservedloffset;
    
    // Ignore result once expression has finished executing.
  }
  else if (ast.tag === "EmptyStatement") {
  }
  
  
  else if (ast.tag === "OrCondition") {
    AnalyzeFrameLayout(ast.a, context);
    AnalyzeFrameLayout(ast.b, context);
    
    // No result, CPU flag used.
  }
  else if (ast.tag === "XorCondition") {
    AnalyzeFrameLayout(ast.a, context);
    AnalyzeFrameLayout(ast.b, context);
    
    // No result, CPU flag used.
  }
  else if (ast.tag === "AndCondition") {
    AnalyzeFrameLayout(ast.a, context);
    AnalyzeFrameLayout(ast.b, context);
    
    // No result, CPU flag used.
  }
  else if (ast.tag === "NotCondition") {
    AnalyzeFrameLayout(ast.a, context);
    
    // No result, CPU flag used.
  }
  else if (ast.tag === "ComparisonCondition") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.a, context);
      AnalyzeFrameLayout(ast.b, context);
    }
    context.loffset = preservedloffset;
    
    // No result, CPU flag used.
  }
  else if (ast.tag === "ValueCondition") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.value, context);
    }
    context.loffset = preservedloffset;
    
    // No result, CPU flag used.
  }
  
  
  else if (ast.tag === "NullCast") {
    AnalyzeFrameLayout(ast.argument, context);
    
    ast.loffset = ast.argument.loffset;
  }
  else if (ast.tag === "ExtendCast") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.argument, context);
    }
    context.loffset = preservedloffset;
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "BooleanCast") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.argument, context);
    }
    context.loffset = preservedloffset;
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    AnalyzeFrameLayout(ast.condition, context);
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset)
  }
  else if (ast.tag === "TernaryExpression") {
    AnalyzeFrameLayout(ast.condition, context);
    
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.consiquent, context);
    }
    context.loffset = preservedloffset;
    
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.alternative, context);
    }
    context.loffset = preservedloffset;
    
    // Technically this is redundant to the above, but it makes the code easier
    // to understand and the space will be colocated with the result from either
    // branch, since they also have the same type.
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "InfixExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.a, context);
      AnalyzeFrameLayout(ast.b, context);
    }
    context.loffset = preservedloffset;
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "PrefixExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.a, context);
    }
    context.loffset = preservedloffset;
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "RefExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.a, context);
    }
    context.loffset = preservedloffset;
    
    if (ast.addr) {
      // Just leave the address in a working register.
    }
    else {
      ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
      context.loffset = ast.loffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
    }
  }
  else if (ast.tag === "PtrExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.location, context);
    }
    context.loffset = preservedloffset;
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "LookupExpression") {
    if (ast.addr) {
      // Just leave the address in a working register.
    }
    else {
      ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
      context.loffset = ast.loffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
    }
  }
  else if (ast.tag === "SetExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.location, context);
      ast.addroffset  = context.loffset + pad(context.loffset, 8) + 8;
      context.loffset = ast.addroffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
      AnalyzeFrameLayout(ast.value, context);
    }
    context.loffset = preservedloffset;
    
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "FieldExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.subject, context);
    }
    context.loffset = preservedloffset;
    
    if (ast.addr) {
      // Just leave the address in a working register.
    }
    else {
      ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
      context.loffset = ast.loffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
    }
  }
  else if (ast.tag === "SubscriptExpression") {
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.subject, context);
      ast.addroffset  = context.loffset + pad(context.loffset, 8) + 8;
      context.loffset = ast.addroffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
      AnalyzeFrameLayout(ast.index, context);
    }
    context.loffset = preservedloffset;
    
    if (ast.addr) {
      // Just leave the address in a working register.
    }
    else {
      ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
      context.loffset = ast.loffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
    }
  }
  else if (ast.tag === "CallExpression") {
    if (ast.subject.type.tag !== "FunctionType") {
      throw new Error("Cannot analyze frame layout for call to non function.");
    }
    
    preservedloffset = context.loffset;
    {
      AnalyzeFrameLayout(ast.subject, context);
      for (let a of ast.arguments) {
        AnalyzeFrameLayout(a, context);
      }
    }
    context.loffset = preservedloffset;

    if (ast.type.tag !== "HaltType" && ast.type.tag !== "VoidType") {
      ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
      context.loffset = ast.loffset;
      context.lsize   = Math.max(context.lsize, context.loffset);
    }

    context.psize = Math.max(context.psize, 8 * (ast.arguments.length - 6));
  }
  else if (ast.tag === "InitStructExpression") {
    if (ast.arguments.length === 0) {
    }
    else if (ast.arguments[0].tag === "Keyval") {
      for (let argument of ast.arguments) {
        preservedloffset = context.loffset;
        {
          AnalyzeFrameLayout(argument.value, context);
        }
        context.loffset = preservedloffset;
      }
    }
    else {
      for (let argument of ast.arguments) {
        preservedloffset = context.loffset;
        {
          AnalyzeFrameLayout(argument, context);
        }
        context.loffset = preservedloffset;
      }
    }
  }
  else if (ast.tag === "InitArrayExpression") {
    for (let argument of ast.arguments) {
      preservedloffset = context.loffset;
      {
        AnalyzeFrameLayout(argument, context);
      }
      context.loffset = preservedloffset;
    }
  }


  else if (ast.tag === "IntegerLiteral") {
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "StringLiteral") {
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "BooleanLiteral") {
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  else if (ast.tag === "NullPtrLiteral") {
    ast.loffset     = context.loffset + pad(context.loffset, align(ast.type)) + sizeof(ast.type);
    context.loffset = ast.loffset;
    context.lsize   = Math.max(context.lsize, context.loffset);
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
}

module.exports = AnalyzeFrameLayout;
