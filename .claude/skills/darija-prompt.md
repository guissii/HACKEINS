# Skill: Darija Prompt Protection

**Purpose:** Protect the Gemini system prompt + fallback templates that produce the Darija WhatsApp messages. This is the project's single most important output — the demo lives or dies on its quality.

**When this skill applies:**
- Anyone is about to edit `backend/app/services/ai_explainer.py`, `ai_qa.py`, or the fallback Darija templates
- Anyone is tuning the Gemini model name or generation config
- Anyone is asking "can I simplify this prompt?"

---

## The contract we have with Gemini

The Explainer system prompt (see `_SYSTEM_PROMPT` in `ai_explainer.py`) currently produces output like this:

**Farm 1 (Ahmed, citrus, IRRIGATE):**
> السلام عليكم الحاج أحمد!
> اليوم خاصك تسقي 💧، لمدة 17 دقيقة بـ 42228 لتر ديال الماء.
> راه كاين شوية ديال ستريس على الزرع ديالك 🌱 والرطوبة فالتربة قليلة بزاف.
> بالتوفيق!

**Farm 3 (Hassan, olive, WAIT):**
> السلام الحاج حسن،
> اليوم من الأحسن تسنى ماتسقيش الزيتون.
> عرفنا بلي كاين شوية د العطش (الرطوبة 18.2% 🌱)، ولكن 🌧️ كاينة شتا كثيرة جاية (98%) فهاد 24 ساعة.
> الشتا غادية تعاون الشجر بزاف، وتوفر عليك الما.
> غدا نشوفو الوضع تاني!

**Conversational Q&A (matches user's script):**
- User asks: `"3lach ma tab9ach lazem nsqi lyoma?"` (Latin-script Darija)
- Gemini answers in Latin-script Darija too — automatic style matching

These outputs took deliberate prompt engineering. Don't break them.

---

## Why the current prompt works (and what NOT to touch)

1. **The Explainer is told the decision is FINAL.** The prompt explicitly says:
   > _"You are given a FINAL irrigation decision that was made by a deterministic rule engine. Your job is NOT to re-decide."_
   This stops Gemini from hallucinating contradictory irrigation advice.

2. **It must echo the decision back.** The `decision_echo` field is our self-validation. If Gemini disagrees with the rule engine, we trust the rules and fall back to the templated message. Don't remove this check.

3. **Specific numbers are mandatory in reasoning.** The prompt says:
   > _"Write a 2-3 sentence reasoning that references the specific numbers."_
   Without this, Gemini drifts into generic advice. Keep it.

4. **JSON-only response.** `response_mime_type: "application/json"` is set in `genai.GenerativeModel(...)`. The prompt also says "Respond ONLY with valid JSON." Don't switch to free-form output.

5. **Cultural touches emerge naturally from the prompt's tone instruction.** Gemini produces "الحاج" / "أ للا" / "عمي" addresses without being explicitly told to. Don't over-specify or you'll lose this emergent quality.

6. **Latin-Darija matching in Q&A is also emergent.** The `ai_qa.py` system prompt says "Answer in the SAME language the farmer used." That single line is doing a lot of work. Don't replace it with rigid rules.

---

## Safe changes you CAN make

- Add new emoji mappings in the fallback `_fallback_message` function
- Add new alert types to the input data (Gemini will incorporate them naturally)
- Change the max-line constraint (currently 6)
- Add more language hints (e.g., explicitly request "use Arabic script" or "use Latin script")
- Switch Gemini model — `gemini-2.5-flash` works as of May 2026. Newer flash models should work too. Test with all 3 demo farms before committing.

## Unsafe changes (will degrade output)

- ❌ Removing the "do not re-decide" instruction → Gemini starts giving contradictory advice
- ❌ Removing the `decision_echo` field → no safety net against drift
- ❌ Switching from JSON to plain text → harder to parse, breaks the validation
- ❌ Translating the system prompt itself to Arabic → English instructions produce better Darija output (counterintuitive but true)
- ❌ Adding too many examples in the prompt → makes outputs feel templated
- ❌ Setting temperature to 0 → strips the warm cultural voice

---

## How to verify the prompt still works after changes

```bash
cd backend && source .venv/bin/activate
PYTHONPATH=. python -m uvicorn app.main:app --port 8765 --reload

# In another terminal:
for i in 1 2 3; do
  curl -s http://127.0.0.1:8765/api/farms/$i/analyze \
    | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print('---'); print(d['ai']['darija_message'])"
done

# Live Q&A test:
curl -s -X POST http://127.0.0.1:8765/api/farms/3/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"3lach ma tab9ach lazem nsqi lyoma?"}' \
  | python3 -m json.tool
```

What "good" looks like:
- Each of the 3 farms produces a different greeting style (formal name, "Lalla", "Si", "Hajj", "Ammi")
- Numbers from the rationale facts appear in the message
- `ai._source == "gemini"` (not `"fallback"`)
- Q&A in Latin Darija when the user writes in Latin Darija; Arabic script when the user writes in Arabic

If any of those break, revert the change.

---

## Background: why this matters more than anything else

Filaha AI's differentiator is _the AI talks to farmers in their own dialect_. Every other agri-tech demo has a dashboard. None of them have natural Darija. This skill protects the one thing competitors can't easily copy.
