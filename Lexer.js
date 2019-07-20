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

class Loc {
  
  constructor(path, string, index) {
    let line   = 1;
    let column = 1;
    
    for (let i = 0, c = index; i < c; i++) {
      if (string[i] === "\r") {
        if (string[i + 1] === "\n") i++;
        line++;
        column = 1;
      }
      else if (string[i] === "\n") {
        if (string[i + 1] === "\r") i++;
        line++;
        column = 1;
      }
      else {
        column++;
      }
    }
    
    this.path   = path;
    this.line   = line;
    this.column = column;
  }
  
  toString() {
    return `${this.path}:${this.line}:${this.column}`;
  }
  
}

class Lexer {
  
  constructor(input, path) {
    this.input       = input;
    this.path        = path;
    this.position    = 0;
    this.indentation = 0;
    this.nesting     = ["DEFAULT"];
    this.tokens      = [];
  }
  
  push(tag) {
    this.nesting.push(tag);
    
    return true;
  }
  
  pop(tag) {
    if (this.nesting[this.nesting.length - 1] === tag) {
      this.nesting.pop();
      return true;
    }
    else {
      return false;
    }
  }
  
  top(tag) {
    if (this.nesting[this.nesting.length - 1] === tag) {
      return true;
    }
    else {
      return false;
    }
  }
  
  get(index) {
    while (index >= this.tokens.length) {
      this.advance();
      // This may produce an infinite stream of END tokens. This is intentional.
      // The parser is expected to stop asking for tokens after an END token.
    }
    
    return this.tokens[index];
  }
  
  all() {
    while (this.tokens.length === 0 || this.tokens[this.tokens.length - 1].tag !== "END") {
      this.advance();
    }
    
    return this.tokens;
  }
  
  emit(token) {
    this.tokens.push(token);
  }
  
  read(regexp) {
    regexp.lastIndex = this.position;
    
    let result = this.input.match(regexp);
    if (result != null) this.position += result[0].length;
    
    return result;
  }
  
  loc(pos) {
    return new Loc(this.path, this.input, (pos != null ? pos : this.position));
  }
  
