from bs4 import BeautifulSoup
import requests
import json

def Web_Scrape(search, store):
    # Any issues should resolve with changes to these...
    HEADERS = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9,bg;q=0.8",
        "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
    }
    url = "https://www.walmart.com/search?q=" + search + "&sort=price_low"
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")
    
    if store == "Walmart":
        script_tag = soup.find("script", id="__NEXT_DATA__")
        if script_tag:
            data = json.loads(script_tag.string)
            short = data["props"]["pageProps"]["initialData"]["searchResult"]["itemStacks"][0]["items"][0]["price"]
            return short
        else:
            return "Walmart data not found"
    
    else:
        return "Unsupported store"

# Example usage
print(Web_Scrape("tomato", "Walmart"))