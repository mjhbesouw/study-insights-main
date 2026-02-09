# Deep Learning Segmentation Study

A minimalist, accessible questionnaire application for evaluating AI-generated radiotherapy segmentations.

## Features

- **Multi-step questionnaire workflow** with progress tracking and autosave
- **Config-driven questions** - easily customize questions without changing UI code
- **Conditional logic** - show/hide questions based on previous answers
- **Offline support** - queues failed requests for retry
- **PDF receipt generation** - download completion certificate
- **Accessible design** - keyboard navigation, focus states, good contrast

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Supabase tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Participants table
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  center TEXT,
  role TEXT,
  experience TEXT,
  familiarity INTEGER
);

-- Consent table
CREATE TABLE consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT REFERENCES participants(id),
  consented_at TIMESTAMPTZ,
  items_json JSONB,
  name TEXT,
  email TEXT,
  center TEXT
);

-- Answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT REFERENCES participants(id),
  step TEXT NOT NULL,
  case_id TEXT,
  item_id TEXT NOT NULL,
  value_json JSONB,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, step, case_id, item_id)
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT REFERENCES participants(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completion_code TEXT
);

-- Enable RLS (configure policies as needed)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
```

### 4. Configure RLS policies

Set up Row Level Security policies according to your requirements. The app uses anonymous session IDs stored in localStorage.

### 5. Run the app

```bash
npm run dev
```

## Customizing the Questionnaire

### Configuration location

Edit `src/config/questionnaireConfig.ts` to customize:

- **Profile questions** - participant demographics
- **Segmentation cases** - up to 30 cases with up to 9 questions each
- **Turing test cases** - comparison questions
- **Feedback questions** - final feedback section

### Question types

- `likert` - 1-5 scale with labels
- `text` - free text input
- `dropdown` - select from options
- `choice` - radio buttons
- `toggle` - boolean switch
- `slider` - numeric slider

### Conditional logic

Add `show_if` to any question:

```typescript
{
  id: 'explanation',
  type: 'text',
  label: 'Please explain',
  show_if: {
    source_question_id: 'rating',
    operator: 'lte',  // equals, not_equals, lt, lte, gt, gte, includes
    value: 3
  }
}
```

### Example: Adding a new case

```typescript
{
  case_id: 'case_new',
  display_name: 'New Case',
  questions: [
    {
      id: 'quality',
      type: 'likert',
      label: 'Overall quality',
      required: true,
      likert_config: { min: 1, max: 5 }
    },
    // Add more questions...
  ]
}
```

## Exporting Data from Supabase

### Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to Table Editor
3. Select the table (participants, consent, answers, submissions)
4. Click "Export" and choose CSV or JSON

### Via SQL

```sql
-- Export all completed submissions with answers
SELECT 
  s.participant_id,
  s.completion_code,
  s.submitted_at,
  a.step,
  a.case_id,
  a.item_id,
  a.value_json,
  a.comment
FROM submissions s
JOIN answers a ON a.participant_id = s.participant_id
ORDER BY s.participant_id, a.step, a.case_id;
```

### Via API

```bash
curl 'https://your-project.supabase.co/rest/v1/answers' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

## File Structure

```
src/
├── config/
│   └── questionnaireConfig.ts    # ← PASTE YOUR CONFIG HERE
├── components/
│   └── questionnaire/
│       ├── Stepper.tsx
│       ├── QuestionGroup.tsx
│       ├── QuestionRenderer.tsx
│       ├── LikertScale.tsx
│       └── steps/
│           ├── ProfileStep.tsx
│           ├── SegmentationStep.tsx
│           ├── TuringStep.tsx
│           └── FeedbackStep.tsx
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── dataLayer.ts             # Data operations
│   └── conditionEvaluator.ts    # Conditional logic
├── types/
│   └── questionnaire.ts         # TypeScript interfaces
└── pages/
    ├── Landing.tsx
    ├── StudyInfo.tsx
    ├── Consent.tsx
    ├── Questionnaire.tsx
    └── ThankYou.tsx
```

## Privacy & Security

- No patient data is displayed or collected
- Only pseudonymous case identifiers are used
- Personal information is stored separately from questionnaire responses
- All data is transmitted over HTTPS
- Responses are stored in Supabase with RLS enabled

## Support

For questions about the study, contact: [researcher@institution.edu]
