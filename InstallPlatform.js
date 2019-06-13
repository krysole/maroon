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


let InstallPlatform = module.exports = {
  
  install(symtab) {
    Symtab.define(symtab, "halts", { tag: "HaltType" });
    Symtab.define(symtab, "void",  { tag: "VoidType" });
    
    Symtab.define(symtab, "i8",  { tag: "IntegerType", width:  8, signed: true, ref: false });
    Symtab.define(symtab, "i16", { tag: "IntegerType", width: 16, signed: true, ref: false });
    Symtab.define(symtab, "i32", { tag: "IntegerType", width: 32, signed: true, ref: false });
    Symtab.define(symtab, "i64", { tag: "IntegerType", width: 64, signed: true, ref: false });
    
    Symtab.define(symtab, "u8",  { tag: "IntegerType", width:  8, signed: false, ref: false });
    Symtab.define(symtab, "u16", { tag: "IntegerType", width: 16, signed: false, ref: false });
    Symtab.define(symtab, "u32", { tag: "IntegerType", width: 32, signed: false, ref: false });
    Symtab.define(symtab, "u64", { tag: "IntegerType", width: 64, signed: false, ref: false });
    
    
    Symtab.define(symtab, "ref",  { tag: "Primitive", name: "ref" });
    Symtab.define(symtab, "addr", { tag: "Primitive", name: "addr" });
  },
  
}
