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
	
	linecol(position) {
		if (position == null) position = this.position;
		
		let line   = 1;
		let column = 1;
		
		for (let i = 0, c = position; i < c; i++) {
      if (this.input[i] === "\r") {
        if (this.input[i + 1] === "\n") i++;
        line++;
        column = 1;
      }
      else if (this.input[i] === "\n") {
        if (this.input[i + 1] === "\r") i++;
        line++;
        column = 1;
      }
      else {
        column++;
      }
		}
		
		return {
			path: this.path,
			line: line,
			column: column,
			toString() { return `${this.path}:${this.line}:${this.column}`; }
		};
	}
	
	read(regexp) {
		regexp.lastIndex = this.position;
		
		let result = this.input.match(regexp);
		if (result != null) this.position += result[0].length;
		
		return result;
	}
	
	advance() {
		let result = null;
		
		if (this.top("STRING")) {
			// STRING [FRAGMENT]
			result = this.read(/((?!{{)(?!")(?![\n\r])(?!\\).|\\.)+/y);
			if (result != null) {
				this.emit({
					tag:   "STRING",
					start: result.index,
					end:   result.index + result[0].length,
					text:  result[0],
					value: JSON.parse(`"{result[0]}"`)
				});
				return;
			}
			
			// LINTERPOLATE
			result = this.read(/{{/y);
			if (result != null) {
				this.push("INTERPOLATE");
				this.emit({
					tag:   "LINTERPOLATE",
					start: result.index,
					end:   result.index + result[0].length,
					text:  result[0],
					value: null
				});
				return;
			}
			
			// RSTRING
			result = this.read(/"/y);
			if (result != null && this.pop("STRING")) {
				this.emit({
					tag:   "RSTRING",
					start: result.index,
					end:   result.index + result[0].length,
					text:  result[0],
					value: null
				});
				return;
			}
		}
		else {
			// Filter out any whitespace tokens before attempting to read next token.
			this.whitespace();
			
			// IDENTIFIER
			result = this.read(/[A-Za-z_][A-Za-z_0-9]*[?!']*/y);
			if (result != null) {
				this.emit({
					tag:   "IDENTIFIER",
					start: result.index,
					end:   result.index + result[0].length,
					text:  result[0],
					value: null
				});
				return;
			}
      
      // FLOAT
      result = this.read(/[0-9][0-9_]*.[0-9][0-9_]*([eE][0-9][0-9_])?/y);
      if (result != null) {
        this.emit({
          tag:   "FLOAT",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: parseFloat(result[0].replace(/_/g, ""))
        });
        return;
      }
      
      // INTEGER [HEXADECIMAL]
      result = this.read(/0x([0-9A-Fa-f][0-9A-Fa-f_])*/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: new BigNumber(result[1], 16)
        });
        return;
      }
      
      // INTEGER [OCTAL]
      result = this.read(/0o([0-7][0-7_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: new BigNumber(result[1], 8)
        });
        return;
      }
      
      // INTEGER [BINARY]
      result = this.read(/0b([0-1][0-1_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: new BigNumber(result[1], 2)
        });
        return;
      }
      
      // INTEGER [DECIMAL]
      result = this.read(/([0-9][0-9_]*)/y);
      if (result != null) {
        this.emit({
          tag:   "INTEGER",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: new BigNumber(result[1], 10)
        });
        return;
      }
      
      // STRING [CLOSED]
      result = this.read(/"((?!{{)(?!")(?![\n\r])(?!\\).|\\.)*"/y);
      if (result != null) {
        this.emit({
          tag:   "STRING",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: JSON.parse(result[0])
        });
        return;
      }
      
      // LSTRING
      result = this.read(/"/y);
      if (result != null) {
        this.push("STRING");
        this.emit({
          tag:   "LSTRING",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: null
        });
        return;
      }
      
      // RINTERPOLATE
      result = this.read(/}}/y);
      if (result != null && this.pop("INTERPOLATE")) {
        this.emit({
          tag:   "RINTERPOLATE",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
      result = this.read(/\.\.\.|\.\.|\.|\:|\,|\;|\<\-|\=\=|\/\=|\<\=|\>\=|\<|\>|\+\+|\+|\-|\*|\/|\||\^|\&|\~/y);
      if (result != null) {
        this.emit({
          tag:   result[0],
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
          value: null
        });
        return;
      }
      
      // "}"
      result = this.read(/\}/y);
      if (result != null && this.pop("BRACE")) {
        this.emit({
          tag:   "}",
          start: result.index,
          end:   result.index + result[0].length,
          text:  result[0],
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
      			start: this.position,
      			end:   this.position,
      			text:  "",
      			value: null
      		});
      	}
      	this.emit({
      		tag:   "END",
      		start: this.position,
      		end:   this.position,
      		text:  "",
      		value: null
      	});
      	return;
      }
      
      // INVALID
      throw new Error(`Invalid token at ${this.linecol()}.`);
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
				throw new Error(`Unterminated block comment at ${this.linecol()}.`);
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
					start: linePosition,
					end:   linePosition,
					text:  "",
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
						throw new Error(`Expected ')' at ${this.linecol()}.`);
					}
				}
				else if (this.tokens[this.tokens.length - 1].tag === "[") {
					// Don't emit LINE_TERMINATOR for empty [] pairs.
					let token = this.get(this.tokens.length);
					if (token.tag !== "]") {
						throw new Error(`Expected ']' at ${this.linecol()}.`);
					}
				}
				else if (this.tokens[this.tokens.length - 1].tag === "{") {
					// Don't emit LINE_TERMINATOR for empty [] pairs.
					let token = this.get(this.tokens.length);
					if (token.tag !== "}") {
						throw new Error(`Expected '}' at ${this.linecol()}.`);
					}
				}
				else {
					this.emit({
						tag:   "LINE_TERMINATOR",
						start: newlinePosition,
						end:   newlinePosition,
						text:  "",
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
						start: newlinePosition,
						end:   newlinePosition,
						text:  "",
						value: null
					});
				}
				this.emit({
					tag:   "DEDENT",
					start: linePosition,
					end:   linePosition,
					text:  "",
					value: null
				});
			}
			else {
				// Invalid indentation level, bad source code line.
				throw new Error(`Invalid indentation at ${this.linecol()}.`);
			}
		}
	}
	
}

module.exports = Lexer;
