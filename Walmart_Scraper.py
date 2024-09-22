from bs4 import BeautifulSoup
import requests
import json

# Issues with detecting price and quantity within JSON, possibly watch a youtube tutorial(lots of vids use walmart as example)?

def Web_Scrape(search, searchlimit):
    HEADERS = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9,bg;q=0.8",
        "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
    }
    url = "https://www.walmart.com/search?q=" + search + "&sort=price_low"
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")
    script_tag = soup.find("script", id="__NEXT_DATA__")
    
    if script_tag:
        data = json.loads(script_tag.string)
        items = data["props"]["pageProps"]["initialData"]["searchResult"]["itemStacks"][0]["items"]
        
        results = []
        for i in range(min(searchlimit, len(items))):
            item = items[i]
            result = {
                "name": item.get("name", "N/A"),
                "price": item.get("price", "N/A"),
                "quantity": item.get("qty", "N/A"),
                "image": item.get("image", "N/A")
            }
            results.append(result)
        return results
    else:
        return None

# Example usage
search_results = Web_Scrape("Ramen", 6)
print(search_results)  # This will print the raw results