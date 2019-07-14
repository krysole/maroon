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


function width(type) {
  if      (type.tag === "StructType")   throw new Error("StructType does not have a data word width.");
  else if (type.tag === "ArrayType")    throw new Error("ArrayType does not have a data word width.");
  else if (type.tag === "FunctionType") return 64;
  else if (type.tag === "PointerType")  return 64;
  else if (type.tag === "IntegerType")  return type.width;
  else if (type.tag === "BooleanType")  return 8;
  else if (type.tag === "HaltType")     throw new Error("HaltType does not have data word width.");
  else if (type.tag === "VoidType")     throw new Error("VoidType does not have data word width.");
  else                                  throw new Error("Expected word type.");
};

function size(type) {
  if      (type.tag === "StructType")   return (type.orig != null ? type.orig.size : type.size);
  else if (type.tag === "ArrayType")    return type.count * size(type.type);
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else if (type.tag === "HaltType")     throw new Error("HaltType does not have data size.");
  else if (type.tag === "VoidType")     throw new Error("VoidType does not have data size.");
  else                                  throw new Error("Invalid type.");
}

function align(type) {
  if      (type.tag === "StructType")   return type.align;
  else if (type.tag === "ArrayType")    return align(type.type);
  else if (type.tag === "FunctionType") return 8;
  else if (type.tag === "PointerType")  return 8;
  else if (type.tag === "IntegerType")  return type.width / 8;
  else if (type.tag === "BooleanType")  return 1;
  else                                  throw new Error();
}

function data(w) {
  if (w ===  8) return "byte";
  else if (w === 16) return "word";
  else if (w === 32) return "long";
  else if (w === 64) return "quad";
  else               throw new Error();
}

function affix(w) {
  if      (w ===  8) return "b"; // byte
  else if (w === 16) return "w"; // word
  else if (w === 32) return "l"; // long
  else if (w === 64) return "q"; // quad
  else               throw new Error();
};

function reg(w, r) {
  if (w === 8) {
    if (r === "rax") return   "%al";
    if (r === "rbx") return   "%bl";
    if (r === "rcx") return   "%cl";
    if (r === "rdx") return   "%dl";
    
    if (r === "rdi") return  "%dil";
    if (r === "rsi") return  "%sil";
    if (r === "rbp") return  "%bpl";
    if (r === "rsp") return  "%spl";
    
    if (r ===  "r8") return  "%r8b";
    if (r ===  "r9") return  "%r9b";
    if (r === "r10") return "%r10b";
    if (r === "r11") return "%r11b";
    
    if (r === "r12") return "%r12b";
    if (r === "r13") return "%r13b";
    if (r === "r14") return "%r14b";
    if (r === "r15") return "%r15b";
  }
  else if (w === 16) {
    if (r === "rax") return   "%ax";
    if (r === "rbx") return   "%bx";
    if (r === "rcx") return   "%cx";
    if (r === "rdx") return   "%dx";
    
    if (r === "rdi") return   "%di";
    if (r === "rsi") return   "%si";
    if (r === "rbp") return   "%bp";
    if (r === "rsp") return   "%sp";
    
    if (r ===  "r8") return  "%r8w";
    if (r ===  "r9") return  "%r9w";
    if (r === "r10") return "%r10w";
    if (r === "r11") return "%r11w";
    
    if (r === "r12") return "%r12w";
    if (r === "r13") return "%r13w";
    if (r === "r14") return "%r14w";
    if (r === "r15") return "%r15w";
  }
  else if (w === 32) {
    if (r === "rax") return  "%eax";
    if (r === "rbx") return  "%ebx";
    if (r === "rcx") return  "%ecx";
    if (r === "rdx") return  "%edx";
    
    if (r === "rdi") return  "%edi";
    if (r === "rsi") return  "%esi";
    if (r === "rbp") return  "%ebp";
    if (r === "rsp") return  "%esp";
    
    if (r ===  "r8") return  "%r8d";
    if (r ===  "r9") return  "%r9d";
    if (r === "r10") return "%r10d";
    if (r === "r11") return "%r11d";
    
    if (r === "r12") return "%r12d";
    if (r === "r13") return "%r13d";
    if (r === "r14") return "%r14d";
    if (r === "r15") return "%r15d";
  }
  else if (w === 64) {
    if (r === "rax") return  "%rax";
    if (r === "rbx") return  "%rbx";
    if (r === "rcx") return  "%rcx";
    if (r === "rdx") return  "%rdx";
    
    if (r === "rdi") return  "%rdi";
    if (r === "rsi") return  "%rsi";
    if (r === "rbp") return  "%rbp";
    if (r === "rsp") return  "%rsp";
    
    if (r ===  "r8") return   "%r8";
    if (r ===  "r9") return   "%r9";
    if (r === "r10") return  "%r10";
    if (r === "r11") return  "%r11";
    
    if (r === "r12") return  "%r12";
    if (r === "r13") return  "%r13";
    if (r === "r14") return  "%r14";
    if (r === "r15") return  "%r15";
  }
  else {
    throw new Error();
  }
};

function jmp(o, s) {
  if      (o === "==") return (s ? "je " : "je ");
  else if (o === "/=") return (s ? "jne" : "jne");
  else if (o === "<")  return (s ? "jl " : "jb ");
  else if (o === "<=") return (s ? "jle" : "jbe");
  else if (o === ">")  return (s ? "jg " : "ja ");
  else if (o === ">=") return (s ? "jge" : "jae");
}


