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
  if      (type.tag === "StructType")   return type.align;
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else                                  throw new Error(`Invalid field type ${type.tag}.`);
}

function sizeof(type) {
  if      (type.tag === "StructType")   return type.size;
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else                                  throw new Error(`Invalid field type ${type.tag}.`);
}


function AnalyzeStructLayout(ast, path) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    Symtab.each(ast, false, decl => AnalyzeStructLayout(decl, []));
  }
  
  
  else if (ast.tag === "StructType") {
    if (path.includes(ast)) throw new Error(`Struct definition cycle detected: ${path}.`);
    else                    path.push(ast);
    
    ast.align = 0;
    ast.size  = 0;
    
    for (let field of ast.fields) {
      AnalyzeStructLayout(field.type);
      
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
  
  
  else if (ast.tag === "VariableDeclaration") {
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
  }
  
  
  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};


module.exports = AnalyzeStructLayout;
