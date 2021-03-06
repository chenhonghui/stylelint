# selector-list-comma-newline-before

Require a newline or disallow whitespace before the commas of selector lists.

```css
    a
    , b { color: pink; }
/** ↑
 * The newline before this comma */
```

[命令行](../../../docs/user-guide/cli.md#自动修复错误)中的 `--fix` 选项可以自动修复此规则报告的所有问题。

## 选项

`string`: `"always"|"always-multi-line"|"never-multi-line"`

### `"always"`

There *must always* be a newline before the commas.

以下模式被视为违规：

```css
a, b { color: pink; }
```

```css
a,
b { color: pink; }
```

以下模式*不*被视为违规：

```css
a
, b { color: pink; }
```

```css
a
,b { color: pink; }
```

### `"always-multi-line"`

There *must always* be a newline before the commas in multi-line selector lists.

以下模式被视为违规：

```css
a,
b { color: pink; }
```

以下模式*不*被视为违规：

```css
a, b { color: pink; }
```

```css
a
,b { color: pink; }
```

```css
a
,
b { color: pink; }
```

### `"never-multi-line"`

There *must never* be whitespace before the commas in multi-line selector lists.

以下模式被视为违规：

```css
a
, b { color: pink; }
```

```css
a
,
b { color: pink; }
```

以下模式*不*被视为违规：

```css
a,b { color: pink; }
```

```css
a,
b { color: pink; }
```