  advance() {
    let result = null;
    
    if (this.top("STRING")) {
      // STRING [FRAGMENT]
      result = this.read(/((?!{{)(?!")(?![\n\r])(?!\\).|\\.)+/y);
      if (result != null) {
        this.emit({
          tag:   "STRING",
          loc:   this.loc(result.index),
          value: this.unescape(result[0])
        });
        return;
      }
      
      // LINTERPOLATE
      result = this.read(/{{/y);
      if (result != null) {
        this.push("INTERPOLATE");
        this.emit({
          tag:   "LINTERPOLATE",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // RSTRING
      result = this.read(/"/y);
      if (result != null && this.pop("STRING")) {
        this.emit({
          tag:   "RSTRING",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
    }
    else {
      // Filter out any whitespace tokens before attempting to read next token.
      this.whitespace();
      
      // IDENTIFIER
      result = this.read(/[A-Za-z_][A-Za-z_0-9]*[']*[?!]?/y);
      if (result != null) {
        this.emit({
          tag:   "IDENTIFIER",
          loc:   this.loc(result.index),
          value: result[0]
        });
        return;
      }
      
      // FLOAT
      result = this.read(/[0-9][0-9_]*.[0-9][0-9_]*([eE][0-9][0-9_])?/y);
      if (result != null) {
        this.emit({
          tag:   "FLOAT",
          loc:   this.loc(result.index),
          value: parseFloat(result[0].replace(/_/g, ""))
        });
        return;
      }
      
      // INTEGER [HEXADECIMAL]
      result = this.read(/0x([0-9A-Fa-f][0-9A-Fa-f_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          loc:   this.loc(result.index),
          value: new BigNumber(result[1], 16)
        });
        return;
      }
      
      // INTEGER [OCTAL]
      result = this.read(/0o([0-7][0-7_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          loc:   this.loc(result.index),
          value: new BigNumber(result[1], 8)
        });
        return;
      }
      
      // INTEGER [BINARY]
      result = this.read(/0b([0-1][0-1_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          loc:   this.loc(result.index),
          value: new BigNumber(result[1], 2)
        });
        return;
      }
      
      // INTEGER [DECIMAL]
      result = this.read(/([0-9][0-9_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          loc:   this.loc(result.index),
          value: new BigNumber(result[1], 10)
        });
        return;
      }
      
      // STRING [CLOSED]
      result = this.read(/"(((?!{{)(?!")(?![\n\r])(?!\\).|\\.)*)"/y);
      if (result != null) {
        this.emit({
          tag:   "STRING",
          loc:   this.loc(result.index),
          value: this.unescape(result[1])
        });
        return;
      }
      
      // LSTRING
      result = this.read(/"/y);
      if (result != null) {
        this.push("STRING");
        this.emit({
          tag:   "LSTRING",
          loc:   this.loc(result.index),
          value: result[0]
        });
        return;
      }
      
      // RINTERPOLATE
      result = this.read(/}}/y);
      if (result != null && this.pop("INTERPOLATE")) {
        this.emit({
          tag:   "RINTERPOLATE",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // [OPERATOR]
      // <-
      // == /= <= >= < >
      // ++
      // + - * /
      // | ^ & ~
      result = this.read(/\<\-|\=\=|\/\=|\<\=|\>\=|\<|\>|\+\+|\+|\-|\*|\/|\||\^|\&|\~/y);
      if (result != null) {
        this.emit({
          tag:   result[0],
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // [PUNCTUATOR]
      // ... .. . : , ;
      result = this.read(/\.\.\.|\.\.|\.|\:|\,|\;/y);
      if (result != null) {
        this.emit({
          tag:   result[0],
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // "("
      result = this.read(/\(/y);
      if (result != null) {
        this.push("PAREN");
        this.emit({
          tag:   "(",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // ")"
      result = this.read(/\)/y);
      if (result != null && this.pop("PAREN") ||
          result != null && this.pop("BRACKET")) {
        this.emit({
          tag:   ")",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // "["
      result = this.read(/\[/y);
      if (result != null) {
        this.push("BRACKET");
        this.emit({
          tag:   "[",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // "]"
      result = this.read(/\]/y);
      if (result != null && this.pop("PAREN") ||
          result != null && this.pop("BRACKET")) {
        this.emit({
          tag:   "]",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // "{"
      result = this.read(/\{/y);
      if (result != null) {
        this.push("BRACE");
        this.emit({
          tag:   "{",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // "}"
      result = this.read(/\}/y);
      if (result != null && this.pop("BRACE")) {
        this.emit({
          tag:   "}",
          loc:   this.loc(result.index),
          value: null
        });
        return;
      }
      
      // END
      if (this.position === this.input.length) {
        if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].tag !== "LINE_TERMINATOR") {
          // Insert LINE_TERMINATOR after non LINE_TERMINATOR and before END token.
          this.emit({
            tag:   "LINE_TERMINATOR",
            loc:   this.loc(this.position),
            value: null
          });
        }
        this.emit({
          tag:   "END",
          loc:   this.loc(this.position),
          value: null
        });
        return;
      }
      
      // INVALID
      throw new Error(`Invalid token at ${this.loc(this.position)}.`);
    }
  }
  
  whitespace() {
    // We handle whitespace separately from the rest of the lexer since we're
    // not preserving whitespace tokens. We emit all layout tokens here except
    // for LINE_TERMINATOR before END where one is missing, which can be seen
    // in the END token rule.
    
    let indentation     = null;
    let newlinePosition = null;
    let linePosition    = null;
    let result          = null;
    
    while (true) {
      if (this.top("BLOCK_COMMENT")) {
        // BLOCK_COMMENT_START
        result = this.read(/{#/y);
        if (result != null) {
          this.push("BLOCK_COMMENT");
          continue;
        }
        
        // BLOCK_COMMENT_TEXT
        result = this.read(/((?!#}).)+/y);
        if (result != null) {
          continue;
        }
        
        // BLOCK_COMMENT_END
        result = this.read(/#}/y);
        if (result != null && this.pop("BLOCK_COMMENT")) {
          continue;
        }
        
        // BLOCK_COMMENT_UNTERMINATED
        throw new Error(`Unterminated block comment at ${this.loc(this.position)}.`);
      }
      else {
        // SPACES
        result = this.read(/[ ]+/y);
        if (result != null) {
          continue;
        }
        
        // LINE_COMMENT
        result = this.read(/--((?![\n\r]).)*(\r\n?|\n\r?)/y);
        if (result != null) {
          continue;
        }
        
        // BLOCK_COMMENT_START
        result = this.read(/{#/y);
        if (result != null) {
          this.push("BLOCK_COMMENT");
          continue;
        }
        
        // NEWLINE
        result = this.read(/\r\n?|\n\r?/y);
        if (result != null) {
          // After a newline read out any indentation spaces.
          // Tabs are not supported.
          indentation     = this.read(/[ ]*/y)[0].length;
          newlinePosition = result.index;
          linePosition    = result.index + result[0].length;
          continue;
        }
        
        // NO_WHITESPACE
        break;
      }
    }
    
    // Layout rule handling.
    if (indentation != null) {
      if (indentation > this.indentation + 2) {
        // Continuation line, no token generated.
      }
      else if (indentation === this.indentation + 2) {
        this.indentation = indentation;
        this.emit({
          tag:   "INDENT",
          loc:   this.loc(linePosition),
          value: null
        });
      }
      else if (indentation === this.indentation) {
        if (this.tokens.length === 0) {
          // Don't emit LINE_TERMINATOR for leading whitespace.
        }
        else if (this.tokens[this.tokens.length - 1].tag === "(") {
          // Don't emit LINE_TERMINATOR for empty () pairs.
          let token = this.get(this.tokens.length);
          if (token.tag !== ")") {
            throw new Error(`Expected ')' at ${this.loc(this.position)}.`);
          }
        }
        else if (this.tokens[this.tokens.length - 1].tag === "[") {
          // Don't emit LINE_TERMINATOR for empty [] pairs.
          let token = this.get(this.tokens.length);
          if (token.tag !== "]") {
            throw new Error(`Expected ']' at ${this.loc(this.position)}.`);
          }
        }
        else if (this.tokens[this.tokens.length - 1].tag === "{") {
          // Don't emit LINE_TERMINATOR for empty [] pairs.
          let token = this.get(this.tokens.length);
          if (token.tag !== "}") {
            throw new Error(`Expected '}' at ${this.loc(this.position)}.`);
          }
        }
        else {
          this.emit({
            tag:   "LINE_TERMINATOR",
            loc:   this.loc(newlinePosition),
            value: null
          });
        }
      }
      else if (indentation === this.indentation - 2) {
        this.indentation = indentation;
        if (this.tokens[this.tokens.length - 1].tag !== "INDENT") {
          // Generate final LINE_TERMINATOR for indented block unless there is
          // no code in the block.
          this.emit({
            tag:   "LINE_TERMINATOR",
            loc:   this.loc(newlinePosition),
            value: null
          });
        }
        this.emit({
          tag:   "DEDENT",
          loc:   this.loc(linePosition),
          value: null
        });
      }
      else {
        // Invalid indentation level, bad source code line.
        throw new Error(`Invalid indentation at ${this.loc(this.position)}.`);
      }
    }
  }
  
  unescape(s, loc) {
    let i = 0;
    let r = "";
    let c = null;
    
    while (i < s.length) {
      c = s[i++];
      
      if (c === "\\") {
        c = s[i++];
        
        if      (c === "a")  r += "\x07";
        else if (c === "b")  r += "\x08";
        else if (c === "t")  r += "\x09";
        else if (c === "n")  r += "\x0A";
        else if (c === "v")  r += "\x0B";
        else if (c === "f")  r += "\x0C";
        else if (c === "r")  r += "\x0D";
        else if (c === "\\") r += "\\";
        else if (c === "\'") r += "\'";
        else if (c === "\"") r += "\"";
        else if (c === "x") {
          let e = "";
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          r += String.fromCharCode(parseInt(e, 16));
        }
        else if (c === "u") {
          let e = "";
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          r += String.fromCharCode(parseInt(e, 16));
        }
        else if (c === "U") {
          let e = "";
          
          if (s[i] === "+") i++;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          c = s[i++];
          if (!c.match(/[0-9A-Fa-f]/)) throw new Error(`Bad excape code at ${loc}.`);
          e += c;
          
          r += String.fromCharCode(parseInt(e, 16));
        }
        else {
          throw new Error(`Bad excape code at ${loc}.`);
        }
      }
      else {
        r += c
      }
    }
    
    return r;
  }
  
}

module.exports = Lexer;
