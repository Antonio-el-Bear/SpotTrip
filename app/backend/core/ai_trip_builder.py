import os
import openai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

openai.api_key = os.environ.get("OPENAI_API_KEY")

@csrf_exempt
@require_POST
def ai_trip_builder(request):
    try:
        data = json.loads(request.body)
        # Compose a prompt for the AI model
        prompt = f"""
        You are a travel expert AI. Generate a detailed, day-by-day travel itinerary based on the following user input:
        Departure: {data.get('departure')}
        Destinations: {data.get('destinations')}
        Total Days: {data.get('totalDays')}
        Budget: {data.get('maxBudget')} {data.get('currency')}
        Tourism Types: {', '.join(data.get('tourismTypes', []))}
        Notes: {data.get('additionalNotes')}
        Please include:
        - A title and description
        - Countries and cities visited
        - Main transport type
        - Day-by-day itinerary (locations, attractions, activities, notes, transport, accommodation, food)
        - Budget breakdown (transport, accommodation, food, activities, other, total)
        - 3-5 travel tips
        Return the result as a JSON object with keys: title, description, countries, transport, itinerary, budgetBreakdown, tips.
        """
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are a helpful travel planner."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1200
        )
        # Try to parse the response as JSON
        import re
        import ast
        import logging
        content = response.choices[0].message['content']
        # Try to extract JSON from the response
        if match := re.search(r'\{.*\}', content, re.DOTALL):
            trip_json = match.group(0)
            try:
                trip_plan = json.loads(trip_json)
            except Exception:
                trip_plan = ast.literal_eval(trip_json)
        else:
            trip_plan = {"error": "AI response did not contain valid JSON."}
        return JsonResponse({"tripPlan": trip_plan})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
