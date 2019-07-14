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


function unify(a, b) {
  if (a.tag === "StructType" && b.tag === "StructType") {
    if (a.name !== b.name) throw new Error("Incompatible struct types.");
    
    return a;
  }
  else if (a.tag === "ArrayType" && b.tag === "ArrayType") {
    unify(a.element, b.element);
    
    if (a.count !== b.count) throw new Error("Array count mismatch.");
    
    return a;
  }
  else if (a.tag === "FunctionType" && b.tag === "FunctionType") {
    if (a.parameters.length !== b.parameters.length) throw new Error("Function arity mismatch.");
    for (let i = 0, c = a.parameters.length; i < c; i++) {
      let pa = a.parameters[i];
      let pb = b.parameters[i];
      unify(pa.type, pb.type);
    }
    unify(a.rtype, b.rtype);
    
    return a;
  }
  else if (a.tag === "PointerType" && b.tag === "PointerType") {
    unify(a.element, b.element);
    
    return a;
  }
  else if (a.tag === "IntegerType" && b.tag === "IntegerType") {
    let result = { tag: "IntegerType", width: null, signed: null };
    
    if      (a.width === b.width)                  result.width = a.width;
    else if (a.width != null && b.width == null)   result.width = a.width;
    else if (a.width == null && b.width != null)   result.width = b.width;
    else                                           throw new Error("Incompatible integer type widths.");
    if      (a.signed === b.signed)                result.signed = a.signed;
    else if (a.signed != null && b.signed == null) result.signed = a.signed;
    else if (a.signed == null && b.signed != null) result.signed = b.signed;
    else                                           throw new Error("Incompatible integer type signedness.");
    
    return result;
  }
  else if (a.tag === "BooleanType" && b.tag === "BooleanType") {
    return a;
  }
  else if (a.tag === "HaltType" && b.tag === "HaltType") {
    return a;
  }
  else if (a.tag === "VoidType" && b.tag === "VoidType") {
    return a;
  }
  else {
    throw new Error("Incompatable type tag.");
  }
};


module.exports = unify;
