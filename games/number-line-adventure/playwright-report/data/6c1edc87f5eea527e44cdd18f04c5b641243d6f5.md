# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Number Line Adventure" [level=1] [ref=e5]
      - paragraph [ref=e6]: Welcome back!
    - generic [ref=e7]:
      - generic [ref=e8]:
        - button "Sign In" [ref=e9] [cursor=pointer]
        - button "Sign Up" [ref=e10] [cursor=pointer]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - text: Email
          - textbox "Email" [ref=e13]:
            - /placeholder: you@example.com
        - generic [ref=e14]:
          - text: Password
          - textbox "Password" [ref=e15]:
            - /placeholder: ••••••••
        - button "Sign In" [ref=e16] [cursor=pointer]
        - button "Forgot password?" [ref=e18] [cursor=pointer]
    - paragraph [ref=e20]:
      - text: Don't have an account?
      - button "Sign up" [ref=e21] [cursor=pointer]
  - status [ref=e22]:
    - generic [ref=e23]:
      - img [ref=e25]
      - generic [ref=e27]:
        - text: Static route
        - button "Hide static indicator" [ref=e28] [cursor=pointer]:
          - img [ref=e29]
  - alert [ref=e32]
```