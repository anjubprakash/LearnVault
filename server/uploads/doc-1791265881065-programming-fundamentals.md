# Programming Fundamentals – Theoretical Concepts

> **Simple theory + one practical example for each concept**  
> **Purpose:** Build a language-independent understanding of the basic concepts used to solve coding problems. The core ideas are mostly common across programming languages, while syntax and some behavior can differ.

---

## 1. Big Picture

Programming fundamentals can be viewed in two layers: the **concept** and the **syntax**. The concept is usually transferable between languages; the syntax is the language-specific way of writing it.

### Example
**Concept:** Store the number 25 in a variable named `age`.

```java
// Java
int age = 25;
```

```python
# Python
age = 25
```

```javascript
// JavaScript
let age = 25;
```

> **Remember:** Same idea → different syntax.

---

## 2. Data Types & Variables

### Variable
A variable is a named place used to store a value so the program can use or change that value later.

```text
age = 25
name = "Angel"
```

### Data Type
A data type describes what kind of value is being stored and what operations are appropriate for it.

#### Common Types:
- **`int`** – whole numbers, e.g., `25`
- **`float` / `double`** – decimal numbers, e.g., `25.5`
- **`char`** – a single character, e.g., `'A'`
- **`boolean` / `bool`** – `true` or `false`
- **`String`** – text, e.g., `"Hello"`
- **`Array`** – a collection of values, e.g., `[10, 20, 30]`

### Simple Mental Model
A variable is like a labelled box. The variable name is the label and the stored value is what is inside the box.

### Language Difference
The idea is common, but declaration rules differ. Java and C# are strongly typed, while Python allows a simpler dynamic declaration syntax.

---

## 3. Classes & Methods

### Class
A class is a blueprint/template that describes the data and behavior an object can have.

```text
Class: Car
Data: color, model, speed
Behavior: start(), stop(), accelerate()
```

### Method / Function
A method or function is a reusable block of code designed to perform a particular task.

```java
int add(int a, int b) {
    return a + b;
}

add(10, 20)  // →  30
```

### Main Method
In languages such as Java or C#, `main()` is the conventional entry point from which program execution begins.

### Language Difference
Functions exist in many languages, but classes are not required everywhere. The exact main-program structure also differs by language.

> **Important for basic coding:** Learn functions/methods early. Deep object-oriented programming is not required before starting basic problem solving.

---

## 4. Operators

An operator is a symbol or keyword used to perform an operation on one or more values.

### 4.1 Arithmetic Operators
- `+` addition
- `-` subtraction
- `*` multiplication
- `/` division
- `%` remainder (modulo)

```text
10 + 5 = 15
10 - 5 = 5
10 * 5 = 50
10 % 3 = 1
```

### 4.2 Increment / Decrement
- `x++` → increase x by 1
- `x--` → decrease x by 1

> **Note:** `++` and `--` are not available in every language; Python, for example, does not use them (uses `x += 1`).

### 4.3 Comparison Operators
- `==` equal to
- `!=` not equal to
- `>` greater than
- `<` less than
- `>=` greater than or equal to
- `<=` less than or equal to

```text
10 > 5   // → true
10 == 5  // → false
```

### 4.4 Logical Operators
- **AND (`&&`, `and`):** Both conditions must be true.
  ```text
  age > 18 && age < 60
  ```
- **OR (`||`, `or`):** At least one condition must be true.
  ```text
  age < 18 || age > 60
  ```
- **NOT (`!`, `not`):** Reverses a boolean result.
  ```text
  !true // → false
  ```

### Language Difference
The logical idea is common, but symbols/keywords can differ. Java/C#/JS use `&&`, `||`, `!`; Python commonly uses `and`, `or`, `not`.

---

## 5. Control Statements

A control statement controls which code runs, when it runs, and how many times it runs.

### 5.1 if-else
**Purpose:** Used to make a decision based on a condition.

```python
if age >= 18:
    print("Eligible")
else:
    print("Not eligible")
```

> **Mental model:** Condition? → YES: do one thing | NO: do another thing.

### 5.2 for Loop
**Purpose:** Used to repeat code, especially when the number of iterations or a counting pattern is known.

```text
for i from 1 to 5:
    print(i)
// Output: 1 2 3 4 5
```

### 5.3 while Loop
**Purpose:** Repeats code while a condition remains true. It is useful when the number of iterations is not necessarily known in advance.

```text
while password_is_wrong:
    ask_for_password_again
```

