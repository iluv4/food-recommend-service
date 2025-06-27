// --- API 키 설정 ---
const KAKAO_API_KEY = '7067cc4dd9f0dc3f0d97c490a6d5e636'; // REST API 키
const PERPLEXITY_API_KEY = "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";

const resultList = document.getElementById('result');

// NEW: AI를 사용해 사용자 쿼리를 검색용 키워드로 변환
async function getSearchKeyword(userQuery) {
    const prompt = `A user in Korea wants to find a place. Their natural language query is "${userQuery}". From this query, extract a single, simple, general category keyword in Korean that can be used for a map search. For example, if the query is "7000원 가성비 식당", a good keyword is "한식" or "분식". If the query is "분위기 좋은 파스타", a good keyword is "파스타". Return ONLY the single keyword itself.`;
    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "authorization": `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: "pplx-7b-online",
                messages: [{ role: "user", content: prompt }]
            }),
        });
        const data = await response.json();
        // 따옴표나 공백 등 불필요한 문자를 제거합니다.
        return data.choices[0].message.content.replace(/["'.]/g, '').trim();
    } catch (e) {
        console.error("Perplexity 키워드 변환 오류:", e);
        return "맛집"; // 실패 시 기본 키워드 사용
    }
}

// 2단계: Perplexity로 개별 장소의 요약을 가져오기 (웹 검색 기반으로 변경)
async function getPerplexitySummary(place) {
    if (!place) return "요약 정보를 가져올 수 없습니다.";
    
    // Perplexity의 자체 웹 검색 기능을 사용하도록 프롬프트를 변경합니다.
    // 이제 특정 URL을 방문하는 대신, 식당 이름과 주소로 웹에서 리뷰를 검색하고 요약합니다.
    const prompt = `Search the web for blog posts or articles with reviews for the restaurant "${place.place_name}" located at "${place.road_address_name || place.address_name}" in South Korea. Based on the search results, what are customers saying? Summarize the common points of praise and any complaints in a short, easy-to-read paragraph in Korean.`;
    
    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "authorization": `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: "pplx-7b-online",
                messages: [{ role: "user", content: prompt }]
            }),
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error(`Perplexity 요약 오류 (${place.place_name}):`, e);
        return "AI 요약 분석 중 오류가 발생했습니다.";
    }
}

// --- 실시간 검색 (Debounce) 기능 설정 ---
let debounceTimeout;
const searchInput = document.getElementById('query');
let isSearching = false; // "작업 중" 상태를 관리하는 플래그

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        if (searchInput.value.trim() !== '') {
            startRecommendation();
        }
    }, 500);
});

// NEW: 콜백 기반의 Geolocation API를 Promise 기반으로 변환하는 래퍼 함수
function getCurrentPositionPromise() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
}

// 1단계: 카카오맵으로 주변 장소 검색 및 전체 프로세스 시작 (개선된 구조)
async function startRecommendation() {
    if (isSearching) {
        console.log("현재 다른 요청을 처리 중입니다. 새로운 검색을 시작하지 않습니다.");
        return;
    }

    isSearching = true;
    resultList.innerHTML = '<div class="loader"><div class="spinner"></div>AI가 검색어를 분석하는 중...</div>';
    
    try {
        const userQuery = document.getElementById('query').value;
        if (!userQuery) {
            resultList.innerHTML = ''; // 검색어가 없으면 목록을 비웁니다.
            return;
        }

        const searchKeyword = await getSearchKeyword(userQuery);
        
        // Promise로 변환된 위치 정보 함수를 await로 확실히 기다립니다.
        const pos = await getCurrentPositionPromise();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // --- 지도 생성 ---
        const mapContainer = document.getElementById('map');
        const mapOption = { center: new kakao.maps.LatLng(lat, lng), level: 5 };
        const map = new kakao.maps.Map(mapContainer, mapOption);
        new kakao.maps.Marker({ position: new kakao.maps.LatLng(lat, lng), map: map, title: "현재 위치" });

        resultList.innerHTML = `<div class="loader"><div class="spinner"></div>"'${searchKeyword}'" 주변 장소를 검색중...</div>`;
        const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchKeyword)}&x=${lng}&y=${lat}&radius=2000&size=5`;
        const res = await fetch(kakaoUrl, { headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` } });
        const data = await res.json();
        
        if (!data.documents || data.documents.length === 0) {
            resultList.innerHTML = '<li>주변에 적절한 장소가 없습니다.</li>';
            return;
        }

        // 1. 스켈레톤 UI 렌더링
        const skeletonHtml = data.documents.map(place => {
            const polyline = new kakao.maps.Polyline({ path: [ new kakao.maps.LatLng(lat, lng), new kakao.maps.LatLng(place.y, place.x) ] });
            const distance = Math.round(polyline.getLength());
            let distanceString = `${distance}m`;
            if (distance > 1000) distanceString = `${(distance / 1000).toFixed(1)}km`;

            const markerPosition = new kakao.maps.LatLng(place.y, place.x);
            const marker = new kakao.maps.Marker({ map: map, position: markerPosition, title: place.place_name });
            const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;text-align:center;">${place.place_name}<br><b>${distanceString}</b></div>`,
                removable: true
            });
            kakao.maps.event.addListener(marker, 'click', function() { infowindow.open(map, marker); });

            return `<li id="place-${place.id}">
                      <div class="content">
                        <strong>${place.place_name}</strong> <small>(${distanceString})</small><br>
                        <small>주소: ${place.road_address_name || place.address_name}</small><br>
                        <small>카테고리: ${place.category_name.split(' > ').pop()}</small>
                        <p class="summary" id="summary-${place.id}">
                          <div class="loader" style="padding: 0; justify-content: flex-start;">
                              <div class="spinner" style="width: 15px; height: 15px; margin-right: 8px;"></div>
                              AI가 리뷰를 분석 중...
                          </div>
                        </p>
                        <a href="${place.place_url}" target="_blank">카카오맵에서 상세정보 보기</a>
                      </div>
                    </li>`;
        }).join('');
        resultList.innerHTML = skeletonHtml;

        // 2. 각 장소에 대해 비동기적으로 AI 요약 요청 및 UI 업데이트
        data.documents.forEach(async (place) => {
            const summaryText = await getPerplexitySummary(place);
            const summaryElement = document.getElementById(`summary-${place.id}`);
            if (summaryElement) {
                summaryElement.innerHTML = summaryText;
            }
        });

    } catch (error) {
        console.error("추천 과정에서 에러 발생:", error);
        resultList.innerHTML = `<li>오류가 발생했습니다: ${error.message}</li>`;
    } finally {
        isSearching = false;
    }
} 