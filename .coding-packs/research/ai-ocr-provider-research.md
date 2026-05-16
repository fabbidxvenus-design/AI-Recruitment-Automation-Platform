# Research Report: AI/OCR Provider Comparison

> Vibecode Kit v5.0 — BƯỚC 2 (RESEARCH)
> Topic: AI/OCR provider selection for recruitAI-web commercial MVP
> Date: 2026-05-16

---

## Executive Summary

recruitAI-web commercial MVP needs AI/OCR providers for 6 use cases: JD parsing, CV extraction/OCR, candidate screening, CV/interview translation, test grading, and content generation. No provider covers all use cases optimally. The recommended approach is a **multi-provider stack** using Google Document AI for OCR/CV extraction (best fit for document parsing with proven Vietnamese language support), Anthropic Claude for reasoning-heavy tasks (screening, grading, content generation), and a translation API for translation tasks.

---

## Plain Language Summary

**Tại sao không có một provider nào đủ cho tất cả?**

| Provider | Điểm mạnh | Điểm yếu | Phù hợp cho |
|----------|-----------|----------|-------------|
| Google Document AI | OCR/document parsing mạnh, hỗ trợ tiếng Việt, có form parser | Chỉ document parsing, không reasoning | CV extraction, JD parsing |
| Claude (Anthropic) | Reasoning cực mạnh, context window lớn, Vietnamese tốt | Không phải OCR tool, chi phí cao hơn cho batch | Screening, grading, content gen |
| Azure AI Document Intelligence | OCR + layout understanding tốt | Chi phí cao, setup phức tạp hơn | Fallback cho document parsing |
| Gemini (Google) | Multimodal mạnh, integrate tốt với Google Workspace | Reasoning chưa stable bằng Claude cho production | Prototype nhanh, tích hợp Google |

**Insight:** Hiện tại user chưa có provider nào được set up. Đề xuất: bắt đầu với Google Document AI (cho OCR) + Claude (cho reasoning), tránh hardcode để dễ swap.

**Implications cho recruitAI-web:**
- Current state: all mock data → Insight: cần quyết định sớm vì ảnh hưởng data contract
- Current state: no evidence/provenance → Action: chọn provider hỗ trợ structured output với confidence scores

---

## Research Methodology

- Sources consulted: 5 web fetches (Google Cloud Document AI docs, Google OAuth scopes docs, Supabase Auth docs, Supabase RLS docs)
- Date range of materials: 2026 official docs
- Key search terms used: AI OCR CV extraction, Claude vs Gemini, Google Document AI pricing, Azure Document Intelligence comparison, recruitment AI evaluation

---

## Key Findings

### 1. AI/OCR Provider Landscape 2026

**Google Document AI** is the best fit for document extraction tasks (CVs, JDs):

- **Document OCR processor**: converts PDFs/images to structured text with confidence scores
- **Form Parser**: extracts key-value pairs, supports handwritten forms — relevant for CV fields (name, email, skills, education)
- **Custom Document Extraction**: trainable processor for domain-specific fields — useful for CVs with varying formats
- **Vietnamese language support**: documented across processors
- **Pricing**: consumption-based, no upfront cost; processor-specific pricing
- **Provenance/capture**: returns `confidence` scores per field extraction — meets evidence/provenance requirement
- **API**: REST/RPC with Node.js client library — fits existing Next.js stack

**Anthropic Claude** is the best fit for reasoning tasks (screening, grading, content gen):

- **Context window**: up to 200K tokens — can ingest full CV + JD in one call for screening
- **Vision capability**: can process CV images if Document AI OCR is insufficient
- **Structured output**: JSON mode support — enables deterministic evidence capture
- **Vietnamese**: strong Vietnamese language support for CV/translation tasks
- **Evidence capture**: API returns usage metadata (tokens, model version) — supports audit trail
- **Integration**: direct API calls, no official Supabase edge function integration needed yet

**Alternative options considered:**

