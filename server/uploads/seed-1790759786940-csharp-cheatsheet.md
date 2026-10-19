# C# Quick Reference Cheat Sheet

## Nullable Reference Types
```csharp
string? name = null;
Console.WriteLine(name?.Length ?? 0);
```

## Pattern Matching
```csharp
string Describe(object obj) => obj switch {
    int i => $"Integer {i}",
    string s => $"String length {s.Length}",
    null => "Null object",
    _ => "Unknown type"
};
```

## Records
```csharp
public record User(int Id, string Name, string Email);
```