### 5.4 foreach Loop
**Purpose:** Processes each element of a collection one by one, usually without manually managing an index.

```text
numbers = [10, 20, 30, 40]
for each number in numbers:
    print(number)
```

### 5.5 break
**Purpose:** Immediately stops and terminates the current loop.

```text
for number in 1..5:
    if number == 3:
        break
// Output: 1 2 3
```

### 5.6 continue
**Purpose:** Skips the rest of the current iteration and moves to the next iteration.

```text
for number in 1..5:
    if number == 3:
        continue
    print(number)
// Output: 1 2 4 5
```

### 5.7 return
**Purpose:** Sends a value back from a function and normally ends that function's execution.

```java
int add(int a, int b) {
    return a + b;
}

add(10, 20) // → 30
```

---

## 6. Arrays & Strings

### 6.1 Array
An array stores multiple values together so they can be accessed as elements.

```text
numbers = [10, 20, 30, 40, 50]
Index:     0   1   2   3   4
Value:    10  20  30  40  50

numbers[0] → 10
numbers[2] → 30
```

**Index:** An index identifies the position of an element. Many mainstream languages use zero-based indexing, meaning the first element is at index 0.

### 6.2 String
A string represents text and can be treated as a sequence of characters.

```text
"Hello World"
Characters: H e l l o   W o r l d
```

### 6.3 length
**Purpose:** Finds the number of characters in a string or elements in a collection/array, depending on the language.

```text
"Hello"        → length 5
[10, 20, 30]   → length 3
```

*Syntax differs:* Java String uses `str.length()`; Java arrays use `arr.length`; JavaScript uses `str.length` / `arr.length`; Python uses `len(str)` / `len(arr)`.

### 6.4 indexOf
**Purpose:** Finds the position/index of a character or substring.

```text
"hello"
indexOf("e") → 1
```

### 6.5 substring
**Purpose:** Extracts part of a string.

```text
"Hello World" → extract → "World"
```
*Important:* Start/end index rules differ between languages.

### 6.6 sort
**Purpose:** Arranges values into an order, commonly ascending or descending.

```text
[5, 2, 8, 1] → [1, 2, 5, 8]
```

### 6.7 replace
**Purpose:** Replaces one piece of text with another.

```text
"Hello Angel"
replace Angel with John → "Hello John"
```

### 6.8 trim
**Purpose:** Removes leading and trailing whitespace from a string.

```text
"   Hello   " → "Hello"
```
*(Does not remove spaces between words)*

### 6.9 split
**Purpose:** Breaks a string into multiple pieces using a separator.

```text
"apple,banana,mango"
split by comma → ["apple", "banana", "mango"]
```
*Note:* `split()` is especially common when processing user input or text files.

---

## 7. What Is Common Across Programming Languages?

The underlying programming ideas are mostly transferable. What changes is the syntax, standard library/API names, type system, and some language-specific behavior.

| Topic | Concept | What can differ? |
| :--- | :--- | :--- |
| **Variables** | Mostly common | How variables are declared/typed differs. |
| **Data types** | Mostly common | Available types and type rules differ. |
| **Operators** | Mostly common | Symbols/keywords can differ. |
| **if/else** | Common | Syntax differs. |
| **Loops** | Common | Loop forms and syntax differ. |
| **Functions** | Common | Declaration/calling syntax differs. |
| **Classes** | Not universal | Central in Java/C#/C++; optional or used differently in other languages. |
| **Strings/arrays** | Common idea | Methods, mutability, indexing, and APIs differ. |

---

## 8. Recommended Learning Order for Basic Coding Problems

1. Variables & Data Types
2. Operators
3. `if` / `else` conditions
4. `for`, `while`, and `foreach` loops
5. Functions / Methods
6. Arrays
7. Strings
8. Array/String operations
9. Nested loops
10. Basic problem-solving patterns

---

## 9. Quick Revision

- **Variable** → stores a value.
- **Data type** → tells what kind of value it is.
- **Function/Method** → reusable block of code.
- **Operator** → performs an operation.
- **if/else** → makes a decision.
- **Loop** → repeats code.
- **break** → stops the loop.
- **continue** → skips the current iteration.
- **return** → sends a result back from a function.
- **Array** → stores multiple values.
- **String** → stores text.
- **split** → breaks text into pieces.
- **sort** → arranges values.
- **replace** → changes matching text.
- **trim** → removes outer whitespace.

> **Study principle:** Learn the logic first, then learn the syntax of the language you are using.
