import json
import re
import unittest
from pathlib import Path
from typing import Any


REQUIREMENTS_DIR = Path(__file__).parent
GATE4_JSON = REQUIREMENTS_DIR / "04-detail-definition.json"
GATE4_MD = REQUIREMENTS_DIR / "04-detail-definition.md"
TRACEABILITY_JSON = REQUIREMENTS_DIR / "traceability-matrix.json"
TRACEABILITY_MD = REQUIREMENTS_DIR / "traceability-matrix.md"


class Gate4ValidatorTest(unittest.TestCase):
    def setUp(self) -> None:
        self.gate4 = self._load_json(GATE4_JSON)
        self.gate4_markdown = GATE4_MD.read_text(encoding="utf-8")
        self.traceability = self._load_json(TRACEABILITY_JSON)
        self.traceability_markdown = TRACEABILITY_MD.read_text(encoding="utf-8")

    def _load_json(self, path: Path) -> dict[str, Any]:
        with path.open(encoding="utf-8") as file:
            data = json.load(file)
        self.assertIsInstance(data, dict, f"{path.name} must contain a JSON object")
        return data

    def _items_by_id(self, section: str) -> dict[str, dict[str, Any]]:
        return {item["id"]: item for item in self.gate4[section] if item.get("id")}

    def _find_security_item(self, item_id: str) -> dict[str, Any]:
        for item in self.gate4["securityPrivacyCompliance"]:
            if item.get("id") == item_id:
                return item
        self.fail(f"{item_id} is missing from securityPrivacyCompliance")

    def test_gate4_json_and_traceability_json_are_valid(self) -> None:
        self.assertIn("metadata", self.gate4)
        self.assertIn("metadata", self.traceability)

    def test_gate4_status_is_conditional_pass(self) -> None:
        self.assertEqual(self.gate4["metadata"]["status"], "CONDITIONAL_PASS")
        self.assertEqual(self.traceability["metadata"]["gate4Status"], "CONDITIONAL_PASS")

    def test_api_contracts_cover_gate4_interfaces(self) -> None:
        interfaces = self._items_by_id("interfaces")
        expected_api_ids = {f"API-{number:03d}" for number in range(1, 11)}
        self.assertTrue(expected_api_ids.issubset(interfaces.keys()))

    def test_external_provider_patterns_are_documented(self) -> None:
        content = f"{json.dumps(self.gate4, ensure_ascii=False)}\n{self.gate4_markdown}".lower()
        expected_markers = [
            "google drive",
            "google calendar",
            "gmail",
            "ai",
            "llm",
            "retry",
            "backoff",
            "token",
            "mfa",
        ]
        for marker in expected_markers:
            self.assertIn(marker, content, f"Missing external/provider marker: {marker}")

    def test_retry_timeout_and_escalation_contracts_are_concrete(self) -> None:
        content = self.gate4_markdown
        expected_contracts = {
            "RETRY-001": "30 seconds",
            "RETRY-002": "[60, 300, 900]",
            "RETRY-003": "[60, 180, 300]",
            "RETRY-004": "[120, 600]",
            "RETRY-005": "maxRemediationAttempts = 3",
            "RETRY-006": "4 business hours",
            "RETRY-007": "submittedAt + 30 minutes",
        }
        for retry_id, required_text in expected_contracts.items():
            self.assertIn(retry_id, content)
            self.assertIn(required_text, content)

    def test_no_empty_source_placeholders_in_critical_tables(self) -> None:
        critical_patterns = [
            r"TEST-017\s*\|\s*;",
            r"TEST-018\s*\|\s*;",
            r"TEST-020\s*\|\s*;",
            r"BR-004;\s*;",
            r"\|\s*;\s*\|",
            r";\s*;\s*;",
        ]
        content = f"{self.gate4_markdown}\n{self.traceability_markdown}"
        for pattern in critical_patterns:
            self.assertIsNone(re.search(pattern, content), f"Found placeholder pattern: {pattern}")

    def test_test_017_018_020_source_ids_are_populated(self) -> None:
        tests = self._items_by_id("tests")
        expected_sources = {
            "TEST-017": {"SCREEN-001", "SCREEN-003", "SCREEN-005", "SCREEN-006", "SCREEN-008", "SEC-A11Y", "UC-005", "BR-011"},
            "TEST-018": {"NFD-001", "BP-002", "BP-008"},
            "TEST-020": {"SEC-007", "BP-010", "BR-011"},
        }
        for test_id, expected in expected_sources.items():
            self.assertIn(test_id, tests)
            self.assertTrue(expected.issubset(set(tests[test_id]["sourceIds"])))

    def test_sec_019_mfa_scope_is_concrete_and_traceable(self) -> None:
        sec_019 = self._find_security_item("SEC-019")
        implementation = sec_019["implementationExpectation"].lower()
        expected_actions = [
            "final pass/fail decision",
            "integration configuration create/update/delete",
            "audit log export",
            "bulk screening/scheduling approval",
        ]
        for action in expected_actions:
            self.assertIn(action, implementation)
        expected_sources = {"BR-011", "BR-012", "BR-017", "BR-022", "ROLE-002", "ROLE-004", "UC-007", "BP-008"}
        self.assertTrue(expected_sources.issubset(set(sec_019["sourceIds"])))

    def test_accessibility_requirements_are_screen_level_and_global(self) -> None:
        screens = self._items_by_id("screens")
        expected_screen_markers = {
            "SCREEN-001": ["skip navigation", "aria-live", "caption"],
            "SCREEN-003": ["keyboard", "aria-live", "44x44px"],
            "SCREEN-005": ["role=progressbar", "aria-describedby", "prefers-reduced-motion"],
            "SCREEN-006": ["role=progressbar", "caption"],
            "SCREEN-008": ["tabular fallback", "aria-describedby"],
        }
        for screen_id, markers in expected_screen_markers.items():
            requirements = screens[screen_id]["accessibilityRequirements"].lower()
            for marker in markers:
                self.assertIn(marker, requirements, f"{screen_id} missing marker: {marker}")

        sec_a11y = self._find_security_item("SEC-A11Y")
        self.assertIn("WCAG 2.2", sec_a11y["requirement"])
        self.assertIn("SCREEN-008", sec_a11y["sourceIds"])

    def test_q4_blockers_remain_unresolved_not_implemented(self) -> None:
        questions = self._items_by_id("openQuestions")
        expected_questions = {f"Q4-{number:03d}" for number in range(1, 8)}
        self.assertEqual(expected_questions, set(questions.keys()))
        for question in questions.values():
            self.assertTrue(question["blocksImplementation"])
            self.assertTrue(question["affectedDetailIds"])


if __name__ == "__main__":
    unittest.main()
