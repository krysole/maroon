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
    = ( ( declaration ; t(";") )*:ds t(";")? t("LINE_TERMINATOR") !ds )*:dss end
      !{ tag: "Source", declarations: dss.flat() }
    ;
  
  
  declaration
    = letDeclaration
    | classDeclaration
    | procDeclaration
    | structDeclaration
    | functionDeclaration
    ;
  
  letDeclaration
    = id("let"):q ( variable ; p(",") )+:vs p(";")
      !{ tag: "LetDeclaration", loc: q.loc, variables: vs }
    ;
  
  classDeclaration
    = id("class"):q local:n mixins?:cms mixins?:mms p("{") behavior*:bs p("}")
      !{ tag: "ClassDeclaration", loc: q.loc, name: n.value, behaviors: bs }
    ;
  classBody
    = t("LINE_TERMINATOR")?
      t("{") ( behavior ; t(";") )*:bs t(";")? t("}")
      !bs
    | t("LINE_TERMINATOR")?
      t("{") t("INDENT")
      ( ( behavior ; t(";") )*:bs t(";")? t("LINE_TERMINATOR") !bs )*:bss
      t("DEDENT") t("}")
      !bss.flat()
    ;
  
  procDeclaration
    = id("proc"):q local:n p("[") ( local ; p(",") )*:ps vaparam:va p("]") fnbody:b
      !{ tag: "ProcDeclaration", loc: q.loc, name: n.value, parameters: ps, vaparam: va, body: b }
    ;
  
  structDeclaration
    = id("struct"):q local:n structBody:fs
      !{ tag: "StructDeclaration", loc: q.loc, name: n.value, fields: fs }
    ;
  structBody
    = t("LINE_TERMINATOR")?
      t("{") ( structField ; t(",") )*:fs t(",")? t("}")
      !fs
    | t("LINE_TERMINATOR")?
      t("{") t("INDENT")
      ( ( structField ; t(",") )*:fs t(",")? t("LINE_TERMINATOR") !fs )*:fss
      t("DEDENT") t("}")
      !fss.flat()
    ;
  structField
    = id:n p(":") type:t
      !{ tag: "Field", loc: n.loc, name: n.value, type: t }
    ;
  
  functionDeclaration
    = id("fn"):q local:n p("[") ( parameter ; p(",") )*:ps vaparam:va p("]") p(":") type:r fnbody:b
      !{ tag: "FunctionDeclaration", loc: q.loc, name: n.value, parameters: ps, vaparam: va, rtype: r, body: b }
    ;
  
  
  behavior
    = letBehavior
    | methodBehavior
    ;
  
  letBehavior
    = id("let"):q ( variable ; p(",") )+:vs
      !{ tag: "LetBehavior", loc: q.loc, variables: vs }
    ;
  
  methodBehavior
    = &t:q visibility:v static:s id:n p("(") ( parameter ; p(",") )*:ps vaparam:va p(")") p(":") type:r pbody:b
      !{ tag: "MethodBehavior", loc: q.loc, name: n.value, static: s, visibility: v, parameters: ps, vaparam: va, rtype: r, body: b }
    | &t:q visibility:v static:s id:n                                                     p(":") type:r pbody:b
      !{ tag: "MethodBehavior", loc: q.loc, name: n.value, static: s, visibility: v, parameters: [], vaparam: false, rtype: r, body: b }
    | &t:q visibility:v static:s      p("[") ( parameter ; p(",") )*:ps vaparam:va p("]") p(":") type:r pbody:b
      !{ tag: "MethodBehavior", loc: q.loc, name: "apply", static: s, visibility: v, parameters: ps, vaparam: va, rtype: r, body: b }
    ;
  
  
  statement
    = letStatement
    | ifStatement
    | unlessStatement
    | onceStatement
    | foreverStatement
    | whileStatement
    | untilStatement
    | doWhileStatement
    | doUntilStatement
    | forStatement
    // | forInStatement
    | breakStatement
    | continueStatement
    | returnStatement
    | expressionStatement
    ;
  
  letStatement
    = id("let"):q ( variable ; p(",") )+:vs
      !{ tag: "LetStatement", loc: q.loc, variables: vs }
    ;
  
  ifStatement
    = id("if"):q expression:c
      ( t("LINE_TERMINATOR")? id("then") expression:t )
      ( t("LINE_TERMINATOR")? else:f | !null:f )
      !{ tag: "IfStatement", loc: q.loc, negated: false, condition: c, consiquent: t, alternative: f }
    ;
  unlessStatement
    = id("unless"):q expression:c
      ( t("LINE_TERMINATOR")? id("then") expression:t )
      ( t("LINE_TERMINATOR")? else:f | !null:f )
      !{ tag: "IfStatement", loc: q.loc, negated: true, condition: c, consiquent: t, alternative: f }
    ;
  else
    = ifStatement
    | unlessStatement
    | id("else") ( expression | block )
    ;
  
  onceStatement
    = id("once"):q ( expression:b | block:b )
      !{ tag: "OnceStatement", loc: q.loc, body: b }
    | block:b
      !{ tag: "OnceStatement", loc: b.loc, body: b }
    ;
  foreverStatement
    = id("forever"):q ( expression:b | block:b )
      !{ tag: "ForeverStatement", loc: q.loc, body: b }
    ;
  
  whileStatement
    = id("while"):q expression:c
      ( tagbody("do"):b | block:b )
      !{ tag: "WhileStatement", loc: q.loc, negated: false, condition: c, body: b }
    ;
  untilStatement
    = id("until"):q expression:c
      ( tagbody("do"):b | block:b )
      !{ tag: "WhileStatement", loc: q.loc, negated: true, condition: c, body: b }
    ;
  
  doWhileStatement
    = id("do"):q ( ~t("{") expression:e | block:b )
      t("LINE_TERMINATOR")? id("while") expression:c
      !{ tag: "DoWhileStatement", loc: q.loc, negated: false, condition: c, body: b }
    ;
  doUntilStatement
    = id("do"):q ( ~t("{") expression:e | block:b )
      t("LINE_TERMINATOR")? id("until") expression:c
      !{ tag: "DoWhileStatement", loc: q.loc, negated: true, condition: c, body: b }
    ;
  
  forStatement
    = id("for"):q
      ( variable ; p(",") )+:vs p(";")
      ( expression ; p(",") )+:cs p(";")
      ( expression ; p(",") )+:is
      ( tagbody("do"):b | block:b )
      !{ tag: "ForStatement", loc: q.loc, variables: vs, conditions: cs, increments: is, body: b }
    ;
  forInStatement
    = id("for"):q local:n id("in") expression:e
      ( tagbody("do"):b | block:b )
      !{ tag: "ForInStatement", loc: q.loc, name: n.value, subject: e, body: b }
    ; 
  
  breakStatement
    = id("break"):q
      !{ tag: "BreakStatement", loc: q.loc }
    ;
  continueStatement
    = id("continue"):q
      !{ tag: "ContinueStatement", loc: q.loc }
    ;
  
  returnStatement
    = id("return"):q expression?:e
      !{ tag: "ReturnStatement", loc: q.loc, expression: e }
    ;
  
  expressionStatement
    = expression:e
      !{ tag: "ExpressionStatement", loc: e.loc, expression: e }
    ;
  
  
  expression
    = logicalInfixExpression
    ;
  
  logicalInfixExpression
    = logicalNotExpression:a
      ( id("or")  logicalNotExpression:b !{ tag: "OrExpression",  loc: a.loc, a: a, b: b }:a
      | id("xor") logicalNotExpression:b !{ tag: "XorExpression", loc: a.loc, a: a, b: b }:a
      | id("and") logicalNotExpression:b !{ tag: "AndExpression", loc: a.loc, a: a, b: b }:a
      )*
      !a
    ;
  
  logicalNotExpression
    = id("not"):q logicalNotExpression:a !{ tag: "NotExpression", loc: q.loc, a: a }
    | setExpression
    ;
  
  setExpression
    = typecastExpression:l p("<-") setExpression:e
      !{ tag: "SetExpression", loc: l.loc, location: l, value: e }
    | typecastExpression
    ;
  
  typecastExpression
    = ternaryExpression:a
      ( id("as") ternaryExpression:t !{ tag: "TypecastExpression", loc: a.loc, type: t, argument: a }:a
      )*
      !a
    ;
  
  ternaryExpression
    = comparisonExpression:c p("?") ternaryExpression:t p(":") ternaryExpression:f
      !{ tag: "TernaryExpression", loc: c.loc, condition: c, consiquent: t, alternative: f }
    | comparisonExpression
    ;
    
  comparisonExpression
    = vectorInfixExpression:a
      ( p("=="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", loc: a.loc, o: "==", a: a, b: b }
      | p("/="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", loc: a.loc, o: "/=", a: a, b: b }
      | p(">="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", loc: a.loc, o: ">=", a: a, b: b }
      | p(">"):o  vectorInfixExpression:b !{ tag: "ComparisonExpression", loc: a.loc, o: ">",  a: a, b: b }
      | p("<="):o vectorInfixExpression:b !{ tag: "ComparisonExpression", loc: a.loc, o: "<=", a: a, b: b }
      | p("<"):o  vectorInfixExpression:b !{ tag: "ComparisonExpression", loc: a.loc, o: "<",  a: a, b: b }
      |                                   !a
      )
    ;
  
  vectorInfixExpression
    = addExpression:a
      ( p("|") addExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "|", a: a, b: b }:a
      | p("^") addExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "^", a: a, b: b }:a
      | p("&") addExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "&", a: a, b: b }:a
      )*
      !a
    ;
  
  addExpression
    = mulExpression:a
      ( p("+") mulExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "+", a: a, b: b }:a
      | p("-") mulExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "-", a: a, b: b }:a
      )*
      !a
    ;
    
  mulExpression
    = expExpression:a
      ( p("*")    expExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "*",   a: a, b: b }:a
      | p("/")    expExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "/",   a: a, b: b }:a
      | id("quo") expExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "quo", a: a, b: b }:a
      | id("rem") expExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "rem", a: a, b: b }:a
      )*
      !a
    ;
  
  expExpression
    = prefixExpression:a
      ( id("exp") prefixExpression:b !{ tag: "InfixExpression", loc: a.loc, o: "exp", a: a, b: b }:a )*
      !a
    ;
    
  prefixExpression
    = p("+"):q secondaryExpression:a !{ tag: "PrefixExpression", loc: q.loc, o: "+", a: a }
    | p("-"):q secondaryExpression:a !{ tag: "PrefixExpression", loc: q.loc, o: "-", a: a }
    | p("~"):q secondaryExpression:a !{ tag: "PrefixExpression", loc: q.loc, o: "~", a: a }
    |          secondaryExpression
    ;
  
  secondaryExpression
    = primaryExpression:e
      ( p(".") id:n p("(") elist:as p(")")  !{ tag: "SendExpression",  loc: e.loc, receiver: e, selector: n.value, arguments: as }:e
      | p(".") id:n                         !{ tag: "FieldExpression", loc: e.loc, subject: e,  name: n.value }:e
      |             p("[") elist:as  p("]") !{ tag: "CallExpression",  loc: e.loc, subject: e,  arguments: as }:e
      |             p("[") kvlist:as p("]") !{ tag: "CallExpression",  loc: e.loc, subject: e,  arguments: as }:e
      |             p("{") elist:as  p("}") !{ tag: "SpecExpression",  loc: e.loc, subject: e,  arguments: as }:e
      )*
      !e
    ;
  
  primaryExpression
    = p("(") expression:a p(")") !a
    
    | local:n p("(") elist:as p(")") !{ tag: "LookupExpression", loc: n.loc, name: n.value, arguments: as }
    | local:n                        !{ tag: "LookupExpression", loc: n.loc, name: n.value, arguments: null }
    
    // | p("["):q expression:i p("..") expression:f p("]") !{ tag: "IntervalExpression", loc: q.loc, initial: { closed: i }, final: { closed: f } }
    // | p("["):q expression:i p("..") expression:f p(")") !{ tag: "IntervalExpression", loc: q.loc, initial: { closed: i }, final: { open:   f } }
    // | p("("):q expression:i p("..") expression:f p("]") !{ tag: "IntervalExpression", loc: q.loc, initial: { open:   i }, final: { closed: f } }
    // | p("("):q expression:i p("..") expression:f p(")") !{ tag: "IntervalExpression", loc: q.loc, initial: { open:   i }, final: { open:   f } }
    
    | t("INTEGER"):q !{ tag: "IntegerLiteral", loc: q.loc, value: q.value }
    | t("STRING"):q  !{ tag: "StringLiteral",  loc: q.loc, value: q.value }
    | id("true"):q   !{ tag: "BooleanLiteral", loc: q.loc, value: true }
    | id("false"):q  !{ tag: "BooleanLiteral", loc: q.loc, value: false }
    ;
  
  
  variable
    = local:n p("<-") expression:e
      !{ tag: "VariableDeclaration", loc: n.loc, name: n.value, value: e }
    ;
  
  
  mixins
    = p("(") ( local ; p(",") )*:ms p(")") !ms
    ;
  
  
  fnbody
    = block
    | tagbody("do")
    | &t("LINE_TERMINATOR") !null
    | &t(";")               !null
    ;
  pbody
    = block
    | tagbody("do")
    ;
  
  
  block
    = t("LINE_TERMINATOR")?
      t("{"):q ( statement ; t(";") )*:ss t(";")? t("}")
      !{ tag: "Block", loc: q.loc, statements: ss }
    | t("LINE_TERMINATOR")?
      t("{"):q t("INDENT")
      ( ( statement ; t(";") )*:ss t(";")? t("LINE_TERMINATOR") !ss )*:sss
      t("DEDENT") t("}")
      !{ tag: "Block", loc: q.loc, statements: sss.flat() }
    ;
  tagbody(tag)
    = t("LINE_TERMINATOR")?
      id(tag) expression
    ;
  
  elist
    = ( expression ; p(",") )*:es p(",")? !es
    | t("INDENT")
      ( ( expression ; p(",") )*:es p(",")? t("LINE_TERMINATOR") !es )*:ess
      t("DEDENT")
      !ess.flat()
    ;
  kvlist
    = ( keyval ; p(",") )*:kvs p(",")? !es
    | t("INDENT")
      ( ( keyval ; p(",") )*:kvs p(",")? t("LINE_TERMINATOR") !kvs )*:kvss
      t("DEDENT")
      !kvss.flat()
    ;
  
  
  type
    = secondaryExpression
    ;
  
  
  parameter
    = local:n p(":") type:t
      !{ tag: "Parameter", loc: n.loc, name: n.value, type: t }
    ;
  vaparam
    = p(",") p("...") !true
    |                 !false
    ;
  
  keyval
    = id:n p(":") expression:v
      !{ tag: "Keyval", loc: n.loc, key: n.value, value: v }
    ;
  
  
  static
    = id("static") !true
    |              !false
    ;
  
  visibility
    = id("public")  !true
    | id("private") !false
    ;
  
  
  local
    = id:i
      ?[
        "let", "fn", "struct", "class", "public", "private", "static",
        "if", "unless",
        "once", "forever", 
        "while", "until", "repeat", "for", "in",
        "break", "continue", 
        "return", 
        "goto",
        "and", "xor", "or", "not",
        "quo", "rem",
        "true", "false", "null"
      ].excludes(i.value)
      !i
    ;
  id(expected)
    = t("IDENTIFIER"):i
      ?((expected != null && expected === i.value) || (expected == null))
      !i
    ;
  p(expected)
    = t(expected)
    ;
  end
    = t("END")
    ;
  
}
