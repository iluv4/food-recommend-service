import mcp
from mcp.client.streamable_http import streamablehttp_client
import json
import base64

# 카카오맵 API 키 입력
config = {
  "kakaoMapApiKey": "a75cdf5ed76a8f93be7cb7e8a63f114f"
}
# config를 base64로 인코딩
config_b64 = base64.b64encode(json.dumps(config).encode()).decode()
smithery_api_key = "06cb56f0-2c14-4d6d-9106-16ad11bc5f57"


# MCP 서버 URL 생성
url = f"https://server.smithery.ai/@cgoinglove/mcp-server-kakao-map/mcp?config={config_b64}&api_key={smithery_api_key}"

async def main():
    # HTTP 클라이언트로 서버 연결
    async with streamablehttp_client(url) as (read_stream, write_stream, _):
        async with mcp.ClientSession(read_stream, write_stream) as session:
            # 연결 초기화
            await session.initialize()
            # 사용 가능한 도구 목록 확인
            tools_result = await session.list_tools()
            print(f"Available tools: {', '.join([t.name for t in tools_result.tools])}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())