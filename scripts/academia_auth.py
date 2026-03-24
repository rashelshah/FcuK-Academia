#!/usr/bin/env python3
import asyncio
import json
import sys
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".python-packages"))

import httpx
from bs4 import BeautifulSoup

BASE_URL = "https://academia.srmist.edu.in/"
LOGIN_URL = "https://academia.srmist.edu.in/accounts/signin.ac"
HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Origin": "https://academia.srmist.edu.in",
    "Referer": "https://academia.srmist.edu.in/",
}


class SessionHandler:
    def __init__(self, cookies=None):
        self.client = httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=30.0)
        if cookies:
            self.client.cookies.update(cookies)

    async def force_logout_sessions(self, html_content):
        soup = BeautifulSoup(html_content, "html.parser")
        forms = soup.find_all("form")
        terminate_form = None

        for form in forms:
            if "terminate" in form.get_text().lower() or form.find("input", {"value": "Terminate All Sessions"}):
                terminate_form = form
                break

        if not terminate_form and forms:
            terminate_form = forms[0]

        if not terminate_form:
            return False

        action_url = terminate_form.get("action") or ""
        if not action_url.startswith("http"):
            action_url = urljoin(BASE_URL, action_url)

        data = {}
        for inp in terminate_form.find_all("input"):
            if inp.get("name"):
                data[inp.get("name")] = inp.get("value", "")

        submit_btn = terminate_form.find("button") or terminate_form.find("input", type="submit")
        if submit_btn and submit_btn.get("name"):
            data[submit_btn.get("name")] = submit_btn.get("value", "")

        try:
            response = await self.client.post(action_url, data=data)
            return response.status_code == 200
        except Exception:
            return False

    async def login(self, username, password, captcha=None, cdigest=None):
        self.client = httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=30.0)

        payload = {
            "username": username,
            "password": password,
            "client_portal": "true",
            "portal": "10002227248",
            "servicename": "ZohoCreator",
            "serviceurl": "https://academia.srmist.edu.in/",
            "is_ajax": "true",
            "grant_type": "password",
            "service_language": "en",
        }

        if cdigest:
            payload["cdigest"] = cdigest
        if captcha:
            payload["captcha"] = captcha

        response = await self.client.post(LOGIN_URL, data=payload)

        if "concurrent" in response.text.lower():
            if await self.force_logout_sessions(response.text):
                return await self.login(username, password, captcha, cdigest)

        data = json.loads(response.text)

        if data.get("status") == "fail":
            code = data.get("code")
            if code in ["HIP_REQUIRED", "HIP_FAILED"]:
                cdig = data.get("cdigest")
                msg = data.get("message", "Captcha required")
                raise Exception(json.dumps({
                    "type": "CAPTCHA_REQUIRED",
                    "message": msg,
                    "cdigest": cdig,
                    "image": f"https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/captcha/{cdig}?darkmode=false" if cdig else None,
                }))

            if "error" in data:
                raise Exception(data["error"].get("msg", "Login failed"))

        if "data" in data and "access_token" in data["data"]:
            token = data["data"]["access_token"]
            redirect_url = data["data"]["oauthorize_uri"]
            final_auth_url = f"{redirect_url}&access_token={token}"
            await self.client.get(final_auth_url)

            cookies = {cookie.name: cookie.value for cookie in self.client.cookies.jar}
            if "JSESSIONID" in cookies:
                return cookies

        raise Exception("Invalid credentials")


async def main():
    if len(sys.argv) > 1:
        raw = json.loads(sys.argv[1])
    else:
        raw = json.loads(sys.stdin.read())
    username = raw["username"]
    password = raw["password"]
    captcha = raw.get("captcha")
    cdigest = raw.get("cdigest")
    cookies = raw.get("cookies")

    try:
        handler = SessionHandler(cookies)
        try:
            cookies = await handler.login(username, password, captcha, cdigest)
        except Exception:
            if "@" not in username:
                raise
            cookies = await handler.login(username.split("@")[0], password, captcha, cdigest)
        print(json.dumps({
            "success": True,
            "cookies": cookies,
        }))
    except Exception as error:
        try:
            parsed = json.loads(str(error))
            print(json.dumps({
                "success": False,
                "error": parsed,
            }))
        except Exception:
            print(json.dumps({
                "success": False,
                "error": str(error),
            }))


if __name__ == "__main__":
    asyncio.run(main())
