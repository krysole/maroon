A Meta Compiler Language
========================

This is a meta compiler language, also known as a parser generator, designed
to be simple and easy to build from scratch. Such a tool demonstrates that we
can go from conventional programming languages to possessing the ability to
implement fairly complex Problem Oriented Languages, also known as Domain 
Specific Languages, allowing us to focus on more challenging problems.

This particalar implementation is accompanied by a tutorial that can be found
[here](https://alexicalmistake.com/2018/09/meta-1).

`Parser.g` provides an example grammar written in the language.

The `meta` program can be used to compile grammars into self-contained Node/JS
compatable JavaScript modules.

```
./meta -o Parser.js Parser.g
```
