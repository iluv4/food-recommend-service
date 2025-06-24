# 필요한 패키지 임포트
import requests
import json
from tqdm import tqdm

# 단일 가게 리뷰 크롤링 함수
def crawl_yogiyo_reviews(store_id):
    review_url = f"https://www.yogiyo.co.kr/api/v1/reviews/{store_id}/?count=10000&only_photo_review=true&page=1&sort=time"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'X-ApiKey': 'iphoneap',
        'X-ApiSecret': 'fe5183cc3dea12bd0ce299cf110a75a2'
    }
    response = requests.get(review_url, headers=headers)
    if response.status_code == 200:
        result = response.text
        data = json.loads(result)
        return data
    else:
        print(f"Error: {response.status_code}")
        return None

# 여러 가게 리뷰를 한 번에 크롤링하는 함수
def crawl_multiple_stores(store_ids):
    all_reviews = {}
    for store_id in tqdm(store_ids):
        if not store_id:  # 빈 값 방지
            continue
        reviews = crawl_yogiyo_reviews(store_id)
        if reviews:
            all_reviews[store_id] = reviews
            # 결과 저장
            with open(f"{store_id}_reviews.json", "w", encoding="utf-8") as f:
                json.dump(reviews, f, ensure_ascii=False, indent=4)
    return all_reviews

# 사용 예시
store_ids = ["123456", "345678"]  # 크롤링할 가게 ID 목록
all_reviews = crawl_multiple_stores(store_ids)

# 결과 출력
print(all_reviews)