function GenerateAsm(ast, context) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    let context = { asm: "", strings: [] };
    
    context.asm += `# Generated by maroon v0.1 compiler.\n`
    context.asm += `\n`;
    context.asm += `  .macosx_version_min 10, 10`
    
    Symtab.each(ast, false, decl => {
      GenerateAsm(decl, context);
    });
    
    if (context.strings.length > 0) {
      context.asm += `\n`;
      context.asm += `\n`;
      context.asm += `  .section __TEXT,__string,cstring_literals\n`;
      for (let i = 0, c = context.strings.length; i < c; i++) {
        context.asm += `L_string_${i}:\n`;
        context.asm += `  .asciz   ${JSON.stringify(context.strings[i])}\n`;
      }
    }
    
    ast.asm = context.asm;
  }
  
  
  else if (ast.tag.match(/Type$/)) {
  }
  
  
  else if (ast.tag === "Primitive") {
  }
  
  
  else if (ast.tag === "VariableDeclaration") {
    let type      = (ast.type.orig != null ? ast.type.orig : ast.type);
    let alignment = Math.ceil(Math.log(align(type) * 8) / Math.log(2)) - 2;
    
    context.asm += `\n`;
    context.asm += `\n`;
    context.asm += `  .section __DATA,__data\n`;
    context.asm += `  .align   ${alignment - 1}\n`;
    context.asm += `  .globl   ${ast.name}\n`;
    context.asm += `${ast.name}:\n`;
    
    emitInitializer(ast.value);
    
    
    function emitNull(type) {
      if (type.tag === "StructType") {
        emitInitializer({ tag: "InitStructExpression", type: type, arguments: [] });
      }
      else if (type.tag === "ArrayType") {
        emitInitializer({ tag: "InitArrayExpression", type: type, arguments: [] });
      }
      else if (type.tag === "FunctionType") {
        context.asm += `  .quad    0\n`;
      }
      else if (type.tag === "PointerType") {
        context.asm += `  .quad    0\n`;
      }
      else if (type.tag === "IntegerType") {
        let w = width(type);
        if      (w ===  8) context.asm += `  .byte    0\n`;
        else if (w === 16) context.asm += `  .word    0\n`;
        else if (w === 32) context.asm += `  .long    0\n`;
        else if (w === 64) context.asm += `  .quad    0\n`;
      }
      else if (type.tag === "BooleanType") {
        context.asm += `  .byte    0\n`;
      }
      else {
        throw new Error(`Invalid type ${type}.`);
      }
    }
    
    function emitInitializer(value) {
      if (value.tag === "InitStructExpression") {
        if (value.arguments.length === 0) {
          for (let f of value.type.fields) {
            emitZeroField(f.type);
          }
        }
        else if (value.arguments[0].tag === "Keyval") {
          for (let f of value.type.fields) {
            let kv = value.arguments.find(kv => kv.key === f.name);
            
            if (kv != null) emitInitializer(kv.value);
            else            emitZeroField(f.type);
          }
        }
        else {
          for (let a of value.arguments) {
            emitInitializer(a);
          }
        }
      }
      else if (value.tag === "InitArrayExpression") {
        if (value.arguments.length === 0) {
          for (let i = 0, c = value.arguments.length; i < c; i++) {
            emitZeroField(value.type.type);
          }
        }
        else {
          for (let a of value.arguments) {
            emitInitializer(a);
          }
        }
      }
      else if (value.tag === "IntegerLiteral") {
        let w = width(value.type);
        if      (w ===  8) context.asm += `  .byte    ${value.value}\n`;
        else if (w === 16) context.asm += `  .word    ${value.value}\n`;
        else if (w === 32) context.asm += `  .long    ${value.value}\n`;
        else if (w === 64) context.asm += `  .quad    ${value.value}\n`;
      }
      else if (value.tag === "StringLiteral") {
        throw new Error("Cannot generate variable with string literal value.");
      }
      else if (value.tag === "BooleanLiteral") {
        if (value.value) context.asm += `  .byte    1\n`;
        else             context.asm += `  .byte    0\n`;
      }
      else if (value.tag === "NullPtrLiteral") {
        context.asm += `  .quad    0\n`;
      }
      else {
        throw new Error(`Invalid global initializer ${value.tag}.`);
      }
    }
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    context.fn    = ast;
    context.label = 0;
    
    if (ast.body != null) {
      context.asm += `\n`;
      context.asm += `\n`;
      context.asm += `  .section __TEXT,__text,regular,pure_instructions\n`;
      context.asm += `  .globl   _${ast.name}\n`;
      context.asm += `  .p2align 4, 0x90\n`;
      context.asm += `_${ast.name}:\n`;
      context.asm += `LABEL__${ast.name}__PROLOGUE:\n`;
      context.asm += `  .cfi_startproc\n`;
      context.asm += `  pushq %rbp\n`;
      context.asm += `  .cfi_def_cfa_offset 16\n`;
      context.asm += `  .cfi_offset %rbp, -16\n`;
      context.asm += `  movq  %rsp, %rbp\n`;
      context.asm += `  subq  $${ast.fsize}, %rsp\n`;
      context.asm += `  .cfi_def_cfa_register %rbp\n`;
      if (ast.parameters.length >= 1) context.asm += `  movq  %rdi, -${ast.parameters[0].loffset}(%rbp)\n`;
      if (ast.parameters.length >= 2) context.asm += `  movq  %rsi, -${ast.parameters[1].loffset}(%rbp)\n`;
      if (ast.parameters.length >= 3) context.asm += `  movq  %rdx, -${ast.parameters[2].loffset}(%rbp)\n`;
      if (ast.parameters.length >= 4) context.asm += `  movq  %rcx, -${ast.parameters[3].loffset}(%rbp)\n`;
      if (ast.parameters.length >= 5) context.asm += `  movq  %r8,  -${ast.parameters[4].loffset}(%rbp)\n`;
      if (ast.parameters.length >= 6) context.asm += `  movq  %r9,  -${ast.parameters[5].loffset}(%rbp)\n`;
      context.asm += `LABEL__${ast.name}__${context.label++}:\n`;
      GenerateAsm(ast.body, context);
      context.asm += `LABEL__${ast.name}__EPILOGUE:\n`;
      context.asm += `  addq  $${ast.fsize}, %rsp\n`;
      context.asm += `  popq  %rbp\n`;
      context.asm += `  retq\n`;
      context.asm += `  .cfi_endproc\n`;
    }
  }
  
  
  else if (ast.tag === "Block") {
    for (let statement of ast.statements) {
      GenerateAsm(statement, context);
    }
  }
  
  
  else if (ast.tag === "LabelStatement") {
    context.asm += `LABEL__${context.fn.name}__${ast.name}:\n`;
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.type.tag === "StructType") {
        variable.value.addroffset = variable.addroffset;
        variable.value.soffset    = 0;
        
        context.asm += `  leaq  -${variable.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  %rax, -${variable.addroffset}(%rbp)\n`;
        GenerateAsm(variable.value, context);
      }
      else if (variable.type.tag === "ArrayType") {
        variable.value.addroffset = variable.addroffset;
        variable.value.soffset    = 0;
        
        context.asm += `  leaq  -${variable.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  %rax, -${variable.addroffset}(%rbp)\n`;
        GenerateAsm(variable.value, context);
      }
      else if (variable.type.tag === "FunctionType") {
        GenerateAsm(variable.value, context);
        context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
      }
      else if (variable.type.tag === "PointerType") {
        GenerateAsm(variable.value, context);
        context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
      }
      else if (variable.type.tag === "IntegerType") {
        let x = affix(width(variable.type));
        let a = reg(width(variable.type), "rax");
        
        GenerateAsm(variable.value, context);
        context.asm += `  mov${x}  -${variable.value.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${variable.loffset}(%rbp)\n`;
      }
      else if (variable.type.tag === "BooleanType") {
        GenerateAsm(variable.value, context);
        context.asm += `  movb  -${variable.value.loffset}(%rbp), %al\n`;
        context.asm += `  movb  %al, -${variable.loffset}(%rbp)\n`;
      }
      else {
        throw new Error(`Invalid field type ${variable.type.tag}.`);
      }
    }
  }
  else if (ast.tag === "IfStatement") {
    if (ast.alternative != null) {
      let thenLabel = context.label++;
      let elseLabel = context.label++;
      let nextLabel = context.label++;
      
      ast.condition.thenLabel = thenLabel;
      ast.condition.elseLabel = elseLabel;
      
      GenerateAsm(ast.condition, context);
      context.asm += `LABEL__${context.fn.name}__${thenLabel}:\n`;
      GenerateAsm(ast.consiquent, context);
      context.asm += `  jmp   LABEL__${context.fn.name}__${nextLabel}\n`;
      context.asm += `LABEL__${context.fn.name}__${elseLabel}:\n`;
      GenerateAsm(ast.alternative, context);
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
    else {
      let thenLabel = context.label++;
      let nextLabel = context.label++;
      
      ast.condition.thenLabel = thenLabel;
      ast.condition.elseLabel = nextLabel;
      
      GenerateAsm(ast.condition, context);
      context.asm += `LABEL__${context.fn.name}__${thenLabel}:\n`;
      GenerateAsm(ast.consiquent, context);
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
  }
  else if (ast.tag === "OnceStatement") {
    let bodyLabel = context.label++;
    let nextLabel = context.label++;
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = nextLabel;
    let preservedBreakLabel    = context.breakLabel;    context.breakLabel    = nextLabel;
    {
      context.asm += `LABEL__${context.fn.name}__${bodyLabel}:\n`;
      GenerateAsm(ast.body, context);
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
    context.continueLabel = preservedContinueLabel;
    context.breakLabel    = preservedBreakLabel;
  }
  else if (ast.tag === "ForeverStatement") {
    let bodyLabel = context.label++;
    let nextLabel = context.label++;
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = bodyLabel;
    let preservedBreakLabel    = context.breakLabel;    context.breakLabel    = nextLabel;
    {
      context.asm += `LABEL__${context.fn.name}__${bodyLabel}:\n`;
      GenerateAsm(ast.body, context);
      context.asm += `  jmp   LABEL__${context.fn.name}__${bodyLabel}\n`;
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
    context.continueLabel = preservedContinueLabel;
    context.breakLabel    = preservedBreakLabel;
  }
  else if (ast.tag === "WhileStatement") {
    let condLabel = context.label++;
    let bodyLabel = context.label++;
    let nextLabel = context.label++;
    
    ast.condition.thenLabel = bodyLabel;
    ast.condition.elseLabel = nextLabel;
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = condLabel;
    let preservedBreakLabel    = context.breakLabel;    context.breakLabel    = nextLabel;
    {
      context.asm += `LABEL__${context.fn.name}__${condLabel}:\n`;
      GenerateAsm(ast.condition, context);
      context.asm += `LABEL__${context.fn.name}__${bodyLabel}:\n`;
      GenerateAsm(ast.body, context);
      context.asm += `  jmp   LABEL__${context.fn.name}__${condLabel}\n`;
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
    context.continueLabel = preservedContinueLabel;
    context.breakLabel    = preservedBreakLabel;
  }
  else if (ast.tag === "DoWhileStatement") {
    let bodyLabel = context.label++;
    let nextLabel = context.label++;
    
    ast.condition.thenLabel = bodyLabel;
    ast.condition.elseLabel = nextLabel;
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = bodyLabel;
    let preservedBreakLabel    = context.breakLabel;    context.breakLabel    = nextLabel;
    {
      context.asm += `LABEL__${context.fn.name}__${bodyLabel}:\n`;
      GenerateAsm(ast.body, context);
      GenerateAsm(ast.condition, context);
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
    context.continueLabel = preservedContinueLabel;
    context.breakLabel    = preservedBreakLabel;
  }
  else if (ast.tag === "ForStatement") {
    let condLabel = context.label++;
    let bodyLabel = context.label++;
    let incrLabel = context.label++;
    let nextLabel = context.label++;
    
    if (ast.conditions.length >= 1) {
      ast.conditions[0].label = condLabel;
    }
    for (let i = 1, c = ast.conditions.length; i < c; i++) {
      ast.conditions[i].label = context.label++;
    }
    for (let i = 0, c = ast.conditions.length; i < c; i++) {
      ast.conditions[i].thenLabel = ast.conditions[i].label;
      ast.conditions[i].elseLabel = nextLabel;
    }
    if (ast.conditions.length >= 1) {
      ast.conditions[ast.conditions.length - 1].thenLabel = bodyLabel;
      ast.conditions[ast.conditions.length - 1].elseLabel = nextLabel;
    }
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = incrLabel;
    let preservedBreakLabel    = context.breakLabel;    context.breakLabel    = nextLabel;
    {
      for (let variable of ast.variables) {
        if (variable.type.tag === "StructType") {
          variable.value.addroffset = variable.addroffset;
          variable.value.soffset    = 0;
          
          context.asm += `  leaq  -${variable.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  %rax, -${variable.addroffset}(%rbp)\n`;
          GenerateAsm(variable.value, context);
        }
        else if (variable.type.tag === "ArrayType") {
          variable.value.addroffset = variable.addroffset;
          variable.value.soffset    = 0;
          
          context.asm += `  leaq  -${variable.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  %rax, -${variable.addroffset}(%rbp)\n`;
          GenerateAsm(variable.value, context);
        }
        else if (variable.type.tag === "FunctionType") {
          GenerateAsm(variable.value, context);
          context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "PointerType") {
          GenerateAsm(variable.value, context);
          context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "IntegerType") {
          let x = affix(width(variable.type));
          let a = reg(width(variable.type), "rax");
          
          GenerateAsm(variable.value, context);
          context.asm += `  mov${x}  -${variable.value.loffset}(%rbp), ${a}\n`;
          context.asm += `  mov${x}  ${a}, -${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "BooleanType") {
          GenerateAsm(variable.value, context);
          context.asm += `  movb  -${variable.value.loffset}(%rbp), %al\n`;
          context.asm += `  movb  %al, -${variable.loffset}(%rbp)\n`;
        }
        else {
          throw new Error(`Invalid field type ${variable.type.tag}.`);
        }
      }
      for (let condition of ast.conditions) {
        context.asm += `LABEL__${context.fn.name}__${condition.label}:\n`;
        GenerateAsm(condition, context);
      }
      context.asm += `LABEL__${context.fn.name}__${bodyLabel}:\n`;
      GenerateAsm(ast.body, context);
      context.asm += `LABEL__${context.fn.name}__${incrLabel}:\n`;
      for (let increment of ast.increments) {
        GenerateAsm(increment, context);
      }
      context.asm += `  jmp   LABEL__${context.fn.name}__${condLabel}\n`;
      context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    }
    context.continueLabel = preservedContinueLabel;
    context.breakLabel    = preservedBreakLabel;
  }
  else if (ast.tag === "BreakStatement") {
    context.asm += `  jmp   LABEL__${context.fn.name}__${context.breakLabel}\n`;
  }
  else if (ast.tag === "ContinueStatement") {
    context.asm += `  jmp   LABEL__${context.fn.name}__${context.continueLabel}\n`;
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.type.tag === "StructType") {
      throw new Error(`Cannot return struct type.`);
    }
    else if (ast.type.tag === "ArrayType") {
      throw new Error(`Cannot return array type.`);
    }
    else if (ast.type.tag === "FunctionType") {
      GenerateAsm(ast.expression, context);
      context.asm += `  movq  -${ast.expression.loffset}(%rbp), %rax\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "PointerType") {
      GenerateAsm(ast.expression, context);
      context.asm += `  movq  -${ast.expression.loffset}(%rbp), %rax\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "IntegerType") {
      let x = affix(width(ast.type));
      let a = reg(width(ast.type), "rax");
      
      GenerateAsm(ast.expression, context);
      context.asm += `  mov${x}  -${ast.expression.loffset}(%rbp), ${a}\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "BooleanType") {
      GenerateAsm(ast.expression, context);
      context.asm += `  movb  -${ast.expression.loffset}(%rbp), %al\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "VoidType") {
      if (ast.value != null) throw new Error(`Cannot return value from function with void return type.`);
    }
    else if (ast.type.tag === "HaltType") {
      throw new Error(`Cannot return from function with halt return type.`);
    }
    else {
      throw new Error(`Invalid type ${ast.type.tag}.`);
    }
  }
  else if (ast.tag === "GotoStatement") {
    context.asm += `  jmp   LABEL__${context.fn.name}__${ast.name}\n`;
  }
  else if (ast.tag === "ExpressionStatement") {
    GenerateAsm(ast.expression, context);
  }
  else if (ast.tag === "EmptyStatement") {
  }


  else if (ast.tag === "OrCondition") {
    let bLabel = context.label++;
    
    ast.a.thenLabel = ast.thenLabel;
    ast.a.elseLabel = bLabel;
    ast.b.thenLabel = ast.thenLabel;
    ast.b.elseLabel = ast.elseLabel;
    
    GenerateAsm(ast.a, context);
    context.asm += `LABEL__${context.fn.name}__${bLabel}:\n`;
    GenerateAsm(ast.b, context);
  }
  else if (ast.tag === "XorCondition") {
    GenerateAsm(ast.a, context);
    GenerateAsm(ast.b, context);
    context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
    context.asm += `  movb  -${ast.b.loffset}(%rbp), %dl\n`;
    context.asm += `  xorb  %dl, %al\n`;
    context.asm += `  andb  $1, %al\n`; // Also sets zero flag.
  }
  else if (ast.tag === "AndCondition") {
    let bLabel = context.label++;

    ast.a.thenLabel = bLabel;
    ast.a.elseLabel = ast.elseLabel;
    ast.b.thenLabel = ast.thenLabel;
    ast.b.elseLabel = ast.elseLabel;

    GenerateAsm(ast.a, context);
    context.asm += `LABEL__${context.fn.name}__${bLabel}:\n`;
    GenerateAsm(ast.b, context);
  }
  else if (ast.tag === "NotCondition") {
    ast.a.thenLabel = ast.elseLabel;
    ast.a.elseLabel = ast.thenLabel;
    
    GenerateAsm(ast.a, context);
  }
  else if (ast.tag === "ComparisonCondition") {
    if (ast.a.type.tag === "StructType") {
      throw new Error(`Cannot compare struct references.`);
    }
    else if (ast.a.type.tag === "ArrayType") {
      throw new Error(`Cannot compare array references.`);
    }
    else if (ast.a.type.tag === "FunctionType") {
      GenerateAsm(ast.a, context);
      GenerateAsm(ast.b, context);
      context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
      context.asm += `  movq  -${ast.b.loffset}(%rbp), %rdx\n`;
      context.asm += `  cmpq  %rdx, %rax\n`;
      context.asm += `  ${jmp(ast.o, false)}   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
    }
    else if (ast.a.type.tag === "PointerType") {
      GenerateAsm(ast.a, context);
      GenerateAsm(ast.b, context);
      context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
      context.asm += `  movq  -${ast.b.loffset}(%rbp), %rdx\n`;
      context.asm += `  cmpq  %rdx, %rax\n`;
      context.asm += `  ${jmp(ast.o, false)}   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
    }
    else if (ast.a.type.tag === "IntegerType") {
      let x = affix(width(ast.a.type));
      let a = reg(width(ast.a.type), "rax");
      let b = reg(width(ast.a.type), "rdx");
      
      GenerateAsm(ast.a, context);
      GenerateAsm(ast.b, context);
      context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
      context.asm += `  cmp${x}  ${b}, ${a}\n`;
      context.asm += `  ${jmp(ast.o, false)}   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
    }
    else if (ast.a.type.tag === "BooleanType") {
      GenerateAsm(ast.a, context);
      GenerateAsm(ast.b, context);
      context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
      context.asm += `  movb  -${ast.b.loffset}(%rbp), %bl\n`;
      context.asm += `  cmpb  %bl, %al\n`;
      context.asm += `  ${jmp(ast.o, false)}   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
      context.asm += `  jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
    }
    else {
      throw new Error(`Cannot compare types ${ast.a.type}.`);
    }
  }
  else if (ast.tag === "ValueCondition") {
    GenerateAsm(ast.value, context);
    context.asm += `  movb  -${ast.value.loffset}(%rbp), %al\n`;
    context.asm += `  testb %al, %al\n`;
    context.asm += `  jnz   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    context.asm += `  jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
  }
  
  
  else if (ast.tag === "NullCast") {
    GenerateAsm(ast.argument, context);
  }
  else if (ast.tag === "ExtendCast") {
    GenerateAsm(ast.argument, context);
    
    let s = (ast.signed ? "s" : "z");
    let sx = affix(width(ast.argument.type));
    let sa = reg(width(ast.argument.type), "rax");
    let tx = affix(width(ast.type));
    let ta = reg(width(ast.type), "rax");
    
    context.asm += `  mov${sx}  -${ast.argument.loffset}(%rbp), ${sa}\n`;
    context.asm += `  mov${s}${sx}${tx} ${sa}, ${ta}\n`;
    context.asm += `  mov${tx}  ${ta}, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "BooleanCast") {
    GenerateAsm(ast.argument, context);
    
    let x = affix(width(ast.argument.type));
    let a = reg(width(ast.argument.type), "rax");
    
    context.asm += `  mov${x}  -${ast.argument.loffset}(%rbp), ${a}\n`;
    context.asm += `  test${x} ${a}, ${a}\n`;
    context.asm += `  setnz %al\n`;
    context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
  }
  
  
  else if (ast.tag === "ConditionExpression") {
    let thenLabel = context.label++;
    let elseLabel = context.label++;
    let nextLabel = context.label++;
    
    GenerateAsm(ast.condition, context);
    context.asm += `LABEL__${context.fn.name}__${thenLabel}:\n`;
    context.asm += `  movb  $1, %al\n`;
    context.asm += `  jmp   LABEL__${context.fn.name}__${nextLabel}\n`;
    context.asm += `LABEL__${context.fn.name}__${elseLabel}:\n`;
    context.asm += `  movb  $0, %al\n`;
    context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
    context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "TernaryExpression") {
    let thenLabel = context.label++;
    let elseLabel = context.label++;
    let nextLabel = context.label++;
    
    GenerateAsm(ast.condition, context);
    context.asm += `LABEL__${context.fn.name}__${thenLabel}:\n`;
    GenerateAsm(ast.consiquent, context);
    context.asm += `  jmp   LABEL__${context.fn.name}__${nextLabel}\n`;
    context.asm += `LABEL__${context.fn.name}__${elseLabel}:\n`;
    GenerateAsm(ast.alternative, context);
    context.asm += `LABEL__${context.fn.name}__${nextLabel}:\n`;
  }
  else if (ast.tag === "InfixExpression") {
    if (ast.type.tag === "IntegerType") {
      let x = affix(width(ast.type));
      let a = reg(width(ast.type), "rax");
      let b = reg(width(ast.type), "rdi");
      let q = reg(width(ast.type), "rax");
      let r = reg(width(ast.type), "rdx");
      let i = (ast.signed ? "i" : "");
      
      if (ast.o === "|") {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  or${x}   ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "^") {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  xor${x}  ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "&") {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  and${x}  ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "+") {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  add${x}  ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "-") {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  sub${x}  ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "*" && ast.type.signed) {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  imul${x} ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "*" && !ast.type.signed) {
        GenerateAsm(ast.a, context);
        GenerateAsm(ast.b, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
        context.asm += `  mul${x}  ${b}, ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "quo" && ast.type.signed) {
        if (width(ast.type) === 8) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
          context.asm += `  movb  -${ast.b.loffset}(%rbp), %dil\n`;
          context.asm += `  movsbw %al, %ax\n`;
          context.asm += `  idivb %dil\n`;
          context.asm += `  movb  %ah, %dl\n`;
          context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 16) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movw  -${ast.a.loffset}(%rbp), %ax\n`;
          context.asm += `  movw  -${ast.b.loffset}(%rbp), %di\n`;
          context.asm += `  cwd\n`;
          context.asm += `  idivw %di\n`;
          context.asm += `  movw  %ax, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 32) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movl  -${ast.a.loffset}(%rbp), %eax\n`;
          context.asm += `  movl  -${ast.b.loffset}(%rbp), %edi\n`;
          context.asm += `  cdq\n`;
          context.asm += `  idivl %edi\n`;
          context.asm += `  movl  %eax, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 64) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  -${ast.b.loffset}(%rbp), %rdi\n`;
          context.asm += `  cqo\n`;
          context.asm += `  idivq %rdi\n`;
          context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
        }
      }
      else if (ast.o === "quo" && !ast.type.signed) {
        if (width(ast.type) === 8) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
          context.asm += `  movb  -${ast.b.loffset}(%rbp), %dil\n`;
          context.asm += `  movzbw %al, %ax\n`;
          context.asm += `  divb  %dil\n`;
          context.asm += `  movb  %ah, %dl\n`;
          context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 16) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movw  -${ast.a.loffset}(%rbp), %ax\n`;
          context.asm += `  movw  -${ast.b.loffset}(%rbp), %di\n`;
          context.asm += `  xorl  %edx, %edx\n`; // Sets entire register, smallest encoding.
          context.asm += `  divw  %di\n`;
          context.asm += `  movw  %ax, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 32) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movl  -${ast.a.loffset}(%rbp), %eax\n`;
          context.asm += `  movl  -${ast.b.loffset}(%rbp), %edi\n`;
          context.asm += `  xorl  %edx, %edx\n`; // Sets entire register, smallest encoding.
          context.asm += `  divl  %edi\n`;
          context.asm += `  movl  %eax, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 64) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  -${ast.b.loffset}(%rbp), %rdi\n`;
          context.asm += `  xorl  %edx, %edx\n`; // Sets entire register, smallest encoding.
          context.asm += `  divq  %rdi\n`;
          context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
        }
      }
      else if (ast.o === "rem" && ast.type.signed) {
        if (width(ast.type) === 8) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
          context.asm += `  movb  -${ast.b.loffset}(%rbp), %dil\n`;
          context.asm += `  movsbw %al, %ax\n`;
          context.asm += `  idivb %dil\n`;
          context.asm += `  movb  %ah, %dl\n`;
          context.asm += `  movb  %dl, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 16) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movw  -${ast.a.loffset}(%rbp), %ax\n`;
          context.asm += `  movw  -${ast.b.loffset}(%rbp), %di\n`;
          context.asm += `  cwd\n`;
          context.asm += `  idivw %di\n`;
          context.asm += `  movw  %dx, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 32) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movl  -${ast.a.loffset}(%rbp), %eax\n`;
          context.asm += `  movl  -${ast.b.loffset}(%rbp), %edi\n`;
          context.asm += `  cdq\n`;
          context.asm += `  idivl %edi\n`;
          context.asm += `  movl  %edx, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 64) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  -${ast.b.loffset}(%rbp), %rdi\n`;
          context.asm += `  cqo\n`;
          context.asm += `  idivq %rdi\n`;
          context.asm += `  movq  %rdx, -${ast.loffset}(%rbp)\n`;
        }
      }
      else if (ast.o === "rem" && !ast.type.signed) {
        if (width(ast.type) === 8) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
          context.asm += `  movb  -${ast.b.loffset}(%rbp), %dil\n`;
          context.asm += `  movzbw %al, %ax\n`;
          context.asm += `  divb  %dil\n`;
          context.asm += `  movb  %ah, %dl\n`;
          context.asm += `  movb  %dl, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 16) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movw  -${ast.a.loffset}(%rbp), %ax\n`;
          context.asm += `  movw  -${ast.b.loffset}(%rbp), %di\n`;
          context.asm += `  xorl  %edx, %edx\n`; // Sets entire register, smallest encoding.
          context.asm += `  divw  %di\n`;
          context.asm += `  movw  %dx, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 32) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movl  -${ast.a.loffset}(%rbp), %eax\n`;
          context.asm += `  movl  -${ast.b.loffset}(%rbp), %edi\n`;
          context.asm += `  xorl  %edx, %edx\n`; // Sets entire register, smallest encoding.
          context.asm += `  divl  %edi\n`;
          context.asm += `  movl  %edx, -${ast.loffset}(%rbp)\n`;
        }
        else if (width(ast.type) === 64) {
          GenerateAsm(ast.a, context);
          GenerateAsm(ast.b, context);
          context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  -${ast.b.loffset}(%rbp), %rdi\n`;
          context.asm += `  xorl  %edx, %edx\n`; // Sets entire register, smallest encoding.
          context.asm += `  divq  %rdi\n`;
          context.asm += `  movq  %rdx, -${ast.loffset}(%rbp)\n`;
        }
      }
      else {
        throw new Error(`Cannot codegen unsupported op ${ast.o} for integers.`);
      }
    }
    else {
      throw new Error(`Cannot codegen infix op for unsupported type ${ast.type.tag}.`);
    }
  }
  else if (ast.tag === "PrefixExpression") {
    if (ast.type.tag === "IntegerType") {
      if (ast.o === "+") {
        // Leave result where it is.
      }
      else if (ast.o === "-") {
        let x = affix(width(ast.type));
        let a = reg(width(ast.type), "rax");
        
        GenerateAsm(ast.a, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  neg${x}  ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "~") {
        let x = affix(width(ast.type));
        let a = reg(width(ast.type), "rax");
        
        GenerateAsm(ast.a, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  not${x}  ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;  
      }
      else {
        throw new Error(`Unrecognized operator ${ast.o}.`);
      }
    }
    else {
      throw new Error(`Cannot generate prefix operator for type ${ast.type.tag}.`);
    }
  }
  else if (ast.tag === "RefExpression") {
    if (ast.addr) {
      GenerateAsm(ast.a, context);
      context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
    }
    else {
      if (ast.type.tag === "StructType") {
        throw new Error(`Cannot load struct type as value.`);
      }
      else if (ast.type.tag === "ArrayType") {
        throw new Error(`Cannot load array type as value.`);
      }
      else if (ast.type.tag === "FunctionType") {
        GenerateAsm(ast.a, context);
        context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  (%rax), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "PointerType") {
        GenerateAsm(ast.a, context);
        context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  (%rax), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "IntegerType") {
        let x = affix(width(ast.type));
        let a = reg(width(ast.type), "rax");
        
        GenerateAsm(ast.a, context);
        context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
        context.asm += `  mov${x}  (%rax), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "BooleanType") {
        GenerateAsm(ast.a, context);
        context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
        context.asm += `  movb  (%rax), %al\n`;
        context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
      }
      else {
        throw new Error(`Invalid value type ${ast.type.tag}.`);
      }
    }
  }
  else if (ast.tag === "PtrExpression") {
    GenerateAsm(ast.location, context);
    context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "LookupExpression") {
    if (ast.addr) {
      if (ast.declaration.kind === "ExternalFunction") {
        throw new Error("Cannot load address of external function.");
      }
      else if (ast.declaration.kind === "GlobalFunction") {
        throw new Error("Cannot load address of global function.");
      }
      else if (ast.declaration.kind === "ExternalVariable") {
        context.asm += `  movq  _${ast.name}@GOTPCREL(%rip), %rax\n`;
      }
      else if (ast.declaration.kind === "GlobalVariable") {
        context.asm += `  leaq  ${ast.name}(%rip), %rax\n`;
      }
      else if (ast.declaration.kind === "LocalVariable") {
        context.asm += `  leaq  -${ast.declaration.loffset}(%rbp), %rax\n`;
      }
      else if (ast.declaration.kind === "Parameter") {
        context.asm += `  leaq  -${ast.declaration.loffset}(%rbp), %rax\n`;
      }
      else {
        throw new Error(`Unrecognized declaration kind ${ast.declaration.kind} for lookup.`);
      }
    }
    else {
      let x = affix(width(ast.type));
      let a = reg(width(ast.type), "rax");
      
      if (ast.declaration.kind === "ExternalFunction") {
        context.asm += `  movq  _${ast.name}@GOTPCREL(%rip), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.declaration.kind === "GlobalFunction") {
        context.asm += `  leaq  _${ast.name}(%rip), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.declaration.kind === "ExternalVariable") {
        context.asm += `  movq  _${ast.name}@GOTPCREL(%rip), %rax\n`;
        context.asm += `  mov${x}  (%rax), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.declaration.kind === "GlobalVariable") {
        context.asm += `  mov${x}  ${ast.name}(%rip), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.declaration.kind === "LocalVariable") {
        context.asm += `  mov${x}  -${ast.declaration.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.declaration.kind === "Parameter") {
        context.asm += `  mov${x}  -${ast.declaration.loffset}(%rbp), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else {
        console.dir(ast);
        throw new Error(`Unrecognized declaration kind ${ast.declaration.kind} for lookup.`);
      }
    }
  }
  else if (ast.tag === "SetExpression") {
    if (ast.type.tag === "StructType") {
      ast.value.addroffset = ast.addroffset;
      ast.value.soffset    = 0;
      
      GenerateAsm(ast.location, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.value, context);
    }
    else if (ast.type.tag === "ArrayType") {
      ast.value.addroffset = ast.addroffset;
      ast.value.soffset    = 0;
      
      GenerateAsm(ast.location, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.value, context);
    }
    else if (ast.type.tag === "FunctionType") {
      GenerateAsm(ast.location, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.value, context);
      context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
      context.asm += `  movq  -${ast.value.loffset}(%rbp), %rax\n`;
      context.asm += `  movq  %rax, (%rdx)\n`;
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "PointerType") {
      GenerateAsm(ast.location, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.value, context);
      context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
      context.asm += `  movq  -${ast.value.loffset}(%rbp), %rax\n`;
      context.asm += `  movq  %rax, (%rdx)\n`;
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "IntegerType") {
      let x = affix(width(ast.type));
      let a = reg(width(ast.type), "rax");
      
      GenerateAsm(ast.location, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.value, context);
      context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
      context.asm += `  mov${x}  -${ast.value.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  ${a}, (%rdx)\n`;
      context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "BooleanType") {
      GenerateAsm(ast.location, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.value, context);
      context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
      context.asm += `  movb  -${ast.value.loffset}(%rbp), %al\n`;
      context.asm += `  movb  %al, (%rdx)\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
    else {
      throw new Error(`Invalid field type ${f.type.tag}.`);
    }
  }
  else if (ast.tag === "FieldExpression") {
    if (ast.addr) {
      GenerateAsm(ast.subject, context);
      context.asm += `  addq  $${ast.field.offset}, %rax\n`;
      // Leave result in %rax
    }
    else {
      if (ast.type.tag === "StructType") {
        throw new Error(`Cannot load struct as value.`);
      }
      else if (ast.type.tag === "ArrayType") {
        throw new Error(`Cannot load array as value.`);
      }
      else if (ast.type.tag === "FunctionType") {
        GenerateAsm(ast.subject, context);
        context.asm += `  movq  ${ast.field.offset}(%rax), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "PointerType") {
        GenerateAsm(ast.subject, context);
        context.asm += `  movq  ${ast.field.offset}(%rax), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "IntegerType") {
        let x = affix(width(ast.type));
        let a = reg(width(ast.type), "rax");
        
        GenerateAsm(ast.subject, context);
        context.asm += `  mov${x}  ${ast.field.offset}(%rax), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "BooleanType") {
        GenerateAsm(ast.subject, context);
        context.asm += `  movb  ${ast.field.offset}(%rax), %al\n`;
        context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
      }
      else {
        throw new Error(`Invalid value type ${ast.type.tag}.`);
      }
    }
  }
  else if (ast.tag === "SubscriptExpression") {
    // TODO Figure out how to check for negative indices when the index is a 
    //      signed value, and abort the program as appropriate. Programmers can
    //      of course simply avoid using signed numbers where reasonable to 
    //      avoid the additional runtime check.
    
    // TODO Figure out how to do bounds checking where we aren't otherwise able
    //      to determine that the index is a bounded integer that doesn't
    //      required any bounds checking. Again programmers can arange their 
    //      programs to ensure that a bounded integer is used to avoid checking.
    
    
    if (ast.addr) {
      GenerateAsm(ast.subject, context);
      context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
      GenerateAsm(ast.index, context);
      context.asm += `  movq  -${ast.index.loffset}(%rbp), %rax\n`;
      context.asm += `  movq  $${size(ast.subject.type.type)}, %rdx\n`;
      context.asm += `  mulq  %rdx\n`;
      context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
      context.asm += `  addq  %rdx, %rax\n`;
      // Leave result in %rax
    }
    else {
      if (ast.type.tag === "StructType") {
        throw new Error(`Cannot load struct as value.`);
      }
      else if (ast.type.tag === "ArrayType") {
        throw new Error(`Cannot load array as value.`);
      }
      else if (ast.type.tag === "FunctionType") {
        GenerateAsm(ast.subject, context);
        context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
        GenerateAsm(ast.index, context);
        context.asm += `  movq  -${ast.index.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  $${size(ast.subject.type.type)}, %rdx\n`;
        context.asm += `  mulq  %rdx\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  addq  %rdx, %rax\n`;
        context.asm += `  movq  (%rax), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "PointerType") {
        GenerateAsm(ast.subject, context);
        context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
        GenerateAsm(ast.index, context);
        context.asm += `  movq  -${ast.index.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  $${size(ast.subject.type.type)}, %rdx\n`;
        context.asm += `  mulq  %rdx\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  addq  %rdx, %rax\n`;
        context.asm += `  movq  (%rax), %rax\n`;
        context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "IntegerType") {
        let x = affix(width(ast.type));
        let a = reg(width(ast.type), "rax");
        
        GenerateAsm(ast.subject, context);
        context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
        GenerateAsm(ast.index, context);
        context.asm += `  movq  -${ast.index.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  $${size(ast.subject.type.type)}, %rdx\n`;
        context.asm += `  mulq  %rdx\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  addq  %rdx, %rax\n`;
        context.asm += `  mov${x}  (%rax), ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.type.tag === "BooleanType") {
        GenerateAsm(ast.subject, context);
        context.asm += `  movq  %rax, -${ast.addroffset}(%rbp)\n`;
        GenerateAsm(ast.index, context);
        context.asm += `  movq  -${ast.index.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  $${size(ast.subject.type.type)}, %rdx\n`;
        context.asm += `  mulq  %rdx\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  addq  %rdx, %rax\n`;
        context.asm += `  movb  (%rax), %al\n`;
        context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
      }
      else {
        throw new Error(`Invalid value type ${ast.type.tag}.`);
      }
    }
  }
  else if (ast.tag === "CallExpression") {
    GenerateAsm(ast.subject, context);
    for (let a of ast.arguments) {
      GenerateAsm(a, context);
    }
    
    context.asm += `  movq  -${ast.subject.loffset}(%rbp), %r11\n`;
    
    for (let i = 0, c = ast.arguments.length; i < c; i++) {
      if      (i === 0) context.asm += `  movq  -${ast.arguments[0].loffset}(%rbp), %rdi\n`;
      else if (i === 1) context.asm += `  movq  -${ast.arguments[1].loffset}(%rbp), %rsi\n`;
      else if (i === 2) context.asm += `  movq  -${ast.arguments[2].loffset}(%rbp), %rdx\n`;
      else if (i === 3) context.asm += `  movq  -${ast.arguments[3].loffset}(%rbp), %rcx\n`;
      else if (i === 4) context.asm += `  movq  -${ast.arguments[4].loffset}(%rbp), %r8\n`;
      else if (i === 5) context.asm += `  movq  -${ast.arguments[5].loffset}(%rbp), %r9\n`;
      else {
        let x = affix(width(ast.type));
        let a = reg(width(ast.type), "rax");
        
        context.asm += `  mov${x}  -${ast.arguments[i].loffset}(%rbp), %rax\n`;
        context.asm += `  mov${x}  %rax, ${8 * (i - 6)}(%rsp)\n`;
      }
    }
    
    context.asm += `  callq *%r11\n`;
    
    if (ast.type.tag === "StructType") {
      throw new Error(`Function structure return types unsupported.`);
    }
    else if (ast.type.tag === "ArrayType") {
      throw new Error(`Function array return types unsupported.`);
    }
    else if (ast.type.tag === "FunctionType") {
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "PointerType") {
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "IntegerType") {
      let x = affix(width(ast.type));
      let a = reg(width(ast.type), "rax");
      
      context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "BooleanType") {
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.type.tag === "HaltType") {
    }
    else if (ast.type.tag === "VoidType") {
    }
    else {
      throw new Error(`Invalid type ${ast.type.tag}.`);
    }
  }
  else if (ast.tag === "InitStructExpression") {
    if (ast.addroffset == null || ast.soffset == null) {
      throw new Error(`Cannot construct temporary struct values.`);
    }
    
    
    // Note: All of the following clears the alignment padding space to zero.
    
    function genClearField(ast, f) {
      if (f.type.tag === "StructType") {
        GenerateAsm({
          tag: "InitStructExpression",
          type: f.type,
          arguments: [],
          addroffset: ast.addroffset,
          soffset: ast.soffset + f.offset
        }, context);
      }
      else if (f.type.tag === "ArrayType") {
        GenerateAsm({
          tag: "InitArrayExpression",
          type: f.type,
          arguments: [],
          addroffset: ast.addroffset,
          soffset: ast.soffset + f.offset
        }, context);
      }
      else if (f.type.tag === "FunctionType") {
        context.asm += `  xorq  %rax, %rax\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  movq  %rax, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else if (f.type.tag === "PointerType") {
        context.asm += `  xorq  %rax, %rax\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  movq  %rax, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else if (f.type.tag === "IntegerType") {
        let x = affix(f.space * 8);
        let a = reg(f.space * 8, "rax");
        
        context.asm += `  xor${x}  ${a}, ${a}\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  mov${x}  ${a}, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else if (f.type.tag === "BooleanType") {
        let x = affix(f.space * 8);
        let a = reg(f.space * 8, "rax");
        
        context.asm += `  xor${x}  ${a}, ${a}\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  mov${x}  ${a}, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else {
        throw new Error(`Unsupported struct field type ${f.type.tag}.`);
      }
    }
    
    function genAssignField(ast, f, a) {
      if (f.type.tag === "StructType") {
        a.addroffset = ast.addroffset;
        a.soffset    = ast.soffset + f.offset;
        
        GenerateAsm(a, context);
      }
      else if (f.type.tag === "ArrayType") {
        a.addroffset = ast.addroffset;
        a.soffset    = ast.soffset + f.offset;
        
        GenerateAsm(a, context);
      }
      else if (f.type.tag === "FunctionType") {
        GenerateAsm(a, context);
        context.asm += `  movq  -${a.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  movq  %rax, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else if (f.type.tag === "PointerType") {
        GenerateAsm(a, context);
        context.asm += `  movq  -${a.loffset}(%rbp), %rax\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  movq  %rax, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else if (f.type.tag === "IntegerType") {
        let s  = (a.type.signed ? "s" : "z");
        let xa = affix(width(a.type));
        let aa = reg(width(a.type), "rax");
        let xf = affix(f.space * 8);
        let af = reg(f.space * 8, "rax");
        
        GenerateAsm(a, context);
        context.asm += `  mov${xa}  -${a.loffset}(%rbp), ${aa}\n`;
        if (xa != xf) {
          context.asm += `  mov${s}${xa}${xf} ${aa}, ${af}\n`;
        }
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  mov${xf}  ${af}, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else if (f.type.tag === "BooleanType") {
        GenerateAsm(a, context);
        context.asm += `  movb  -${f.loffset}(%rbp), %al\n`;
        context.asm += `  movzbq %al, %rax\n`;
        context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
        context.asm += `  movq  %rax, ${ast.soffset + f.offset}(%rdx)\n`;
      }
      else {
        throw new Error(`Invalid field type ${f.type.tag}.`);
      }
    }
    
    if (ast.arguments.length === 0) {
      for (let f of ast.type.fields) {
        genClearField(ast, f);
      }
    }
    else if (ast.arguments[0].tag === "Keyval") {
      for (let kvf of ast.arguments) {
        genAssignField(ast, kvf.field, kvf.value);
      }
      
      for (let f of ast.clear) {
        genClearField(ast, f);
      }
    }
    else {
      for (let i = 0, c = ast.arguments.length; i < c; i++) {
        let f = ast.type.fields[i];
        let a = ast.arguments[i];
        
        genAssignField(ast, f, a);
      }
    }
  }
  else if (ast.tag === "InitArrayExpression") {
    if (ast.arguments.length === 0) {
      for (let i = 0, c = ast.type.count; i < c; i++) {
        let elemoffset = i * size(ast.type.type);
        
        if (ast.type.type.tag === "StructType") {
          GenerateAsm({
            tag: "InitStructExpression",
            type: ast.type.type,
            arguments: [],
            addroffset: ast.addroffset,
            soffset: ast.soffset + elemoffset
          }, context);
        }
        else if (ast.type.type.tag === "ArrayType") {
          GenerateAsm({
            tag: "InitArrayExpression",
            type: ast.type.type,
            arguments: [],
            addroffset: ast.addroffset,
            soffset: ast.soffset + elemoffset
          }, context);
        }
        else if (ast.type.type.tag === "FunctionType") {
          context.asm += `  xorq  %rax, %rax\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  movq  %rax, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else if (ast.type.type.tag === "PointerType") {
          context.asm += `  xorq  %rax, %rax\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  movq  %rax, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else if (ast.type.type.tag === "IntegerType") {
          let x = affix(width(ast.type.type));
          let a = reg(width(ast.type.type), "rax");
          
          context.asm += `  xor${x}  ${a}, ${a}\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  mov${x}  ${a}, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else if (ast.type.type.tag === "BooleanType") {
          let x = affix(width(ast.type.type));
          let a = reg(width(ast.type.type), "rax");
          
          context.asm += `  xor${x}  ${a}, ${a}\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  mov${x}  ${a}, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else {
          throw new Error(`Unsupported struct field type ${f.type.tag}.`);
        }
      }
    }
    else {
      for (let i = 0, c = ast.arguments.length; i < c; i++) {
        let elemoffset = i * size(ast.type.type);
        let a          = ast.arguments[i];
        
        if (ast.type.type.tag === "StructType") {
          a.addroffset = ast.addroffset;
          a.soffset    = ast.soffset + elemoffset;
          
          GenerateAsm(a, context);
        }
        else if (ast.type.type.tag === "ArrayType") {
          a.addroffset = ast.addroffset;
          a.soffset    = ast.soffset + elemoffset;
          
          GenerateAsm(a, context);
        }
        else if (ast.type.type.tag === "FunctionType") {
          GenerateAsm(a, context);
          context.asm += `  movq  -${a.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  movq  %rax, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else if (ast.type.type.tag === "PointerType") {
          GenerateAsm(a, context);
          context.asm += `  movq  -${a.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  movq  %rax, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else if (ast.type.type.tag === "IntegerType") {
          let s  = (a.type.signed ? "s" : "z");
          let xa = affix(width(a.type));
          let aa = reg(width(a.type), "rax");
          let xf = affix(f.space * 8);
          let af = reg(f.space * 8, "rax");
          
          GenerateAsm(a, context);
          context.asm += `  mov${xa}  -${a.loffset}(%rbp), ${aa}\n`;
          if (xa != xf) {
            context.asm += `  mov${s}${xa}${xf} ${aa}, ${af}\n`;
          }
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  mov${xf}  ${af}, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else if (ast.type.type.tag === "BooleanType") {
          GenerateAsm(a, context);
          context.asm += `  movb  -${f.loffset}(%rbp), %al\n`;
          context.asm += `  movzbq %al, %rax\n`;
          context.asm += `  movq  -${ast.addroffset}(%rbp), %rdx\n`;
          context.asm += `  movq  %rax, ${ast.soffset + elemoffset}(%rdx)\n`;
        }
        else {
          throw new Error(`Invalid field type ${f.type.tag}.`);
        }
      }
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
    let x = affix(width(ast.type));
    let a = reg(width(ast.type), "rax");
    
    context.asm += `  mov${x}  $${ast.value}, ${a}\n`;
    context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "StringLiteral") {
    let i = context.strings.indexOf(ast.value);
    
    if (i === -1) {
      context.strings.push(ast.value);
      i = context.strings.length - 1;
    }
    
    context.asm += `  leaq  L_string_${i}(%rip), %rax\n`;
    context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "BooleanLiteral") {
    context.asm += `  movb  ${ast.value ? "$1" : "$0"}, %al\n`;
    context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "NullPtrLiteral") {
    context.asm += `  xorq  %rax, %rax\n`;
    context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
  }


  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};

module.exports = GenerateAsm;
