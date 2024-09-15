import requests

def send_text(phone_number, message):
    resp = requests.post('https://textbelt.com/text', {
        'phone': phone_number,
        'message': message,
        'key': 'textbelt'
    })
    print(resp.json())

send_text('2404449732', 'I need help web scraping!')