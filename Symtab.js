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

let inspect = require("util").inspect;


let Symtab = module.exports = {
  
  lookup(symtab, name) {
    if (typeof symtab.decls !== "object") throw new Error(`Expected symtab ast node, passed ${inspect(symtab)}.`);
    
    let path = name.split(".");
    if (path.length === 0) {
      throw new Error(`Symtab lookup failed on bad symbol ${JSON.stringify(name)}.`);
    }
    else if (path.length === 1) {
      if (Object.hasOwnProperty(symtab.decls, path[0])) {
        return symtab.decls[path[0]];
      }
      else if (symtab.parent != null) {
        return Symtab.lookup(symtab.parent, name);
      }
      else {
        throw new Error(`Symtab lookup failed on symbol ${JSON.stringify(name)}.`);
      }
    }
    else {
      return Symtab.lookup(Symtab.lookup(symtab, path[0]), path.slice(1).join("."));
    }
  },
  
  define(symtab, name, value) {
    if (typeof symtab.decls !== "object") throw new Error(`Expected symtab ast node, passed ${inspect(symtab)}.`);
    
    let path = name.split(".");
    if (path.length === 0) {
      throw new Error(`Symtab define failed on bad symbol ${JSON.stringify(name)}.`);
    }
    else if (path.length === 1) {
      symtab.decls[path[0]] = value;
      
      return value;
    }
    else {
      return Symtab.define(Symtab.lookup(symtab, path[0]), path.slice(1).join("."), value);
    }
  },
  
  exists(symtab, name) {
    if (typeof symtab.decls !== "object") throw new Error(`Expected symtab ast node, passed ${inspect(symtab)}.`);
    
    let path = name.split(".");
    if (path.length === 0) {
      throw new Error(`Symtab lookup failed on bad symbol ${JSON.stringify(name)}.`);
    }
    else if (path.length === 1) {
      if (Object.hasOwnProperty(symtab.decls, path[0])) {
        return true
      }
      else if (symtab.parent != null) {
        return Symtab.exists(symtab.parent, name);
      }
      else {
        throw false;
      }
    }
    else {
      return Symtab.lookup(Symtab.lookup(symtab, path[0]), path.slice(1).join("."));
    }
  },
  
  each(symtab, visitInheritedFlag, handler) {
    if (typeof symtab.decls !== "object") throw new Error(`Expected symtab ast node, passed ${inspect(symtab)}.`);
    
    for (let name of Object.getOwnPropertyNames(symtab.decls)) {
      if (typeof handler === "function") {
        handler(symtab.decls[name]);
      }
      else if (typeof handler === "object") {
        let decl = symtab.decls[name];
        if (typeof handler[decl.tag] === "function") {
          handler[decl.tag](decl);
        }
        else if (typeof handler["default"] === "function") {
          handler["default"](decl);
        }
        else {
          throw new Error();
        }
      }
      else {
        throw new Error();
      }
    }
    
    if (visitInheritedFlag && symtab.parent != null) {
      Symtab.each(symtab.parent, visitInheritedFlag, handler);
    }
  },
  
};
