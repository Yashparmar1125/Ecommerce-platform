import requests

def health():
    response = requests.get('http://localhost:8000/api/health')
    print(response.text)

if __name__ == '__main__':
    health()