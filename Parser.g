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

grammar Parser {
  
  unit 
    = declaration*:ds end
      !{ tag: "Source", declarations: ds }
    ;
  
  
  declaration
    = structDeclaration
    | letDeclaration
    | functionDeclaration
    ;
  
  structDeclaration
    = id("struct") local:n p("{") structField*:fs p("}")
      !{ tag: "StructTypeDeclaration", name: n, fields: fs }
    ;
  structField
    = id:n p(":") type:t p(";")
      !{ tag: "Field", name: n, type: t }
    ;
  
  letDeclaration
    = id("let") ( variable ; p(",") )+:vs p(";")
      !{ tag: "LetDeclaration", variables: vs }
    ;
  
  functionDeclaration
    = id("fn") local:n p("[") ( parameter ; p(",") )*:ps vaparameter:va p("]") type:r block:b
      !{ tag: "FunctionDeclaration", name: n, parameters: ps, vaparameter: va, return: r, body: b }
    | id("fn") local:n p("[") ( parameter ; p(",") )*:ps vaparameter:va p("]") type:r p(";")
      !{ tag: "FunctionDeclaration", name: n, parameters: ps, vaparameter: va, return: r, body: null }
    ;
  
  
  statement
    = labelStatement
    | letStatement
    | ifStatement
    | unlessStatement
    | onceStatement
    | foreverStatement
    | whileStatement
    | untilStatement
    | doWhileStatement
    | doUntilStatement
    | breakStatement
    | continueStatement
    | returnStatement
    | gotoStatement
    | expressionStatement
    | emptyStatement
    ;
  
  labelStatement
    = id("label") id:n p(";")
      !{ tag: "LabelStatement", name: n }
    ;
  
  letStatement
    = id("let") ( variable ; p(",") )+:vs p(";")
      !{ tag: "LetStatement", variables: vs }
    ;
  
  ifStatement
    = id("if") expression:c
      ( id("then") statement:t | block:t )
      ( id("else") ~p("{") statement:f | block:f | !null:f )
      !{ tag: "IfStatement", negated: false, condition: c, consiquent: t, alternative: f }
    ;
  
  unlessStatement
    = id("unless") expression:c
      ( id("then") statement:t | block:t )
      ( id("else") ~p("{") statement:f | block:f | !null:f )
      !{ tag: "IfStatement", negated: true, condition: c, consiquent: t, alternative: f }
    ;
  
  onceStatement
    = id("once") block:b
      !{ tag: "OnceStatement", body: b }
    ;
  
  foreverStatement
    = id("forever") block:b
      !{ tag: "ForeverStatement", body: b}
    ;
  
  whileStatement
    = id("while") condition:c ( id("do") statement:b | block:b )
      !{ tag: "WhileStatement", negated: false, condition: c, body: b }
    ;
  
  untilStatement
    = id("until") condition:c ( id("do") statement:b | block:b )
      !{ tag: "WhileStatement", negated: true, condition: c, body: b }
    ;
  
  doWhileStatement
    = id("do") ( ~p("{") statement:b | block:b )
      id("while") expression:c p(";")
      !{ tag: "DoWhileStatement", negated: false, condition: c, body: b }
    ;
  
  doUntilStatement
    = id("do") ( ~p("{") statement:b | block:b )
      id("until") expression:c p(";")
      !{ tag: "DoWhileStatement", negated: true, condition: c, body: b }
    ;
  
  breakStatement
    = id("break") p(";")
      !{ tag: "BreakStatement" }
    ;
  
  continueStatement
    = id("continue") p(";")
      !{ tag: "ContinueStatement" }
    ;
  
  returnStatement
    = id("return") expression?:e p(";")
      !{ tag: "ReturnStatement", expression: e }
    ;
  
  gotoStatement
    = id("goto") id:n p(";")
      !{ tag: "GotoStatement", name: n }
    ;
  
  expressionStatement
    = expression:e p(";")
      !{ tag: "ExpressionStatement", expression: e }
    ;
  
  emptyStatement
    = p(";")
      !{ tag: "EmptyStatement" }
    ;
  
  
  block
    = p("{") statement*:ss p("}")
      !{ tag: "Block", statements: ss }
    ;
  
  
  expression
    = logicalInfixExpression
    ;
  
  logicalInfixExpression
    = logicalNotExpression:a
      ( id("or")  logicalNotExpression:b !{ tag: "OrExpression",  a: a, b: b }:a
      | id("xor") logicalNotExpression:b !{ tag: "XorExpression", a: a, b: b }:a
      | id("and") logicalNotExpression:b !{ tag: "AndExpression", a: a, b: b }:a
      )*
      !a
    ;
  
  logicalNotExpression
    = id("not") logicalNotExpression:a !{ tag: "NotExpression", a: a }
    | assignmentExpression
    ;
  
  assignmentExpression
    = typecastExpression:l p("<-") assignmentExpression:e
      ?(l.tag === "LookupPropertyExpression")
      !{ tag: "SetPropertyExpression", subject: l.subject, name: l.selector, argument: e }
    | typecastExpression:l p("<-") assignmentExpression:e
      ?(l.tag === "LookupExpression")
      !{ tag: "SetExpression", name: l.name, a: e }
    | typecastExpression
    ;
  
  typecastExpression
    = ternaryExpression:a
      ( id("as") ternaryExpression:t !{ tag: "TypecastExpression", type: t, argument: a }:a
      )*
      !a
    ;
  
  ternaryExpression
    = comparisonExpression:c p("?") ternaryExpression:t p(":") ternaryExpression:f
      !{ tag: "TernaryExpression", condition: c, consiquent: t, alternative: f }
    | comparisonExpression
    ;
    
  comparisonExpression
    = vectorInfixExpression:a
      ( p("=="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", o: "==", a: a, b: b }
      | p("/="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", o: "/=", a: a, b: b }
      | p(">="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", o: ">=", a: a, b: b }
      | p(">"):o  vectorInfixExpression:b !{ tag: "ComparisonExpression", o: ">",  a: a, b: b }
      | p("<="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", o: "<=", a: a, b: b }
      | p("<"):o  vectorInfixExpression:b !{ tag: "ComparisonExpression", o: "<",  a: a, b: b }
      |                                   !a
      )
    ;
  
  vectorInfixExpression
    = addExpression:a
      ( p("|") addExpression:b !{ tag: "InfixExpression", o: "|", a: a, b: b }:a
      | p("^") addExpression:b !{ tag: "InfixExpression", o: "^", a: a, b: b }:a
      | p("&") addExpression:b !{ tag: "InfixExpression", o: "&", a: a, b: b }:a
      )*
      !a
    ;
  
  addExpression
    = mulExpression:a
      ( p("+") mulExpression:b !{ tag: "InfixExpression", o: "+", a: a, b: b }:a
      | p("-") mulExpression:b !{ tag: "InfixExpression", o: "-", a: a, b: b }:a
      )*
      !a
    ;
    
  mulExpression
    = expExpression:a
      ( p("*")     expExpression:b !{ tag: "InfixExpression", o: "*",    a: a, b: b }:a
      | p("/")     expExpression:b !{ tag: "InfixExpression", o: "/",    a: a, b: b }:a
      | id("quot") expExpression:b !{ tag: "InfixExpression", o: "quot", a: a, b: b }:a
      | id("rem")  expExpression:b !{ tag: "InfixExpression", o: "rem",  a: a, b: b }:a
      )*
      !a
    ;
  
  expExpression
    = prefixExpression:a
      ( p("exp") prefixExpression:b !{ tag: "InfixExpression", o: "exp", a: a, b: b }:a )*
      !a
    ;
    
  prefixExpression
    = p("+") secondaryExpression:a !{ tag: "PrefixExpression", o: "+", a: a }
    | p("-") secondaryExpression:a !{ tag: "PrefixExpression", o: "-", a: a }
    | p("~") secondaryExpression:a !{ tag: "PrefixExpression", o: "~", a: a }
    |        secondaryExpression
    ;
  
  secondaryExpression
    = primaryExpression:e
      ( p(".") id:n                               !{ tag: "LookupPropertyExpression", subject: e, name: n }:e
      | p("[") ( expression ; p(",") )*:as p("]") !{ tag: "CallExpression", subject: e, arguments: as }:e
      )*
      !e
    ;
  
  primaryExpression
    = p("(") expression:a p(")") !a
    | p("[") expression:a p("]") !{ tag: "DerefExpression", a: a }
    
    | local:n !{ tag: "LookupExpression", name: n }
    
    | binintLiteral
    | octintLiteral
    | decintLiteral
    | hexintLiteral
    | stringLiteral
    | id("true")  !{ tag: "BooleanLiteral", value: true }
    | id("false") !{ tag: "BooleanLiteral", value: false }
    | id("null")  !{ tag: "NullLiteral" }
    ;
  
  
  type
    = primaryType:t
      ( p("[")              p("]") !{ tag: "ArrayType", type: t, count: null }:t
      | p("[") expression:a p("]") !{ tag: "ArrayType", type: t, count: a }:t
      )*
      !t
    ;
  primaryType
    = p("[") p("(") ( parameter ; p(",") )*:ps p(")") p(":") type:r p("]")
      !{ tag: "FunctionType", parameters: ps, return: r }
    | p("[") type:t p("]")
      !{ tag: "PointerType", target: t }
    | local:n
      !{ tag: "LookupExpression", name: n }
    ;
  
  
  variable
    = local:n p("<-") expression:e !{ tag: "VariableDeclaration", name: n, value: e }
    ;
    
    
  parameter
    = type:t local:n
      !{ tag: "Parameter", name: n, type: t }
    ;
  
  vaparameter
    = p(",") p("...") !true
    |                 !false
    ;
  
  
  binintLiteral
    = ws* char("0") char("b") ( bin | char("_") )+:ds
      !(new BigNumber(ds.join("").replace(/_/g, ""), 2)):v
      !{ tag: "IntegerLiteral", value: v }
    ;
  octintLiteral
    = ws* char("0") char("o") ( oct | char("_") )+:ds
      !(new BigNumber(ds.join("").replace(/_/g, ""), 8)):v
      !{ tag: "IntegerLiteral", value: v }
    ;
  decintLiteral
    = ws* dec:d ( dec | char("_") )*:ds ~restIdChar
      !(new BigNumber(d + ds.join("").replace(/_/g, ""), 10)):v
      !{ tag: "IntegerLiteral", value: v }
    ;
  hexintLiteral
    = ws* char("0") char("x") ( hex | char("_") )+:ds
      !(new BigNumber(ds.join("").replace(/_/g, ""), 16)):v
      !{ tag: "IntegerLiteral", value: v }
    ;
  stringLiteral
    = ws* char("\"") ( ~char("\\\"\r\n") char | stringEscapeCharacter )*:cs char("\"")
      !{ tag: "StringLiteral", value: cs.join("") }
    ;
  stringEscapeCharacter
    = string("\\a")  !"\x07"
    | string("\\b")  !"\x08"
    | string("\\f")  !"\x0C"
    | string("\\n")  !"\x0A"
    | string("\\r")  !"\x0D"
    | string("\\t")  !"\x09"
    | string("\\v")  !"\x0B"
    | string("\\\\") !"\x5C"
    | string("\\\'") !"\x27"
    | string("\\\"") !"\x22"
    | string("\\x")  hex:a hex:b                         !String.fromCharCode(parseInt(a + b, 16))
    | string("\\u")  hex:a hex:b hex:c hex:d             !String.fromCharCode(parseInt(a + b + c + d, 16))
    | string("\\U")  hex:a hex:b hex:c hex:d hex:e hex:f !String.fromCharCode(parseInt(a + b + c + d + e + f, 16))
    | string("\\U+") hex:a hex:b hex:c hex:d hex:e hex:f !String.fromCharCode(parseInt(a + b + c + d + e + f, 16))
    ;
  local
    = id:n
      ?[
        "fn", "struct", 
        "label", "let",
        "if", "unless",
        "once", "forever", 
        "while", "until", "repeat",
        "break", "continue", 
        "return", 
        "goto",
        "and", "xor", "or", "not",
        "quot", "rem",
        "true", "false", "null"
      ].excludes(n)
      !n
    ;
  id(expected)
    = ws* initIdChar:c restIdChar*:cs !(c + cs.join("")):i
      ?((expected != null && expected === i) || (expected == null))
      !i
    ;
  p(expected)
    = ws*
      ( char("([{}])")
        
      | string("...")
      | string(".") | string(":") | string("?") | string(",") | string(";")
      
      | string("<-")
      
      | string("==") | string("/=")
      | string(">=") | string("<=") | string("<") | string(">")
      
      | string("+") | string("-") | string("*") | string("/")
      | string("|") | string("^") | string("&") | string("~")
      
      ):s
      ?(expected === s)
      !s
    ;
  end
    = ws* ~char
    ;
  
  
  initIdChar
    = range("A", "Z") | range("a", "z") | char("_")
    ;
  restIdChar
    = range("A", "Z") | range("a", "z") | char("_") | range("0", "9")
    ;
  bin
    = range("0", "1")
    ;
  oct
    = range("0", "7")
    ;
  dec
    = range("0", "9")
    ;
  hex
    = range("0", "9") | range("A", "F") | range("a", "f")
    ;
  
  
  ws
    = spaces
    | newline
    | lineComment
    | delimitedComment
    ;
  spaces
    = char(" \t")+
    ;
  newline
    = char("\n") char("\r")?
    | char("\r") char("\n")?
    ;
  lineComment
    = string("--") ( ~newline char )* newline
    ;
  delimitedComment
    = string("{#") ( ~string("{#") ~string("#}") char | delimitedComment )* string("#}")
    ;
  
}
