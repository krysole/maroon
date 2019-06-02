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


function GenerateAsm(ast, context) {
  if (ast == null) {
  }
  
  
  else if (ast.tag === "Unit") {
    let context = { asm: "" };
    
    Symtab.each(ast, false, decl => {
      GenerateAsm(decl, context);
    });
    
    ast.asm = context.asm;
  }
  
  
  else if (ast.tag === "FunctionDeclaration") {
    context.fn    = ast;
    context.label = 0;

    context.asm += `  .section __TEXT,__text,regular,pure_instructions\n`;
    context.asm += `  .globl _${ast.name}\n`;
    context.asm += `  .p2align 4, 0x90\n`;
    context.asm += `_${ast.name}:\n`;
    context.asm += `LABEL__${ast.name}__PROLOGUE:\n`;
    context.asm += `  .cfi_startproc\n`;
    context.asm += `  pushq %rbp\n`;
    context.asm += `  .cfi_def_cfa_offset 16\n`;
    context.asm += `  .cfi_offset %rbp -16\n`;
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
    
    context.asm += `LABEL__${ast.name}__EPILOGUE:\n`;
    context.asm += `  addq  $${ast.fsize}, %rsp\n`;
    context.asm += `  popq  %rbp\n`;
    context.asm += `  retq\n`;
    context.asm += `  .cfi_endproc\n`;
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
          context.asm += `movq  $-${variable.value.loffset}(%rbp), %rax\n`;
          context.asm += `movq  %rax, $-${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "PointerType") {
          context.asm += `movq  $-${variable.value.loffset}(%rbp), %rax\n`;
          context.asm += `movq  %rax, $-${variable.loffset}(%rbp)\n`;
        }
        else if (variable.type.tag === "IntegerType") {
          if (variable.type.width === 8) {
            context.asm += `movb  $-${variable.value.loffset}(%rbp), %al\n`;
            context.asm += `movb  %al, $-${variable.loffset}(%rbp)\n`;
          }
          else if (variable.type.width === 16) {
            context.asm += `movw  $-${variable.value.loffset}(%rbp), %ax\n`;
            context.asm += `movw  %ax, $-${variable.loffset}(%rbp)\n`;
          }
          else if (variable.type.width === 32) {
            context.asm += `movl  $-${variable.value.loffset}(%rbp), %eax\n`;
            context.asm += `movl  %eax, $-${variable.loffset}(%rbp)\n`;
          }
          else if (variable.type.width === 64) {
            context.asm += `movq  $-${variable.value.loffset}(%rbp), %rax\n`;
            context.asm += `movq  %rax, $-${variable.loffset}(%rbp)\n`;
          }
          else {
            throw new Error(`Cannot copy bad integer width ${variable.type.width}.`);
          }
        }
        else if (variable.type.tag === "BooleanType") {
          context.asm += `movb  $-${variable.value.loffset}(%rbp), %al\n`;
          context.asm += `movb  %al, $-${variable.loffset}(%rbp)\n`;
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
      context.asm += `jmp   LABEL__${context.fn.name}__${nextLabel}\n`;
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
      context.asm += `jmp   LABEL__${context.fn.name}__${bodyLabel}:\n`;
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
      context.asm += `jmp   LABEL__${context.fn.name}__${condLabel}\n`;
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
    context.asm += `jmp   LABEL__${context.fn.name}__${context.breakLabel}\n`;
  }
  else if (ast.tag === "ContinueStatement") {
    context.asm += `jmp   LABEL__${context.fn.name}__${context.continueLabel}\n`;
  }
  else if (ast.tag === "ReturnStatement") {
    if (ast.type.tag === "FunctionType") {
      context.asm += `movq  $-${ast.value.loffset}(%rbp), %rax\n`;
      context.asm += `jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "PointerType") {
      context.asm += `movq  $-${ast.value.loffset}(%rbp), %rax\n`;
      context.asm += `jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
    }
    else if (ast.type.tag === "IntegerType") {
      if (ast.type.width === 8) {
        context.asm += `movb  $-${ast.value.loffset}(%rbp), %al\n`;
        context.asm += `jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else if (ast.type.width === 16) {
        context.asm += `movw  $-${ast.value.loffset}(%rbp), %ax\n`;
        context.asm += `jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else if (ast.type.width === 32) {
        context.asm += `movl  $-${ast.value.loffset}(%rbp), %eax\n`;
        context.asm += `jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else if (ast.type.width === 64) {
        context.asm += `movq  $-${ast.value.loffset}(%rbp), %rax\n`;
        context.asm += `jmp   LABEL__${ast.fn.name}__EPILOGUE\n`;
      }
      else {
        throw new Error(`Cannot copy bad integer width ${ast.type.width}.`);
      }
    }
    else if (ast.type.tag === "BooleanType") {
      context.asm += `movb  $-${variable.value.loffset}(%rbp), %al\n`;
      context.asm += `movb  %al, $-${variable.loffset}(%rbp)\n`;
    }
    else {
      throw new Error(`Invalid variable type ${variable.type.tag}.`);
    }
  }
  else if (ast.tag === "GotoStatement") {
    context.asm += `jmp   LABEL__${ast.fn.name}__${ast.name}\n`;
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
    context.asm += `movb  $-${ast.a.loffset}(%rbp), %al\n`;
    context.asm += `movb  $-${ast.b.loffset}(%rbp), %dl\n`;
    context.asm += `xorb  %dl, %al\n`;
    context.asm += `andb  $1, %al\n`; // Also sets zero flag.
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
    
    if      (width ===  8) context.asm += `movb  $-${ast.a.loffset}(%rbp), %al\n`;
    else if (width === 16) context.asm += `movw  $-${ast.a.loffset}(%rbp), %ax\n`;
    else if (width === 32) context.asm += `movl  $-${ast.a.loffset}(%rbp), %eax\n`;
    else if (width === 64) context.asm += `movq  $-${ast.a.loffset}(%rbp), %rax\n`;
    
    if      (width ===  8) context.asm += `movb  $-${ast.b.loffset}(%rbp), %dl\n`;
    else if (width === 16) context.asm += `movw  $-${ast.b.loffset}(%rbp), %dx\n`;
    else if (width === 32) context.asm += `movl  $-${ast.b.loffset}(%rbp), %edx\n`;
    else if (width === 64) context.asm += `movq  $-${ast.b.loffset}(%rbp), %rdx\n`;
    
    if      (width ===  8) context.asm += `cmpb  %dl, %al\n`;
    else if (width === 16) context.asm += `cmpw  %dx, %ax\n`;
    else if (width === 32) context.asm += `cmpl  %edx, %eax\n`;
    else if (width === 64) context.asm += `cmpq  %rdx, %rax\n`;
    
    if      (ast.o === "==") context.asm += `je    LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === "/=") context.asm += `jne   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === "<")  context.asm += `jlt   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === "<=") context.asm += `jle   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === ">")  context.asm += `jgt   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    else if (ast.o === ">=") context.asm += `jge   LABEL__${context.fn.name}__${ast.thenLabel}\n`;
    
    context.asm += `jmp   LABEL__${context.fn.name}__${ast.elseLabel}\n`;
  }
  else if (ast.tag === "ValueCondition") {
    GenerateAsm(ast.value, context);
  }
  
  
  else if (ast.tag === "NullCast") {
    GenerateAsm(ast.argument, context);
  }
  else if (ast.tag === "ExtendCast") {
    GenerateAsm(ast.argument, context);
    
    let width = widthOf(ast.argument.type);
    if      (width ===  8) context.asm += `movb  $-${ast.argument.loffset}(%rbp), %al\n`;
    else if (width === 16) context.asm += `movw  $-${ast.argument.loffset}(%rbp), %ax\n`;
    else if (width === 32) context.asm += `movl  $-${ast.argument.loffset}(%rbp), %eax\n`;
    else if (width === 64) context.asm += `movq  $-${ast.argument.loffset}(%rbp), %rax\n`;
    
    let opcode = (ast.signed ? "movs" : "movz");
    let width = widthOf(ast.argument.type);
    let source = "";
    if      (width ===  8) { opcode += "b"; source = "%al";  }
    else if (width === 16) { opcode += "w"; source = "%ax";  }
    else if (width === 32) { opcode += "l"; source = "%eax"; }
    else if (width === 64) { opcode += "q"; source = "%rax"; }
    let width = widthOf(ast.type);
    let target = "";
    if      (width ===  8) { opcode += "b"; target = "%al";  }
    else if (width === 16) { opcode += "w"; target = "%ax";  }
    else if (width === 32) { opcode += "l"; target = "%eax"; }
    else if (width === 64) { opcode += "q"; target = "%rax"; }
    
    context.asm += `${opcode} ${source}, ${target}\n`;
  }
  else if (ast.tag === "BooleanCast") {
    GenerateAsm(ast.argument, context);
    
    let width = widthOf(ast.argument.type);
    if (width === 8) {
      context.asm += `movb  $-${ast.argument.loffset}(%rbp), %al\n`;
      context.asm += `testb %al, %al\n`;
      context.asm += `setnz %al\n`;
    }
    else if (width === 16) {
      context.asm += `movw  $-${ast.argument.loffset}(%rbp), %ax\n`;
      context.asm += `testw %ax, %ax\n`;
      context.asm += `setnz %al\n`;
    }
    else if (width === 32) {
      context.asm += `movl  $-${ast.argument.loffset}(%rbp), %eax\n`;
      context.asm += `testl %eax, %eax\n`;
      context.asm += `setnz %al\n`;
    }
    else if (width === 64) {
      context.asm += `movq  $-${ast.argument.loffset}(%rbp), %rax\n`;
      context.asm += `testq %rax, %rax\n`;
      context.asm += `setnz %al\n`;
    }
  }


  // Todo


  else {
    throw new Error(`Unrecognized ast node tag ${ast.tag}.`);
  }
};

module.exports = GenerateAsm;
