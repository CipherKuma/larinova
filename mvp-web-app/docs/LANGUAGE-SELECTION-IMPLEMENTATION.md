# Language Selection Implementation Guide

## ✅ What's Already Done:

1. **API Updated** (`/app/api/transcribe/route.ts`):
   - Accepts `doctorLanguage` and `patientLanguage` parameters
   - When **same language**: Forces that language, sets `speakers_expected: 2` for better diarization
   - When **different languages**: Uses language detection restricted to those 2 languages

2. **Language Selector Component Created** (`/components/consultation/LanguageSelector.tsx`):
   - UI for selecting doctor and patient languages
   - Shows helpful info about same vs. different language modes

3. **State Variables Added** to TranscriptionViewDeepgram:
   - `showLanguageSetup`, `doctorLanguage`, `patientLanguage`
   - Refs: `doctorLanguageRef`, `patientLanguageRef`

## 📝 Remaining Frontend Changes Needed:

Add this code to `/components/consultation/TranscriptionViewDeepgram.tsx`:

### 1. Import the LanguageSelector component (top of file):
```typescript
import { LanguageSelector } from './LanguageSelector';
```

### 2. In the `transcribeAudioChunk` function, update speaker detection logic (around line 224):

Replace this:
```typescript
// Determine speaker: First speaker (A) = doctor, others = patient
let speaker: 'doctor' | 'patient';
if (firstSpeakerIdRef.current === null) {
  firstSpeakerIdRef.current = utterance.speaker;
  speaker = 'doctor';
} else {
  speaker = utterance.speaker === firstSpeakerIdRef.current ? 'doctor' : 'patient';
}
```

With this:
```typescript
// Determine speaker using language as a hint if languages differ
let speaker: 'doctor' | 'patient';

if (doctorLanguageRef.current !== patientLanguageRef.current) {
  // Different languages: Use language detection as primary indicator
  const isArabic = /[\u0600-\u06FF]/.test(text);
  const detectedLang = isArabic ? 'ar' : 'en';

  if (detectedLang === doctorLanguageRef.current) {
    speaker = 'doctor';
  } else if (detectedLang === patientLanguageRef.current) {
    speaker = 'patient';
  } else {
    // Fallback to speaker ID if language doesn't match
    if (firstSpeakerIdRef.current === null) {
      firstSpeakerIdRef.current = utterance.speaker;
      speaker = 'doctor';
    } else {
      speaker = utterance.speaker === firstSpeakerIdRef.current ? 'doctor' : 'patient';
    }
  }
} else {
  // Same language: Use speaker diarization only (now more accurate due to speakers_expected=2)
  if (firstSpeakerIdRef.current === null) {
    firstSpeakerIdRef.current = utterance.speaker;
    speaker = 'doctor';
  } else {
    speaker = utterance.speaker === firstSpeakerIdRef.current ? 'doctor' : 'patient';
  }
}
```

### 3. Add language selector UI to the return statement (before the transcription view):

Find the `return (` statement and add this right after the opening `<div>`:

```typescript
{showLanguageSetup && !isRecording && (
  <LanguageSelector
    onConfirm={(doctorLang, patientLang) => {
      setDoctorLanguage(doctorLang);
      setPatientLanguage(patientLang);
      setShowLanguageSetup(false);
    }}
  />
)}

{!showLanguageSetup && (
  <>
    {/* Existing transcription UI goes here */}
  </>
)}
```

## 🎯 How It Works:

### Same Language Mode (e.g., both English):
- Forces AssemblyAI to use that specific language
- Sets `speakers_expected: 2` for improved 2-person diarization
- Transcribes in that language with opposite language subtitles

### Different Language Mode (e.g., English + Arabic):
- Uses language detection restricted to those 2 languages
- **Uses language as a speaker cue**: Arabic speaker = one person, English speaker = another
- Much more accurate speaker differentiation!

## 🚀 Benefits:

1. **Better accuracy** when both speak same language (due to `speakers_expected: 2`)
2. **Much better speaker detection** when languages differ (language becomes a cue)
3. **User control** over expected languages
4. **Faster processing** (limited language detection)
