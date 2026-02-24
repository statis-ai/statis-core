# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - heading "Statis Console" [level=1] [ref=e4]
      - paragraph [ref=e5]: Account Inspector — debug any entity end-to-end
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Entity Type
        - combobox [ref=e10]:
          - option "account" [selected]
          - option "user"
          - option "order"
          - option "ticket"
          - option "subscription"
      - generic [ref=e11]:
        - generic [ref=e12]: Entity ID
        - textbox "e.g. acct-001" [ref=e13]: pw-test-1771777928157
      - button "Inspect" [ref=e14] [cursor=pointer]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - button "State" [ref=e17] [cursor=pointer]
        - button "Timeline" [ref=e18] [cursor=pointer]
        - button "Diff" [ref=e19] [cursor=pointer]
        - button "Deliveries" [ref=e20] [cursor=pointer]
      - paragraph [ref=e22]: "API 404: {\"detail\":\"Not Found\"}"
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - img [ref=e29]
  - alert [ref=e32]
```