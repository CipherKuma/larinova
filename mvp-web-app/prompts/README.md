# Larinova MVP - Execution Prompts

This directory contains all the execution prompts for building the Larinova MVP web application.

## Prompt Execution Order

Execute these prompts sequentially in Claude Code. Each prompt will:
- Build the specified feature
- Automatically run tests using Bash/Supabase CLI
- Verify functionality with real data
- Report results back to you

**No manual testing required!** Just copy each prompt and let Claude Code handle everything.

---

## Prompts Overview

### ✅ Completed (Prompts 1-4)

- **Prompt 1**: Project initialization ✅
- **Prompt 2**: Database migrations ✅
- **Prompt 3**: Authentication system ✅
- **Prompt 4**: Dashboard layout ✅

### 📋 Remaining Prompts (Execute in Order)

| Prompt | File | Feature | Status |
|--------|------|---------|--------|
| **5** | `5.md` | Patient List with Search | ⏳ Ready |
| **6** | `6.md` | Patient Detail Page | ⏳ Ready |
| **7** | `7.md` | Consultation Infrastructure | ⏳ Ready |
| **8** | `8.md` | Consultation UI | ⏳ Ready |
| **9** | `9.md` | Prescription System | ⏳ Ready |
| **10** | `10.md` | Email Automation | ⏳ Ready |
| **11** | `11.md` | End-to-End Testing | ⏳ Ready |
| **12** | `12.md` | Final UI Polish | ⏳ Ready |

---

## How to Use

### Step 1: Open Prompt File
```bash
cat prompts/5.md
```

### Step 2: Copy Entire Content
Copy the entire prompt content from the file.

### Step 3: Paste to Claude Code
Paste it into Claude Code and press Enter.

### Step 4: Wait for Results
Claude Code will:
1. Build the feature
2. Run all tests automatically
3. Create test data
4. Report results

### Step 5: Review & Continue
Review the results, then move to next prompt.

---

## Quick Reference

### Prompt 5: Patient List
- Builds patient table with search
- Auto-creates 5 test patients
- Tests search functionality
- Verifies patient codes (KP-2026-XXXX)

### Prompt 6: Patient Detail
- Builds detail page with tabs
- Auto-creates health records
- Auto-creates insurance policies
- Tests all tab views

### Prompt 7: Consultation Infrastructure
- Sets up AssemblyAI integration
- Creates consultation APIs
- Auto-creates test consultation
- Adds mock transcripts

### Prompt 8: Consultation UI
- Builds real-time transcription UI
- Auto-creates multiple consultations
- Tests speaker differentiation
- Verifies transcript display

### Prompt 9: Prescription System
- Builds medicine search
- Creates prescription form
- Auto-creates test prescriptions
- Tests medicine autocomplete

### Prompt 10: Email Automation
- Integrates Resend email
- Creates email templates
- Tests email sending
- Tracks email delivery

### Prompt 11: E2E Testing
- Creates 10 diverse patients
- Populates all related data
- Generates comprehensive test dataset
- Verifies data integrity

### Prompt 12: Final Polish
- UI consistency review
- Adds loading/empty states
- Improves accessibility
- Final system verification

---

## Execution Checklist

Copy this checklist and mark as you go:

```
- [ ] Prompt 5: Patient List ← START HERE
- [ ] Prompt 6: Patient Detail
- [ ] Prompt 7: Consultation Infrastructure
- [ ] Prompt 8: Consultation UI
- [ ] Prompt 9: Prescription System
- [ ] Prompt 10: Email Automation
- [ ] Prompt 11: End-to-End Testing
- [ ] Prompt 12: Final Polish
```

---

## Important Notes

### Auto-Testing
Each prompt includes **AUTO-TEST** sections that:
- Run automatically via Bash tool
- Create test data in Supabase
- Verify functionality
- Report results

**You don't need to run any CLI commands manually!**

### CLI Commands Included
All prompts use:
- `supabase db remote shell -c "SQL"`
- Bash commands for testing
- Automated verification

### Error Handling
If a prompt fails:
1. Review the error message
2. Check env variables are set
3. Verify Supabase connection
4. Re-run the prompt

### Dependencies
Make sure you have:
- ✅ Supabase CLI logged in
- ✅ Project linked via `supabase link`
- ✅ All env variables in `.env.local`
- ✅ Dev server can run (`npm run dev`)

---

## Support

If you encounter issues:
1. Check the main documentation files (PROJECT.md, SETUP.md, etc.)
2. Verify Supabase connection: `supabase projects list`
3. Check database tables: `supabase db remote shell -c "\dt larinova_*"`
4. Review API_INTEGRATION.md for service setup

---

**Last Updated**: January 24, 2026
**Total Prompts**: 8 (Prompts 5-12)
**Estimated Time**: 4-6 hours for all prompts
