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


let InstallSourceUnit = module.exports = {
  
  install(symtab, ast) {
    for (let declaration of ast.declarations) {
      let handler = InstallSourceUnit["install" + declaration.tag];
      if (handler != null) {
        handler(symtab, declaration);
      }
      else {
        throw new Error(`Unhandled source unit declaration ${declaration.tag}.`);
      }
    }
  },
  
  installStructDeclaration(symtab, ast) {
    ast.tag = "StructType";
    
    Symtab.define(symtab, ast.name, ast);
  },
  
  installLetDeclaration(symtab, ast) {
    for (let variable of ast.variables) {
      variable.tag = "VariableDeclaration";
      
      Symtab.define(symtab, variable.name, variable);
    }
  },
  
  installFunctionDeclaration(symtab, ast) {
    Symtab.define(symtab, ast.name, ast);
  },
  
};
