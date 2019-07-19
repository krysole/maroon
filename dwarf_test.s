  .section  __TEXT,__text,regular,pure_instructions
  .build_version macos, 10, 14  sdk_version 10, 14
  .file  1 "/Users/krysole/Documents/maroon-2019-06-01" "dwarf_test.mn"
L__code__begin:

  .globl   _main
  .p2align 4, 0x90
_main:
L__main__prologue:
  .loc  1 9 0                            ## main.mn:9:1
  .cfi_startproc
  pushq %rbp
  .cfi_def_cfa_offset 16
  .cfi_offset %rbp, -16
  movq  %rsp, %rbp
  subq  $16, %rsp
  .cfi_def_cfa_register %rbp ## TODO I think that this is in the wrong place.
L__main__0:
  .loc  1 10 3 prologue_end              ## main.mn:10:3
  movq  _printf@GOTPCREL(%rip), %rax
  movq  %rax, -8(%rbp)
  leaq  L__string__0(%rip), %rax
  movq  %rax, -16(%rbp)
  movq  -8(%rbp), %r11
  movq  -16(%rbp), %rdi
  callq *%r11
  movl  %eax, -4(%rbp)
  .loc  1 12 3                           ## main.mn:12:3
  movq  _exit@GOTPCREL(%rip), %rax
  movq  %rax, -8(%rbp)
  movl  $0, %eax
  movl  %eax, -12(%rbp)
  movq  -8(%rbp), %r11
  movq  -12(%rbp), %rdi
  callq *%r11
L__main__epilogue:
  .loc  1 13 1                           ## main.mn:13:1
  ## TODO Figure out what the .cfi should be here during the epilogue sequence.
  addq  $16, %rsp
  popq  %rbp
  retq
L__main__end:
  .cfi_endproc

L__code__end:


  .section __TEXT,__string,cstring_literals
L__string__0:
  .asciz   "Hello world.\n"
  
  
  .section  __DWARF,__debug_abbrev,regular,debug
Lsection_abbrev:
  .byte  0x01                            ##  Abbreviation Code
  .byte  0x11                            ##  DW_TAG_compile_unit
  .byte  0x01                            ##  DW_CHILDREN_yes
  .byte  0x25                            ##  DW_AT_producer
  .byte  0x08                            ##                  DW_FORM_string
  .byte  0x13                            ##  DW_AT_language
  .byte  0x05                            ##                  DW_FORM_data2
  .byte  0x1b                            ##  DW_AT_comp_dir
  .byte  0x08                            ##                  DW_FORM_string
  .byte  0x03                            ##  DW_AT_name
  .byte  0x08                            ##                  DW_FORM_string
  .byte  0x11                            ##  DW_AT_low_pc
  .byte  0x01                            ##                  DW_FORM_addr
  .byte  0x12                            ##  DW_AT_high_pc
  .byte  0x06                            ##                  DW_FORM_data4
  .byte  0x10                            ##  DW_AT_stmt_list
  .byte  0x17                            ##                  DW_FORM_sec_offset
  .byte  0x00                            ##  Null Attribute
  .byte  0x00                            ##  Null Format
  
  .byte  0x02                            ##  Abbreviation Code
  .byte  0x2e                            ##  DW_TAG_subprogram
  .byte  0x01                            ##  DW_CHILDREN_yes
  .byte  0x03                            ##  DW_AT_name
  .byte  0x08                            ##                  DW_FORM_string
  .byte  0x6e                            ##  DW_AT_linkage_name
  .byte  0x08                            ##                   DW_FORM_string
  .byte  0x3a                            ##  DW_AT_decl_file
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x3b                            ##  DW_AT_decl_line
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x39                            ##  DW_AT_decl_column
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x3f                            ##  DW_AT_external
  .byte  0x0c                            ##                  DW_FORM_flag
  .byte  0x49                            ##  DW_AT_type
  .byte  0x13                            ##                  DW_FORM_ref4
  .byte  0x11                            ##  DW_AT_low_pc
  .byte  0x01                            ##                  DW_FORM_addr
  .byte  0x12                            ##  DW_AT_high_pc
  .byte  0x06                            ##                  DW_FORM_data4
  .byte  0x40                            ##  DW_AT_frame_base
  .byte  0x18                            ##                  DW_FORM_exprloc
  .word  0x3fe7                          ##  DW_AT_APPLE_omit_frame_ptr
  .byte  0x19                            ##                  DW_FORM_flag_present
  .byte  0x00                            ##  Null Attribute
  .byte  0x00                            ##  Null Format
  
  .byte  0x03                            ##  Abbreviation Code
  .byte  0x05                            ##  DW_TAG_formal_parameter
  .byte  0x00                            ##  DW_CHILDREN_no
  .byte  0x03                            ##  DW_AT_name
  .byte  0x08                            ##                  DW_FORM_string
  .byte  0x3a                            ##  DW_AT_decl_file
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x3b                            ##  DW_AT_decl_line
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x39                            ##  DW_AT_decl_column
  .byte  0x08                            ##                  DW_FORM_data1
  .byte  0x49                            ##  DW_AT_type
  .byte  0x13                            ##                  DW_FORM_ref4
  .byte  0x02                            ##  DW_AT_location
  .byte  0x18                            ##                  DW_FORM_exprloc
  .byte  0x00                            ##  Null Attribute
  .byte  0x00                            ##  Null Format
  
  .byte  0x04                            ##  Abbreviation Code
  .byte  0x18                            ##  DW_TAG_unspecified_parameters
  .byte  0x00                            ##  DW_CHILDREN_no
  .byte  0x00                            ##  Null Attribute
  .byte  0x00                            ##  Null Format
  
  .byte  0x05                            ##  Abbreviation Code
  .byte  0x24                            ##  DW_TAG_base_type
  .byte  0x00                            ##  DW_CHILDREN_no
  .byte  0x03                            ##  DW_AT_name
  .byte  0x08                            ##                  DW_FORM_string
  .byte  0x3e                            ##  DW_AT_encoding
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x0b                            ##  DW_AT_byte_size
  .byte  0x0b                            ##                  DW_FORM_data1
  .byte  0x00                            ##  Null Attribute
  .byte  0x00                            ##  Null Format
  
  .byte  0x06                            ##  Abbreviation Code
  .byte  0x0f                            ##  DW_TAG_pointer_type
  .byte  0x00                            ##  DW_CHILDREN_no
  .byte  0x49                            ##  DW_AT_type
  .byte  0x13                            ##                  DW_FORM_ref4
  .byte  0x00                            ##  Null Attribute
  .byte  0x00                            ##  Null Format
  
  .byte  0x00                            ##  Null Abbreviation
  
  
  .section  __DWARF,__debug_info,regular,debug
  
