import json
import logging
from typing import List, Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Try modern google.genai SDK first, fall back to google.generativeai
genai_client = None
genai_legacy = None

try:
    from google import genai
    genai_client = genai
except ImportError:
    try:
        import google.generativeai as genai_legacy
    except ImportError:
        logger.warning("No Google Gemini SDK found. Running in Heuristic Mode.")


class AIService:

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self._initialized = False
        self.client = None

        if self.api_key and self.api_key != "your_gemini_api_key_here":
            self.init_sdk(self.api_key)

    def init_sdk(self, key: str):
        self.api_key = key
        self._initialized = False

        if genai_client is not None:
            try:
                self.client = genai_client.Client(api_key=key)
                self._initialized = True
                logger.info("Initialized modern google.genai Client")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize google.genai Client: {e}")

        if genai_legacy is not None:
            try:
                genai_legacy.configure(api_key=key)
                self.client = genai_legacy.GenerativeModel(self.model_name)
                self._initialized = True
                logger.info("Initialized legacy google.generativeai SDK")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize legacy google.generativeai SDK: {e}")

    def generate_text(self, prompt: str) -> Optional[str]:
        if not self._initialized or not self.client:
            return None

        try:
            # Modern SDK
            if genai_client is not None and hasattr(self.client, 'models'):
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                return response.text.strip()
            # Legacy SDK
            elif genai_legacy is not None and hasattr(self.client, 'generate_content'):
                response = self.client.generate_content(prompt)
                return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini AI generation error: {e}")

        return None

    def triage_ticket(self, title: str, description: str) -> Dict[str, Any]:
        """Suggest labels, priority, and story point estimate for a ticket."""
        prompt = f"""
You are an expert agile project management AI assistant.
Analyze this software project ticket and provide a JSON response with:
- "labels": array of 1-3 concise tags (e.g. ["frontend", "bug", "auth", "backend", "db"])
- "priority": one of ["low", "medium", "high", "urgent"]
- "estimate": integer story point (1, 2, 3, 5, or 8)

Ticket Title: {title}
Ticket Description: {description or 'No description provided.'}

Return ONLY valid JSON matching this schema:
{{
  "labels": ["tag1", "tag2"],
  "priority": "medium",
  "estimate": 3
}}
"""
        text = self.generate_text(prompt)
        if text:
            try:
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                data = json.loads(text.strip())
                return {
                    "labels": data.get("labels", ["ai-triaged"]),
                    "priority": data.get("priority", "medium"),
                    "estimate": data.get("estimate", 2),
                }
            except Exception as e:
                logger.error(f"Failed to parse Gemini triage JSON: {e}")

        # Intelligent Heuristic Fallback if Gemini key is missing or call fails
        labels = ["triage-auto"]
        priority = "medium"
        estimate = 2
        combined = (title + " " + (description or "")).lower()

        if any(k in combined for k in ["bug", "fix", "crash", "broken", "error"]):
            labels.append("bug")
            priority = "high"
        if any(k in combined for k in ["auth", "login", "jwt", "token", "password"]):
            labels.append("auth")
        if any(k in combined for k in ["ui", "css", "frontend", "react", "component"]):
            labels.append("frontend")
        if any(k in combined for k in ["db", "query", "sql", "migration", "backend", "api"]):
            labels.append("backend")
        if "urgent" in combined or "critical" in combined:
            priority = "urgent"

        return {"labels": labels, "priority": priority, "estimate": estimate}

    def summarize_comments(self, comments: List[str]) -> str:
        """Summarize a list of ticket comments into a concise paragraph."""
        if not comments:
            return "No comments available."

        combined_text = "\n".join([f"- {c}" for c in comments])
        prompt = f"""
Summarize the following discussion thread on a project ticket into a single clear, action-oriented sentence:

{combined_text}
"""
        text = self.generate_text(prompt)
        if text:
            return text

        return f"Discussion summary ({len(comments)} comments): Key updates discussed on status and implementation details."

    def predict_sprint_risk(
        self,
        sprint_name: str,
        total_tickets: int,
        open_tickets: int,
        days_left: int,
        total_points: int,
        completed_points: int,
    ) -> Dict[str, Any]:
        """Analyze sprint progress and return risk assessment."""
        remaining_points = max(0, total_points - completed_points)

        # Heuristic scoring formula
        if days_left <= 0:
            risk_level = "critical" if open_tickets > 0 else "low"
        else:
            required_rate = remaining_points / max(1, days_left)
            if required_rate > 5 or (open_tickets > total_tickets * 0.7 and days_left < 4):
                risk_level = "high"
            elif required_rate > 3 or (open_tickets > total_tickets * 0.4 and days_left < 7):
                risk_level = "medium"
            else:
                risk_level = "low"

        prompt = f"""
Analyze this sprint status and provide a 1-2 sentence risk explanation:
Sprint: {sprint_name}
Total Tickets: {total_tickets}, Open Tickets: {open_tickets}
Total Points: {total_points}, Completed Points: {completed_points}
Days Remaining: {days_left}
Calculated Risk Level: {risk_level}
"""
        explanation = self.generate_text(prompt)
        if not explanation:
            explanation = f"Sprint is at {risk_level} risk: {open_tickets} of {total_tickets} tickets remain open with {remaining_points} story points left and {days_left} days remaining."

        return {"risk_score": risk_level, "risk_reason": explanation}


ai_service = AIService()