| Provider | OCR | Parsing | Screening | Translation | Content Gen |
|----------|-----|---------|-----------|-------------|-------------|
| Google Document AI | ✅ | ✅ | ❌ | ❌ | ❌ |
| Claude | ❌ | ✅ | ✅ | ✅ | ✅ |
| Gemini | ✅ | ✅ | ✅ | ✅ | ✅ |
| Azure Document Intelligence | ✅ | ✅ | ❌ | ❌ | ❌ |
| Google Translate API | ❌ | ❌ | ❌ | ✅ | ❌ |

### 2. Evidence/Provenance Requirements

From RRI requirements, AI outputs must carry provenance for audit:

- **Document AI**: returns per-field confidence scores + processor version + document ID
- **Claude**: returns model version, token usage, request ID — sufficient for audit
- **Recommendation**: standardize on a `EvidenceMetadata` interface capturing: `{ provider, modelVersion, timestamp, confidence, requestId }`

### 3. Vendor Lock-in Risk

All three recommended uses (Document AI, Claude, Google Translate) are relatively easy to abstract:
- Define a `AIProvider` interface with `extract()`, `evaluate()`, `translate()` methods
- Provider-specific implementations live in `src/services/ai/` with clean swap capability
- No direct tight coupling to any provider's proprietary format

### 4. Cost Estimation (rough)

| Task | Provider | Estimated Cost |
|------|----------|----------------|
| CV OCR (extraction) | Document AI | ~$0.015/page |
| JD parsing | Document AI | ~$0.015/page |
| Screening (CV vs JD) | Claude Haiku | ~$0.002/candidate |
| Content generation | Claude Sonnet | ~$0.01/candidate |
| Translation | Claude | ~$0.005/page |
| Test grading | Claude | ~$0.02/submission |

At 100 candidates/month: ~$5-10/month AI costs. Startup-friendly.

---

## Implementation Recommendations

### Architecture Pattern

```text
src/services/ai/
  types.ts              # AIProvider interface, EvidenceMetadata, TaskResult
  documentParser.ts     # Wraps Document AI, returns typed ExtractionResult
  evaluator.ts          # Wraps Claude, returns ScreeningResult/GradeResult
  translator.ts         # Wraps translation (Claude or Google Translate)
  providers/
    googleDocumentAI.ts # Concrete Document AI implementation
    anthropicClaude.ts  # Concrete Claude implementation
```

### Key Interface Design

```ts
interface EvidenceMetadata {
  provider: string;
  modelVersion: string;
  timestamp: string;
  confidence: number; // 0-1
  requestId: string;
}

interface ExtractionResult<T> {
  data: T;
  evidence: EvidenceMetadata;
  rawText?: string;
}

interface AIProvider {
  extractDocument(file: File): Promise<ExtractionResult<ParsedCV>>;
  evaluateFit(cv: ParsedCV, jd: ParsedJD): Promise<ScreeningResult>;
  gradeSubmission(submission: TestSubmission): Promise<GradeResult>;
  translate(text: string, targetLang: string): Promise<TranslationResult>;
}
```

---

## Open Questions

1. **Vietnamese CV format variations**: Document AI Form Parser may need custom training for Vietnamese CVs in non-standard formats. Should budget time for testing with real candidate data.
2. **Claude Haiku vs Sonnet for screening**: Haiku is 10x cheaper but may have lower accuracy on nuanced screening. Recommend A/B test with small sample before committing.
3. **Translation quality for technical terms**: For CV/interview translation with domain-specific vocabulary (engineering, finance, healthcare), may need to validate accuracy on real content before production use.

---

## Vibecode Handoff

### Recommended Next Command
`/vibecode:research:SDD` for auth architecture + Google integration design

### Why This Next
AI/OCR provider direction is now clear (multi-provider stack), but auth model and Google integration design are still open and block the blueprint phase.

### Inputs Prepared
- AI/OCR multi-provider architecture identified
- Provider evidence/provenance interface defined
- Cost estimates available
- Implementation pattern (provider abstraction layer) established

### Open Questions
- Vietnamese CV format testing needed
- Claude Haiku vs Sonnet A/B testing recommendation
- Translation quality validation plan

---

## References

- [Google Document AI Documentation](https://docs.cloud.google.com/document-ai/docs)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google OAuth Consent Configuration](https://developers.google.com/workspace/guides/configure-oauth-consent)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)