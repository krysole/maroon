TASKLIST
========

- Finish drafting `Parser.g`, and then test it a little.
- Write `build.js` program for running the compiler against the test program.

- Implement `inline` expression declarations.
- Implement `inline` function declarations.
- Implement `enum` declarations.
- Implement floating point.


```
-- Assignment to local or global variable.
var_name = 42;

-- Assignment to struct field.
(expr).field_name = 42;

-- Assignment to dereferenced pointer.
[expr] = 42;

-- Assignment to array field.
(expr)[index] = 42;
```
