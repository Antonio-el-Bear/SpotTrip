import json
import os
from pathlib import Path

from dotenv import load_dotenv

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


load_dotenv(Path(__file__).resolve().parents[3] / '.env.local')


def _normalize_itinerary(items, fallback_itinerary):
    normalized = []
    for index, item in enumerate(items or [], start=1):
        if not isinstance(item, dict):
            continue

        title = str(item.get('title') or '').strip() or f'Plan block {index}'
        description = str(item.get('description') or '').strip()
        if not description:
            continue

        day = str(item.get('day') or '').strip() or f'Day {index}'
        normalized.append({
            'day': day,
            'title': title,
            'description': description,
        })

    return normalized or fallback_itinerary


def _normalize_classifications(items, fallback_classifications):
    cleaned = []
    for item in items or []:
        value = str(item or '').strip()
        if value:
            cleaned.append(value[:80])
    return cleaned or fallback_classifications


def generate_trip_plan(*, departure, destination, start_date, end_date, budget, style, transport, accommodation, goals, fallback_title, fallback_summary_text, fallback_itinerary, fallback_classifications, option_prompt=''):
    api_key = os.getenv('OPENAI_API_KEY', '').strip()
    model = os.getenv('OPENAI_MODEL', 'gpt-4.1-mini').strip() or 'gpt-4.1-mini'

    if not api_key or OpenAI is None:
        return {
            'title': fallback_title,
            'summary_text': fallback_summary_text,
            'itinerary': fallback_itinerary,
            'classifications': fallback_classifications,
        }

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            response_format={'type': 'json_object'},
            temperature=0.8,
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You generate realistic travel itineraries. '
                        'Return valid JSON with keys trip_title, summary_text, classifications, and itinerary. '
                        'itinerary must be an array of 3 to 6 objects with day, title, description. '
                        'Keep advice practical, specific, and budget-aware.'
                    ),
                },
                {
                    'role': 'user',
                    'content': json.dumps({
                        'departure_country': departure or 'Flexible departure',
                        'destination_country': destination,
                        'travel_start': start_date.isoformat() if start_date else None,
                        'travel_end': end_date.isoformat() if end_date else None,
                        'budget': budget or 'Budget not specified',
                        'travel_style': style or 'General travel',
                        'transport_preference': transport or 'Flexible transport',
                        'accommodation_level': accommodation or 'Balanced accommodation',
                        'trip_goals': goals or 'Create a realistic trip blueprint.',
                        'option_prompt': option_prompt or None,
                    }),
                },
            ],
        )

        content = response.choices[0].message.content if response.choices else '{}'
        payload = json.loads(content or '{}')

        return {
            'title': str(payload.get('trip_title') or fallback_title)[:120],
            'summary_text': str(payload.get('summary_text') or fallback_summary_text),
            'itinerary': _normalize_itinerary(payload.get('itinerary'), fallback_itinerary),
            'classifications': _normalize_classifications(payload.get('classifications'), fallback_classifications),
        }
    except Exception:
        return {
            'title': fallback_title,
            'summary_text': fallback_summary_text,
            'itinerary': fallback_itinerary,
            'classifications': fallback_classifications,
        }