L__info__begin:
  .set   L__set__0, L__info__end-L__info__begin-4
  .long  L__set__0                       ##  Length of Unit
  .word  4                               ##  DWARF Version Number
  .long  0                               ##  Abbreviation Section Offset
  .byte  8                               ##  Machine Address Word Size
  
  .byte  0x01                            ##  DW_TAG_compile_unit [0x01]
  .asciz "maroon-0.1"                    ##  DW_AT_producer:     DW_FORM_string
# .word  0xff00 # [Maroon|Fluorite]      ##  DW_AT_language:     DW_FORM_data2
  .word  0x000c # [C99]                  ##  DW_AT_language:     DW_FORM_data2
  .asciz "/Users/krysole/Documents/maroon-2019-06-01"
                                         ##  DW_AT_comp_dir:     DW_FORM_string
  .asciz "dwarf_test.o"                  ##  DW_AT_name:         DW_FORM_string
  .quad  L__code__begin                  ##  DW_AT_low_pc:       DW_FORM_addr
  .set   L__set__1, L__code__end-L__code__begin
  .long  L__set__1                       ##  DW_AT_high_pc:      DW_FORM_data4
  .long  0                               ##  DW_AT_stmt_list:    DW_FORM_sec_offset

L__info__main:
  .byte  0x02                            ##  DW_TAG_subprogram [0x02]
  .asciz "main"                          ##  DW_AT_name:         DW_FORM_string
  .asciz "_main"                         ##  DW_AT_linkage_name: DW_FORM_string       
  .byte  1                               ##  DW_AT_decl_file:    DW_FORM_data1
  .byte  9                               ##  DW_AT_decl_line:    DW_FORM_data1
  .byte  1                               ##  DW_AT_decl_column:  DW_FORM_data1
  .byte  0x01                            ##  DW_AT_external:     DW_FORM_flag
  .set   L__set__2, L__info__i32-L__info__begin
  .long  L__set__2                       ##  DW_AT_type:         DW_FORM_ref4
  .quad  L__main__prologue               ##  DW_AT_low_pc:       DW_FORM_addr
  .set   L__set__3, L__main__end-L__main__prologue
  .long  L__set__3                       ##  DW_AT_high_pc:      DW_FORM_data4
  .byte  1                               ##  DW_AT_frame_base:   DW_FORM_exprloc
  .byte  0x50+6                          ##  DW_OP_reg6 (%rbp)
                                         ##  DW_AT_APPLE_omit_frame_ptr: DW_FORM_flag_present
                                         ##  no parameters
                                         ##  no varargs
  .byte  0x00                            ##  end

L__info__i32:
  .byte  0x05                            ##  DW_TAG_base_type [0x05]
  .asciz "i32"                           ##  DW_AT_name:         DW_FORM_string
  .byte  0x05                            ##  DW_AT_encoding:     DW_FORM_data1
  .byte  4                               ##  DW_AT_byte_size:    DW_FORM_data1

  .byte  0x00                            ##  end

L__info__end:
