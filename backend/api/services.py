import requests
import time
from .models import TestCase, Attempt, UserMetrics
from django.conf import settings

# JDoodle Execution Endpoint
JDOODLE_API_URL = "https://api.jdoodle.com/v1/execute"

def evaluate_code_submission(user, challenge, user_code):
    """
    Executes user code against hidden test cases using the JDoodle API.
    """
    # 1. Retrieve hidden test cases [cite: 72, 203]
    test_cases = challenge.test_cases.filter(hidden_flag=True)
    
    results = []
    all_passed = True
    total_execution_time = 0.0
    status_result = "PASS"

    # Credentials (Ideally stored in .env)
    client_id = getattr(settings, 'JDOODLE_CLIENT_ID', '61507bb776dd32c34fa19d7a361bf598')
    client_secret = getattr(settings, 'JDOODLE_CLIENT_SECRET', '1bb7c40e6961303dee0fa5971a655d6827be3d41a1d95f7bf4566b34f2a7e24c')

    for test in test_cases:
        # Construct the test harness 
        harness_code = f"{user_code}\n\n{test.input_data}"
        
        payload = {
            "clientId": client_id,
            "clientSecret": client_secret,
            "script": harness_code,
            "language": "python3",
            "versionIndex": "4" # Index for Python 3.10+
        }

        try:
            start_time = time.time()
            response = requests.post(JDOODLE_API_URL, json=payload, timeout=15)
            end_time = time.time()
            
            run_time = end_time - start_time

            if response.status_code == 200:
                data = response.json()
                
                # JDoodle returns output as a single string
                stdout = data.get('output', '').strip()
                # JDoodle doesn't provide a distinct exit code in the same way; 
                # usually, errors are piped to the output string.
                
                expected = test.expected_output.strip()
                
                # Evaluation Logic [cite: 135, 137, 209]
                passed = (stdout == expected)
                
                if not passed:
                    all_passed = False
                    status_result = "FAIL"

                # Check for JDoodle-specific internal errors (like quota limit)
                if "error" in data or data.get('statusCode') == 401:
                    status_result = "ERROR"
                    all_passed = False

                total_execution_time += run_time
                
                results.append({
                    "test_id": str(test.test_id),
                    "passed": passed,
                    "stdout": stdout,
                    "time": round(run_time, 3)
                })
            else:
                all_passed = False
                status_result = "ERROR"
                results.append({"test_id": str(test.test_id), "passed": False, "error": f"HTTP {response.status_code}"})
        
        except Exception as e:
            all_passed = False
            status_result = "ERROR"
            results.append({"test_id": str(test.test_id), "passed": False, "error": str(e)})

    # 3. Save Attempt and Update Metrics [cite: 114, 116, 167, 204]
    if user.is_authenticated:
        Attempt.objects.create(
            user=user,
            challenge=challenge,
            code_submission=user_code,
            result=status_result
        )

        metrics, created = UserMetrics.objects.get_or_create(user=user, challenge=challenge)
        metrics.total_attempts += 1
        
        if status_result == "PASS":
            metrics.completed = True
            if metrics.best_time is None or total_execution_time < metrics.best_time:
                metrics.best_time = total_execution_time
        metrics.save()

    return {
        "status": status_result,
        "execution_time": round(total_execution_time, 3),
        "results": results
    }