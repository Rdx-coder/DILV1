#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Dangi Innovation Lab Node.js Backend
Tests all endpoints as specified in the review request
"""

import requests
import json
import time
from datetime import datetime
import sys

# Backend URL from frontend .env
BACKEND_URL = "https://dangiinovlab.preview.emergentagent.com/api"

# Admin credentials
ADMIN_EMAIL = "admin@dangiinnovationlab.com"
ADMIN_PASSWORD = "Admin@123"

# Global variables for testing
auth_token = None
test_submission_id = None

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_health_endpoint():
    """Test GET /api/health"""
    print_test_header("Health Check Endpoint")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'message' in data:
                print_success("Health endpoint working correctly")
                print_info(f"Server message: {data.get('message')}")
                print_info(f"Environment: {data.get('environment', 'N/A')}")
                return True
            else:
                print_error("Health endpoint returned invalid response format")
                return False
        else:
            print_error(f"Health endpoint failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Health endpoint request failed: {str(e)}")
        return False

def test_root_endpoint():
    """Test GET /api"""
    print_test_header("Root API Endpoint")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'endpoints' in data:
                print_success("Root API endpoint working correctly")
                print_info(f"API version: {data.get('version', 'N/A')}")
                print_info(f"Available endpoints: {list(data.get('endpoints', {}).keys())}")
                return True
            else:
                print_error("Root API endpoint returned invalid response format")
                return False
        else:
            print_error(f"Root API endpoint failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Root API endpoint request failed: {str(e)}")
        return False

def test_admin_login_valid():
    """Test POST /api/auth/login with valid credentials"""
    print_test_header("Admin Login - Valid Credentials")
    
    global auth_token
    
    try:
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'token' in data and 'admin' in data:
                auth_token = data['token']
                admin_info = data['admin']
                print_success("Admin login successful")
                print_info(f"Admin email: {admin_info.get('email')}")
                print_info(f"Admin name: {admin_info.get('name')}")
                print_info(f"Admin role: {admin_info.get('role')}")
                print_info(f"Token received: {auth_token[:20]}...")
                return True
            else:
                print_error("Login response missing required fields")
                return False
        else:
            print_error(f"Login failed with status {response.status_code}")
            try:
                error_data = response.json()
                print_error(f"Error message: {error_data.get('message', 'Unknown error')}")
            except:
                print_error(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Login request failed: {str(e)}")
        return False

def test_admin_login_invalid():
    """Test POST /api/auth/login with invalid credentials"""
    print_test_header("Admin Login - Invalid Credentials")
    
    try:
        login_data = {
            "email": "wrong@email.com",
            "password": "wrongpassword"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 401 or response.status_code == 400:
            data = response.json()
            if not data.get('success'):
                print_success("Invalid login correctly rejected")
                print_info(f"Error message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("Invalid login should not return success=true")
                return False
        else:
            print_error(f"Invalid login returned unexpected status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Invalid login request failed: {str(e)}")
        return False

def test_auth_me_with_token():
    """Test GET /api/auth/me with valid token"""
    print_test_header("Get Current Admin - With Token")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'admin' in data:
                admin_info = data['admin']
                print_success("Auth me endpoint working correctly")
                print_info(f"Admin email: {admin_info.get('email')}")
                print_info(f"Admin name: {admin_info.get('name')}")
                return True
            else:
                print_error("Auth me response missing required fields")
                return False
        else:
            print_error(f"Auth me failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Auth me request failed: {str(e)}")
        return False

def test_auth_me_without_token():
    """Test GET /api/auth/me without token"""
    print_test_header("Get Current Admin - Without Token")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/auth/me", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 401:
            data = response.json()
            if not data.get('success'):
                print_success("Unauthorized access correctly rejected")
                print_info(f"Error message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("Unauthorized request should not return success=true")
                return False
        else:
            print_error(f"Unauthorized request returned unexpected status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Unauthorized request failed: {str(e)}")
        return False

def test_contact_form_valid():
    """Test POST /api/contact with valid data"""
    print_test_header("Contact Form Submission - Valid Data")
    
    global test_submission_id
    
    try:
        contact_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "subject": "API Testing Inquiry",
            "message": "This is a test message from the automated testing suite.",
            "interest": "programs"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/contact",
            json=contact_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            if data.get('success'):
                print_success("Contact form submission successful")
                print_info(f"Message: {data.get('message', 'No message')}")
                if 'submission' in data and 'id' in data['submission']:
                    test_submission_id = data['submission']['id']
                    print_info(f"Submission ID: {test_submission_id}")
                return True
            else:
                print_error("Contact form response indicates failure")
                return False
        else:
            print_error(f"Contact form failed with status {response.status_code}")
            try:
                error_data = response.json()
                print_error(f"Error message: {error_data.get('message', 'Unknown error')}")
            except:
                print_error(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Contact form request failed: {str(e)}")
        return False

def test_contact_form_invalid():
    """Test POST /api/contact with missing required fields"""
    print_test_header("Contact Form Submission - Invalid Data")
    
    try:
        # Missing required fields
        contact_data = {
            "name": "John Doe"
            # Missing email, subject, message
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/contact",
            json=contact_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 400:
            data = response.json()
            if not data.get('success'):
                print_success("Invalid contact form correctly rejected")
                print_info(f"Error message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("Invalid contact form should not return success=true")
                return False
        else:
            print_warning(f"Invalid contact form returned status {response.status_code} (expected 400)")
            # Some APIs might return 200 with error message, so check response
            try:
                data = response.json()
                if not data.get('success'):
                    print_success("Invalid contact form correctly rejected (different status code)")
                    return True
            except:
                pass
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Invalid contact form request failed: {str(e)}")
        return False

def test_application_form():
    """Test POST /api/application with valid data"""
    print_test_header("Application Form Submission")
    
    try:
        application_data = {
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "phone": "+1234567890",
            "program": "Startups & Entrepreneurship",
            "message": "I want to apply for the startup program through API testing."
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/application",
            json=application_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            if data.get('success'):
                print_success("Application form submission successful")
                print_info(f"Message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("Application form response indicates failure")
                return False
        else:
            print_error(f"Application form failed with status {response.status_code}")
            try:
                error_data = response.json()
                print_error(f"Error message: {error_data.get('message', 'Unknown error')}")
            except:
                print_error(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Application form request failed: {str(e)}")
        return False

def test_newsletter_subscription():
    """Test POST /api/newsletter with valid email"""
    print_test_header("Newsletter Subscription - Valid Email")
    
    try:
        newsletter_data = {
            "email": "newsletter.test@example.com",
            "name": "Newsletter Subscriber"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/newsletter",
            json=newsletter_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            if data.get('success'):
                print_success("Newsletter subscription successful")
                print_info(f"Message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("Newsletter subscription response indicates failure")
                return False
        else:
            print_error(f"Newsletter subscription failed with status {response.status_code}")
            try:
                error_data = response.json()
                print_error(f"Error message: {error_data.get('message', 'Unknown error')}")
            except:
                print_error(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Newsletter subscription request failed: {str(e)}")
        return False

def test_newsletter_duplicate():
    """Test POST /api/newsletter with duplicate email"""
    print_test_header("Newsletter Subscription - Duplicate Email")
    
    try:
        # Try to subscribe with the same email again
        newsletter_data = {
            "email": "newsletter.test@example.com",
            "name": "Newsletter Subscriber Duplicate"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/newsletter",
            json=newsletter_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        # This should either fail or return a message about duplicate
        if response.status_code == 400 or response.status_code == 409:
            data = response.json()
            if not data.get('success'):
                print_success("Duplicate newsletter subscription correctly rejected")
                print_info(f"Error message: {data.get('message', 'No message')}")
                return True
        elif response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_warning("Duplicate newsletter subscription allowed (may be intended behavior)")
                return True
        
        print_error(f"Duplicate newsletter subscription returned unexpected status {response.status_code}")
        return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Duplicate newsletter subscription request failed: {str(e)}")
        return False

def test_admin_stats():
    """Test GET /api/admin/stats (protected)"""
    print_test_header("Admin Dashboard Stats")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/admin/stats", headers=headers, timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'stats' in data:
                stats = data['stats']
                print_success("Admin stats endpoint working correctly")
                print_info(f"Total submissions: {stats.get('total', 'N/A')}")
                print_info(f"By status: {stats.get('byStatus', {})}")
                print_info(f"By form type: {stats.get('byFormType', {})}")
                print_info(f"Recent submissions: {stats.get('recentSubmissions', 'N/A')}")
                return True
            else:
                print_error("Admin stats response missing required fields")
                return False
        else:
            print_error(f"Admin stats failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Admin stats request failed: {str(e)}")
        return False

def test_admin_submissions():
    """Test GET /api/admin/submissions (protected)"""
    print_test_header("Admin Submissions List")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/admin/submissions", headers=headers, timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'submissions' in data:
                submissions = data['submissions']
                print_success("Admin submissions endpoint working correctly")
                print_info(f"Total submissions: {data.get('total', 'N/A')}")
                print_info(f"Current page: {data.get('page', 'N/A')}")
                print_info(f"Total pages: {data.get('pages', 'N/A')}")
                print_info(f"Submissions in response: {len(submissions)}")
                
                # Store first submission ID for later tests
                global test_submission_id
                if submissions and not test_submission_id:
                    test_submission_id = submissions[0].get('_id')
                    print_info(f"Using submission ID for further tests: {test_submission_id}")
                
                return True
            else:
                print_error("Admin submissions response missing required fields")
                return False
        else:
            print_error(f"Admin submissions failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Admin submissions request failed: {str(e)}")
        return False

def test_admin_submissions_filtered():
    """Test GET /api/admin/submissions with filters"""
    print_test_header("Admin Submissions - Filtered")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    # Test multiple filters
    filters = [
        ("status=new", "Status filter"),
        ("formType=contact", "Form type filter"),
        ("search=test", "Search filter")
    ]
    
    all_passed = True
    
    for filter_param, filter_name in filters:
        try:
            headers = {"Authorization": f"Bearer {auth_token}"}
            url = f"{BACKEND_URL}/admin/submissions?{filter_param}"
            
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            print_info(f"{filter_name} - Response time: {response_time:.2f}ms")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print_success(f"{filter_name} working correctly")
                    print_info(f"  Results: {len(data.get('submissions', []))} submissions")
                else:
                    print_error(f"{filter_name} response indicates failure")
                    all_passed = False
            else:
                print_error(f"{filter_name} failed with status {response.status_code}")
                all_passed = False
                
        except requests.exceptions.RequestException as e:
            print_error(f"{filter_name} request failed: {str(e)}")
            all_passed = False
    
    return all_passed

def test_admin_single_submission():
    """Test GET /api/admin/submissions/:id"""
    print_test_header("Admin Single Submission")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    if not test_submission_id:
        print_error("No submission ID available. Previous tests must create/find a submission.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/admin/submissions/{test_submission_id}", headers=headers, timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'submission' in data:
                submission = data['submission']
                print_success("Single submission endpoint working correctly")
                print_info(f"Submission ID: {submission.get('_id')}")
                print_info(f"Form type: {submission.get('formType')}")
                print_info(f"Name: {submission.get('name')}")
                print_info(f"Status: {submission.get('status')}")
                return True
            else:
                print_error("Single submission response missing required fields")
                return False
        else:
            print_error(f"Single submission failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Single submission request failed: {str(e)}")
        return False

def test_admin_update_status():
    """Test PUT /api/admin/submissions/:id/status"""
    print_test_header("Admin Update Submission Status")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    if not test_submission_id:
        print_error("No submission ID available. Previous tests must create/find a submission.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        status_data = {"status": "in_progress"}
        
        start_time = time.time()
        response = requests.put(
            f"{BACKEND_URL}/admin/submissions/{test_submission_id}/status",
            json=status_data,
            headers=headers,
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Status update successful")
                print_info(f"Message: {data.get('message', 'No message')}")
                if 'submission' in data:
                    new_status = data['submission'].get('status')
                    print_info(f"New status: {new_status}")
                return True
            else:
                print_error("Status update response indicates failure")
                return False
        else:
            print_error(f"Status update failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Status update request failed: {str(e)}")
        return False

def test_admin_delete_submission():
    """Test DELETE /api/admin/submissions/:id"""
    print_test_header("Admin Delete Submission")
    
    if not auth_token:
        print_error("No auth token available. Login test must pass first.")
        return False
    
    if not test_submission_id:
        print_error("No submission ID available. Previous tests must create/find a submission.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        start_time = time.time()
        response = requests.delete(f"{BACKEND_URL}/admin/submissions/{test_submission_id}", headers=headers, timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Submission deletion successful")
                print_info(f"Message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("Submission deletion response indicates failure")
                return False
        else:
            print_error(f"Submission deletion failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Submission deletion request failed: {str(e)}")
        return False

def test_404_routes():
    """Test 404 for non-existent routes"""
    print_test_header("404 Error Handling")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/nonexistent-route", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        print_info(f"Response time: {response_time:.2f}ms")
        
        if response.status_code == 404:
            data = response.json()
            if not data.get('success'):
                print_success("404 error handling working correctly")
                print_info(f"Error message: {data.get('message', 'No message')}")
                return True
            else:
                print_error("404 route should not return success=true")
                return False
        else:
            print_error(f"Non-existent route returned status {response.status_code} (expected 404)")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"404 test request failed: {str(e)}")
        return False

def test_401_protected_routes():
    """Test 401 for protected routes without token"""
    print_test_header("401 Unauthorized Access")
    
    protected_routes = [
        "/admin/stats",
        "/admin/submissions"
    ]
    
    all_passed = True
    
    for route in protected_routes:
        try:
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}{route}", timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            print_info(f"{route} - Response time: {response_time:.2f}ms")
            
            if response.status_code == 401:
                data = response.json()
                if not data.get('success'):
                    print_success(f"Unauthorized access to {route} correctly rejected")
                else:
                    print_error(f"Unauthorized access to {route} should not return success=true")
                    all_passed = False
            else:
                print_error(f"Unauthorized access to {route} returned status {response.status_code} (expected 401)")
                all_passed = False
                
        except requests.exceptions.RequestException as e:
            print_error(f"Unauthorized access test for {route} failed: {str(e)}")
            all_passed = False
    
    return all_passed

def run_all_tests():
    """Run all backend API tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("DANGI INNOVATION LAB - BACKEND API COMPREHENSIVE TESTING")
    print("=" * 80)
    print(f"{Colors.ENDC}")
    
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Admin Email: {ADMIN_EMAIL}")
    print_info(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results tracking
    test_results = {}
    
    # Run all tests in order
    tests = [
        ("Health Check", test_health_endpoint),
        ("Root API Info", test_root_endpoint),
        ("Admin Login (Valid)", test_admin_login_valid),
        ("Admin Login (Invalid)", test_admin_login_invalid),
        ("Auth Me (With Token)", test_auth_me_with_token),
        ("Auth Me (Without Token)", test_auth_me_without_token),
        ("Contact Form (Valid)", test_contact_form_valid),
        ("Contact Form (Invalid)", test_contact_form_invalid),
        ("Application Form", test_application_form),
        ("Newsletter Subscription", test_newsletter_subscription),
        ("Newsletter Duplicate", test_newsletter_duplicate),
        ("Admin Stats", test_admin_stats),
        ("Admin Submissions", test_admin_submissions),
        ("Admin Submissions (Filtered)", test_admin_submissions_filtered),
        ("Admin Single Submission", test_admin_single_submission),
        ("Admin Update Status", test_admin_update_status),
        ("Admin Delete Submission", test_admin_delete_submission),
        ("404 Error Handling", test_404_routes),
        ("401 Unauthorized Access", test_401_protected_routes)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results[test_name] = result
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            test_results[test_name] = False
    
    # Print summary
    print_test_header("TEST SUMMARY")
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    print_info(f"Tests Passed: {passed}/{total}")
    print_info(f"Success Rate: {(passed/total)*100:.1f}%")
    
    print("\nDetailed Results:")
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status}{Colors.ENDC} {test_name}")
    
    # Performance check
    print_info(f"Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if passed == total:
        print_success("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return True
    else:
        failed_tests = [name for name, result in test_results.items() if not result]
        print_error(f"❌ {total - passed} tests failed:")
        for test in failed_tests:
            print_error(f"  - {test}")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)