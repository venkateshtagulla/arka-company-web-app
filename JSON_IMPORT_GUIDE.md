# Form JSON Import Guide

## How to Use JSON Import

The form creation page now supports bulk import of questions **with section headers** via JSON file upload. This is especially useful for forms with 200+ questions organized into sections.

## JSON File Format

Your JSON file must follow this structure:

```json
{
  "items": [
    {
      "type": "section",
      "title": "Section A - ENGINE ROOM"
    },
    {
      "order": 1,
      "prompt": "Your question text here",
      "type": "mcq",
      "options": ["Option 1", "Option 2", "Option 3"]
    },
    {
      "order": 2,
      "prompt": "Another question",
      "type": "text"
    }
  ]
}
```

**Note:** The old format with `"questions"` array (without sections) is still supported for backward compatibility.

## Item Types

### 1. Section Header
```json
{
  "type": "section",
  "title": "Section A - ENGINE ROOM"
}
```

### 2. Multiple Choice Question (MCQ)
```json
{
  "order": 1,
  "prompt": "Is the equipment functioning properly?",
  "type": "mcq",
  "options": ["Yes", "No", "Needs Maintenance", "Defect"]
}
```

### 3. Text Input Question
```json
{
  "order": 2,
  "prompt": "Describe any observations",
  "type": "text"
}
```

### 4. Image Upload Question
```json
{
  "order": 3,
  "prompt": "Upload photo of the equipment",
  "type": "image"
}
```

## Required Fields

### For Sections:
- **type**: Must be `"section"`
- **title**: String, the section name

### For Questions:
- **order**: Integer, must be unique for each question
- **prompt**: String, the question text (1-500 characters)
- **type**: String, one of: `mcq`, `text`, `image`
- **options**: Array of strings, **required only for MCQ type**

## Example: Large Form with 248 Questions

```json
{
  "items": [
    {
      "type": "section",
      "title": "Section A - ENGINE ROOM (Q1-50)"
    },
    {
      "order": 1,
      "prompt": "Engine room temperature normal?",
      "type": "mcq",
      "options": ["Yes", "No", "Defect"]
    },
    {
      "order": 2,
      "prompt": "Oil pressure reading",
      "type": "text"
    },
    // ... questions 3-50
    {
      "type": "section",
      "title": "Section B - DECK EQUIPMENT (Q51-100)"
    },
    {
      "order": 51,
      "prompt": "Deck cleanliness status",
      "type": "mcq",
      "options": ["Clean", "Needs Cleaning", "Hazardous"]
    },
    // ... questions 52-100
    {
      "type": "section",
      "title": "Section C - SAFETY SYSTEMS (Q101-150)"
    },
    // ... questions 101-150
    {
      "type": "section",
      "title": "Section D - ELECTRICAL (Q151-200)"
    },
    // ... questions 151-200
    {
      "type": "section",
      "title": "Section E - FINAL CHECKS (Q201-248)"
    },
    // ... questions 201-248
    {
      "order": 248,
      "prompt": "Final inspection notes",
      "type": "text"
    }
  ]
}
```

## How to Import

1. Go to **Forms** → **Create Form**
2. Fill in the form details (Step 1)
3. Click **Next** to go to Step 2 (Add Questions)
4. Click the **"Import from JSON"** button in the top right
5. Select your JSON file
6. Questions and sections will be automatically loaded
7. Review and edit as needed
8. Continue to preview and publish

## Tips

- ✅ Use sections to organize questions logically
- ✅ Section titles can include question ranges (e.g., "Section A - ENGINE (Q1-50)")
- ✅ Validate your JSON before uploading (use jsonlint.com)
- ✅ Keep question orders sequential (1, 2, 3, ...)
- ✅ MCQ questions must have at least one option
- ✅ Text and Image questions don't need options
- ✅ You can edit imported questions and sections after upload
- ✅ Import will replace existing questions
- ✅ Backward compatible with old `"questions"` array format

## Organizing 248 Questions

For large forms, organize into logical sections:

```
Section A - ENGINE ROOM (Q1-50)
Section B - DECK EQUIPMENT (Q51-100)
Section C - SAFETY SYSTEMS (Q101-150)
Section D - ELECTRICAL (Q151-200)
Section E - FINAL CHECKS (Q201-248)
```

This makes the form easier to navigate and fill out!

## Error Messages

- **"Invalid JSON format. Expected an 'items' or 'questions' array."** - Your JSON must have a root `items` or `questions` array
- **"Failed to parse JSON file."** - Check for syntax errors in your JSON
- **"Failed to read file."** - Try uploading the file again

## Need Help?

Check the sample template: `sample-form-template.json`
