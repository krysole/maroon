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


function widthOf(type) {
  if      (type.tag === "FunctionType") return 64;
  else if (type.tag === "PointerType")  return 64;
  else if (type.tag === "IntegerType")  return type.width;
  else if (type.tag === "BooleanType")  return 8;
  else if (type.tag === "HaltType")     throw new Error("HaltType does not have data width.");
  else if (type.tag === "VoidType")     throw new Error("VoidType does not have data width.");
  else                                  throw new Error("Invalid type.");
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
  
  
  else if (ast.tag === "FunctionDeclaration") {
    context.fn    = ast;
    context.label = 0;
    
    if (ast.body != null) {
      context.asm += `\n`;
      context.asm += `\n`;
      context.asm += `  .section __TEXT,__text,regular,pure_instructions\n`;
      context.asm += `  .globl _${ast.name}\n`;
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
      if (ast.parameters.length >= 1) context.asm += `  movq  %rdi, ${ast.parameters[0].loffset}(%rbp)`;
      if (ast.parameters.length >= 2) context.asm += `  movq  %rsi, ${ast.parameters[1].loffset}(%rbp)`;
      if (ast.parameters.length >= 3) context.asm += `  movq  %rdx, ${ast.parameters[2].loffset}(%rbp)`;
      if (ast.parameters.length >= 4) context.asm += `  movq  %rcx, ${ast.parameters[3].loffset}(%rbp)`;
      if (ast.parameters.length >= 5) context.asm += `  movq  %r8,  ${ast.parameters[4].loffset}(%rbp)`;
      if (ast.parameters.length >= 6) context.asm += `  movq  %r9,  ${ast.parameters[5].loffset}(%rbp)`;
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


  else if (ast.tag === "FunctionType") {}
  else if (ast.tag === "PointerType") {}
  else if (ast.tag === "IntegerType") {}
  else if (ast.tag === "BooleanType") {}
  else if (ast.tag === "HaltType") {}
  else if (ast.tag === "VoidType") {}
  
  
  else if (ast.tag === "LabelStatement") {
    context.asm += `LABEL__${context.fn.name}__${ast.name}`;
  }
  else if (ast.tag === "LetStatement") {
    for (let variable of ast.variables) {
      if (variable.value != null) {
        GenerateAsm(variable.value, context);

        if (variable.type.tag === "FunctionType") {
          context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "PointerType") {
          context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
          context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "IntegerType") {
          if (variable.type.width === 8) {
            context.asm += `  movb  -${variable.value.loffset}(%rbp), %al\n`;
            context.asm += `  movb  %al, -${variable.loffset}(%rbp)\n`;
          }
          else if (variable.type.width === 16) {
            context.asm += `  movw  -${variable.value.loffset}(%rbp), %ax\n`;
            context.asm += `  movw  %ax, -${variable.loffset}(%rbp)\n`;
          }
          else if (variable.type.width === 32) {
            context.asm += `  movl  -${variable.value.loffset}(%rbp), %eax\n`;
            context.asm += `  movl  %eax, -${variable.loffset}(%rbp)\n`;
          }
          else if (variable.type.width === 64) {
            context.asm += `  movq  -${variable.value.loffset}(%rbp), %rax\n`;
            context.asm += `  movq  %rax, -${variable.loffset}(%rbp)\n`;
          }
          else {
            throw new Error(`Cannot copy bad integer width ${variable.type.width}.`);
          }
        }
        else if (variable.type.tag === "BooleanType") {
          context.asm += `  movb  -${variable.value.loffset}(%rbp), %al\n`;
          context.asm += `  movb  %al, -${variable.loffset}(%rbp)\n`;
        }
        else {
          throw new Error(`Invalid variable type ${variable.type.tag}.`);
        }
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
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = condLabel;
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
    
    let preservedContinueLabel = context.continueLabel; context.continueLabel = condLabel;
    let preservedBreakLabel    = context.breakLabel;    context.breakLabel    = nextLabel;
    {
      context.asm += `LABEL__${context.fn.name}__${bodyLabel}:\n`;
      GenerateAsm(ast.body, context);
      context.asm += `  jmp   LABEL__${context.fn.name}__${bodyLabel}:\n`;
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
      context.asm += `LABEL__${context.fn.name}__${nextLabel}\n`;
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
  else if (ast.tag === "BreakStatement") {
    context.asm += `  jmp   LABEL__${context.fn.name}__${context.breakLabel}\n`;
  }
  else if (ast.tag === "ContinueStatement") {
    context.asm += `  jmp   LABEL__${context.fn.name}__${context.continueLabel}\n`;
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.type.tag === "FunctionType") {
      context.asm += `  movq  -${ast.value.loffset}(%rbp), %rax\n`;
      context.asm += `  jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "PointerType") {
      context.asm += `  movq  -${ast.value.loffset}(%rbp), %rax\n`;
      context.asm += `  jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "IntegerType") {
      if (ast.type.width === 8) {
        context.asm += `  movb  -${ast.value.loffset}(%rbp), %al\n`;
        context.asm += `  jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else if (ast.type.width === 16) {
        context.asm += `  movw  -${ast.value.loffset}(%rbp), %ax\n`;
        context.asm += `  jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else if (ast.type.width === 32) {
        context.asm += `  movl  -${ast.value.loffset}(%rbp), %eax\n`;
        context.asm += `  jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else if (ast.type.width === 64) {
        context.asm += `  movq  -${ast.value.loffset}(%rbp), %rax\n`;
        context.asm += `  jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else {
        throw new Error(`Cannot copy bad integer width ${ast.type.width}.`);
      }
    }
    else if (ast.type.tag === "BooleanType") {
      context.asm += `  movb  -${variable.value.loffset}(%rbp), %al\n`;
      context.asm += `  movb  %al, -${variable.loffset}(%rbp)\n`;
    }
    else {
      throw new Error(`Invalid variable type ${variable.type.tag}.`);
    }
  }
  else if (ast.tag === "GotoStatement") {
    context.asm += `  jmp   LABEL__${ast.fn.name}__${ast.name}\n`;
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
    GenerateAsm(ast.a, context);
    GenerateAsm(ast.b, context);
    
    let width = widthOf(ast.type);
    
    if      (width ===  8) context.asm += `  movb  -${ast.a.loffset}(%rbp), %al\n`;
    else if (width === 16) context.asm += `  movw  -${ast.a.loffset}(%rbp), %ax\n`;
    else if (width === 32) context.asm += `  movl  -${ast.a.loffset}(%rbp), %eax\n`;
    else if (width === 64) context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
    
    if      (width ===  8) context.asm += `  movb  -${ast.b.loffset}(%rbp), %bl\n`;
    else if (width === 16) context.asm += `  movw  -${ast.b.loffset}(%rbp), %bx\n`;
    else if (width === 32) context.asm += `  movl  -${ast.b.loffset}(%rbp), %ebx\n`;
    else if (width === 64) context.asm += `  movq  -${ast.b.loffset}(%rbp), %rbx\n`;
    
    if      (width ===  8) context.asm += `  cmpb  %bl, %al\n`;
    else if (width === 16) context.asm += `  cmpw  %bx, %ax\n`;
    else if (width === 32) context.asm += `  cmpl  %ebx, %eax\n`;
    else if (width === 64) context.asm += `  cmpq  %rbx, %rax\n`;
    
    if      (ast.o === "==") context.asm += `  je    LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === "/=") context.asm += `  jne   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === "<")  context.asm += `  jlt   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === "<=") context.asm += `  jle   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === ">")  context.asm += `  jgt   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === ">=") context.asm += `  jge   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    
    context.asm += `  jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
  }
  else if (ast.tag === "ValueCondition") {
    GenerateAsm(ast.value, context);
  }
  
  
  else if (ast.tag === "NullCast") {
    GenerateAsm(ast.argument, context);
  }
  else if (ast.tag === "ExtendCast") {
    GenerateAsm(ast.argument, context);
    
    let sw = widthOf(ast.argument.type);
    
    let sx;
    if      (sw ===  8) sx = "b";
    else if (sw === 16) sx = "w";
    else if (sw === 32) sx = "l";
    else if (sw === 64) sx = "q";
    
    let sa
    if      (sw ===  8) sa = "%al";
    else if (sw === 16) sa = "%ax";
    else if (sw === 32) sa = "%eax";
    else if (sw === 64) sa = "%rax";
    
    let tw = widthOf(ast.type);
    
    let tx;
    if      (tw ===  8) tx = "b";
    else if (tw === 16) tx = "w";
    else if (tw === 32) tx = "l";
    else if (tw === 64) tx = "q";
    
    let ta
    if      (tw ===  8) ta = "%al";
    else if (tw === 16) ta = "%ax";
    else if (tw === 32) ta = "%eax";
    else if (tw === 64) ta = "%rax";
    
    let s = (ast.signed ? "s" : "z");
    
    context.asm += `  mov${sx}  -${ast.argument.loffset}(%rbp), ${sa}\n`;
    context.asm += `  mov${s}${sx}${tx} ${sa}, ${ta}\n`;
    context.asm += `  mov${tx}  ${ta}, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "BooleanCast") {
    GenerateAsm(ast.argument, context);
    
    let width = widthOf(ast.argument.type);
    if (width === 8) {
      context.asm += `  movb  -${ast.argument.loffset}(%rbp), %al\n`;
      context.asm += `  testb %al, %al\n`;
      context.asm += `  setnz %al\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
    else if (width === 16) {
      context.asm += `  movw  -${ast.argument.loffset}(%rbp), %ax\n`;
      context.asm += `  testw %ax, %ax\n`;
      context.asm += `  setnz %al\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
    else if (width === 32) {
      context.asm += `  movl  -${ast.argument.loffset}(%rbp), %eax\n`;
      context.asm += `  testl %eax, %eax\n`;
      context.asm += `  setnz %al\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
    else if (width === 64) {
      context.asm += `  movq  -${ast.argument.loffset}(%rbp), %rax\n`;
      context.asm += `  testq %rax, %rax\n`;
      context.asm += `  setnz %al\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
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
      let w = widthOf(ast.type);
      let x, a, b, r, i = (ast.signed ? "i" : "");
      
      if      (w ===  8) x = "b";
      else if (w === 16) x = "w";
      else if (w === 32) x = "l";
      else if (w === 64) x = "q";
      
      if      (w ===  8) a = "%al";
      else if (w === 16) a = "%ax";
      else if (w === 32) a = "%eax";
      else if (w === 64) a = "%rax";
      
      if      (w ===  8) b = "%bl";
      else if (w === 16) b = "%bx";
      else if (w === 32) b = "%ebx";
      else if (w === 64) b = "%rbx";
      
      if      (w ===  8) r = "%ah";
      else if (w === 16) r = "%dx";
      else if (w === 32) r = "%edx";
      else if (w === 64) r = "%rdx";
      
      GenerateAsm(ast.a, context);
      GenerateAsm(ast.b, context);
      if (ast.o === "quot") context.asm += `  xor${x}  ${r}, ${r}\n`;
      if (ast.o === "rem")  context.asm += `  xor${x}  ${r}, ${r}\n`;
      context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  -${ast.b.loffset}(%rbp), ${b}\n`;
      if      (ast.o === "|")    context.asm += `  or${x}   ${b}, ${a}\n`;
      else if (ast.o === "^")    context.asm += `  xor${x}  ${b}, ${a}\n`;
      else if (ast.o === "&")    context.asm += `  and${x}  ${b}, ${a}\n`;
      else if (ast.o === "+")    context.asm += `  add${x}  ${b}, ${a}\n`;
      else if (ast.o === "-")    context.asm += `  sub${x}  ${b}, ${a}\n`;
      else if (ast.o === "*")    context.asm += `  ${i}mul${x}  ${b}, ${a}\n`;
      else if (ast.o === "/")    throw new Error("Cannot divide integers, quot or rem intended?");
      else if (ast.o === "quot") context.asm += `  ${i}div${x}  ${b}\n`;
      else if (ast.o === "rem")  context.asm += `  ${i}div${x}  ${b}\n` + `mov${x}  ${r}, ${a}\n`;
      else if (ast.o === "exp")  throw new Error("exp currently unsupported");
      else                       throw new Error(`Unrecognized operator ${ast.o}.`);
      context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
    }
    else {
      throw new Error(`Cannot generate infix operator for type ${ast.type.tag}.`);
    }
  }
  else if (ast.tag === "PrefixExpression") {
    if (ast.type.tag === "IntegerType") {
      let w = widthOf(ast.type);
      let x, a;
      
      if      (w ===  8) x = "b";
      else if (w === 16) x = "w";
      else if (w === 32) x = "l";
      else if (w === 64) x = "q";
      
      if      (w ===  8) a = "%al";
      else if (w === 16) a = "%ax";
      else if (w === 32) a = "%eax";
      else if (w === 64) a = "%rax";
      
      if (ast.o === "+") {
        // Leave result where it is.
      }
      else if (ast.o === "-") {
        GenerateAsm(ast.a, context);
        context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
        context.asm += `  neg${x}  ${a}\n`;
        context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
      }
      else if (ast.o === "~") {
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
  else if (ast.tag === "DerefExpression") {
    // We can assume that we're only dealing with word types (register types).
    
    GenerateAst(asm.a, context);
    context.asm += `  movq  -${ast.a.loffset}(%rbp), %rax\n`;
    context.asm += `  movq  (%rax), %rax\n`;
    context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
  }
  else if (ast.tag === "AddrExpression") {
    if (ast.declaration.kind === "ExternalFunction") {
      throw new Error("Cannot load address of external function.");
    }
    else if (ast.declaration.kind === "GlobalFunction") {
      throw new Error("Cannot load address of global function.");
    }
    else if (ast.declaration.kind === "ExternalVariable") {
      context.asm += `  movq  _${ast.name}@GOTPCREL(%rip), %rax\n`;
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.declaration.kind === "GlobalVariable") {
      context.asm += `  leaq  _${ast.name}(%rip), %rax\n`;
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.declaration.kind === "LocalVariable") {
      context.asm += `  leaq  -${ast.declaration.loffset}(%rbp), %rax\n`;
      context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
    }
    else {
      throw new Error(`Unrecognized declaration kind ${ast.declaration.kind} for lookup.`);
    }
  }
  else if (ast.tag === "LookupExpression") {
    // Todo: Perhaps the location can be moved into a seperate *Location node
    //       which generates the pointer to the data in question in a register
    //       using 'leaq' as required. LookupExpression could then be replaced
    //       by a LoadExpression, and SetExpression with StoreExpression, which
    //       could be used to load and store word types, and word like types
    //       as required. There would only really be assignment of arrays and
    //       structs to deal with otherwise, which can't be handled as loads
    //       and stores anyway, and must be converted to copy operations at
    //       some point, specifically, after type analysis.
    
    
    let w = widthOf(ast.type);
    let x, a;
    
    if      (w ===  8) x = "b";
    else if (w === 16) x = "w";
    else if (w === 32) x = "l";
    else if (w === 64) x = "q";
    
    if      (w ===  8) a = "%al";
    else if (w === 16) a = "%ax";
    else if (w === 32) a = "%eax";
    else if (w === 64) a = "%rax";
    
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
      context.asm += `  mov${x}  _${ast.name}(%rip), ${a}\n`;
      context.asm += `  mov${a}  ${a}, -${ast.loffset}(%rbp)\n`;
    }
    else if (ast.declaration.kind === "LocalVariable") {
      context.asm += `  mov${x}  -${ast.declaration.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
    }
    else {
      throw new Error(`Unrecognized declaration kind ${ast.declaration.kind} for lookup.`);
    }
  }
  else if (ast.tag === "SetExpression") {
    let w = widthOf(ast.type);
    let x, a;
    
    if      (w ===  8) x = "b";
    else if (w === 16) x = "w";
    else if (w === 32) x = "l";
    else if (w === 64) x = "q";
    
    if      (w ===  8) a = "%al";
    else if (w === 16) a = "%ax";
    else if (w === 32) a = "%eax";
    else if (w === 64) a = "%rax";
    
    if (ast.declaration.kind === "ExternalFunction") {
      throw new Error("Cannot store into external function.");
    }
    else if (ast.declaration.kind === "GlobalFunction") {
      throw new Error("Cannot store into global function.");
    }
    else if (ast.declaration.kind === "ExternalVariable") {
      GenerateAsm(ast.a, context);
      context.asm += `  movq  _${ast.name}@GOTPCREL(%rip), %rbx\n`;
      context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  ${a}, (%rbx)\n`;
      // argument left at -ast.loffset since -ast.loffset == -ast.a.loffset
    }
    else if (ast.declaration.kind === "GlobalVariable") {
      GenerateAsm(ast.a, context);
      context.asm += `  leaq  _${ast.name}(%rip), %rbx\n`;
      context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  ${a}, (%rbx)\n`;
      // argument left at -ast.loffset since -ast.loffset == -ast.a.loffset
    }
    else if (ast.declaration.kind === "LocalVariable") {
      GenerateAsm(ast.a, context);
      context.asm += `  leaq  -${ast.declaration.loffset}(%rbp), %rbx\n`;
      context.asm += `  mov${x}  -${ast.a.loffset}(%rbp), ${a}\n`;
      context.asm += `  mov${x}  ${a}, (%rbx)\n`;
      // argument left at -ast.loffset since -ast.loffset == -ast.a.loffset
    }
    else {
      throw new Error(`Unrecognized declaration kind ${ast.declaration.kind} for lookup.`);
    }
  }
  else if (ast.tag === "LookupPropertyExpression") {
    throw new Error("LookupPropertyExpression not yet implemented.");
  }
  else if (ast.tag === "SetPropertyExpression") {
    throw new Error("SetPropertyExpression not yet implemented.");
  }
  else if (ast.tag === "CallExpression") {
    GenerateAsm(ast.subject, context);
    context.asm += `  movq  -${ast.subject.loffset}(%rbp), %r11\n`;
    
    for (let i = 0, c = ast.arguments.length; i < c; i++) {
      GenerateAsm(ast.arguments[i], context);
      
      if      (i === 0) context.asm += `  movq  -${ast.arguments[0].loffset}(%rbp), %rdi\n`;
      else if (i === 1) context.asm += `  movq  -${ast.arguments[1].loffset}(%rbp), %rsi\n`;
      else if (i === 2) context.asm += `  movq  -${ast.arguments[2].loffset}(%rbp), %rdx\n`;
      else if (i === 3) context.asm += `  movq  -${ast.arguments[3].loffset}(%rbp), %rcx\n`;
      else if (i === 4) context.asm += `  movq  -${ast.arguments[4].loffset}(%rbp), %r8\n`;
      else if (i === 5) context.asm += `  movq  -${ast.arguments[5].loffset}(%rbp), %r9\n`;
      else {
        let w = widthOf(ast.type);
        let x, a;
        
        if      (w ===  8) x = "b";
        else if (w === 16) x = "w";
        else if (w === 32) x = "l";
        else if (w === 64) x = "q";
        
        if      (w ===  8) a = "%al";
        else if (w === 16) a = "%ax";
        else if (w === 32) a = "%eax";
        else if (w === 64) a = "%rax";
        
        context.asm += `  mov${x}  -${ast.arguments[i].loffset}(%rbp), %rax\n`;
        context.asm += `  mov${x}  %rax, ${8 * (i - 6)}(%rsp)\n`;
      }
    }
    
    context.asm += `  callq *%r11\n`;
    
    if (ast.type.tag === "HaltType") {
    }
    else if (ast.type.tag === "VoidType") {
    }
    else {
      let w = widthOf(ast.type);
      let x, a;
      
      if      (w ===  8) x = "b";
      else if (w === 16) x = "w";
      else if (w === 32) x = "l";
      else if (w === 64) x = "q";
      
      if      (w ===  8) a = "%al";
      else if (w === 16) a = "%ax";
      else if (w === 32) a = "%eax";
      else if (w === 64) a = "%rax";
      
      context.asm += `  mov${x}  ${a}, -${ast.loffset}(%rbp)\n`;
    }
  }
  
  
  else if (ast.tag === "IntegerLiteral") {
    let w = widthOf(ast.type);
    let x, a;
    
    if      (w ===  8) x = "b";
    else if (w === 16) x = "w";
    else if (w === 32) x = "l";
    else if (w === 64) x = "q";
    
    if      (w ===  8) a = "%al";
    else if (w === 16) a = "%ax";
    else if (w === 32) a = "%eax";
    else if (w === 64) a = "%rax";
    
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
    if (ast.value) {
      context.asm += `  movb  $1, %al\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
    else {
      context.asm += `  movb  $0, %al\n`;
      context.asm += `  movb  %al, -${ast.loffset}(%rbp)\n`;
    }
  }
  else if (ast.tag === "NullLiteral") {
    context.asm += `  xorq  %rax, %rax\n`;
    context.asm += `  movq  %rax, -${ast.loffset}(%rbp)\n`;
  }


  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};

module.exports = GenerateAsm;
