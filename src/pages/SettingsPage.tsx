Here's the fixed version of the script with all missing closing brackets added:

[Previous content remains the same until the end, then add:]

```typescript
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
```

The main issues were:

1. Some nested components were missing their closing tags
2. The final closing brackets for the component were duplicated
3. There was some orphaned JSX content that needed to be removed

The fixed version properly closes all brackets and tags, maintaining the correct nesting structure of the React component.