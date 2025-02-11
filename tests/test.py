import unittest
import json
import requests

BASE_URL = "http://localhost"

class FlaskTestCase(unittest.TestCase):

    def test_index(self):
        # Test the index route
        response = requests.get(f"{BASE_URL}/")
        self.assertEqual(response.status_code, 200)
        self.assertIn('<!doctype html>', response.text)

    def test_random_joke(self):
        # Test the random joke route
        response = requests.get(f"{BASE_URL}/joke")
        self.assertEqual(response.status_code, 200)
        joke = response.json()
        self.assertIn('id', joke)
        self.assertIn('category', joke)

    def test_feedback(self):
        # Test the feedback route
        feedback_data = {
            'joke_id': '1',
            'feedback': 'This is a test feedback'
        }
        response = requests.post(f"{BASE_URL}/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('Feedback saved successfully!', response.text)

    def test_feedback_invalid_data(self):
        # Test the feedback route with invalid data
        feedback_data = {
            'joke_id': '',
            'feedback': ''
        }
        response = requests.post(f"{BASE_URL}/feedback", json=feedback_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid data. Please provide both joke id and feedback.', response.text)

    def test_admin_flags_unauthorized(self):
        # Test the admin flags route without authorization
        response = requests.get(f"{BASE_URL}/admin/flags")
        self.assertEqual(response.status_code, 403)
        self.assertIn('Authorization header required', response.text)

if __name__ == '__main__':
    unittest.main()