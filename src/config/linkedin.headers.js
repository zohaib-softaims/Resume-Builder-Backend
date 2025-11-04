/**
 * LinkedIn API Header Configurations
 * Array of header configurations - if one fails, the next will be tried
 */

export const LINKEDIN_HEADER_CONFIGS = [
  {
    accept: "application/vnd.linkedin.normalized+json+2.1",
    "accept-language": "en-US,en;q=0.9",
    "csrf-token": "ajax:4828844681821280706",
    priority: "u=1, i",
    "sec-ch-prefers-color-scheme": "dark",
    "sec-ch-ua":
      '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-li-lang": "en_US",
    "x-li-page-instance":
      "urn:li:page:d_flagship3_job_details;OFVfzqJtSme4Z0xTtucLkA==",
    "x-li-pem-metadata":
      "Voyager - Careers - Job Details=job-description-section-fetch,Voyager - Careers - Critical - careers-api=job-description-section-fetch",
    "x-li-track":
      '{"clientVersion":"1.13.40368","mpVersion":"1.13.40368","osName":"web","timezoneOffset":5,"timezone":"Asia/Karachi","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":2,"displayWidth":2880,"displayHeight":1800}',
    "x-restli-protocol-version": "2.0.0",
    cookie:
      'li_sugr=169d918f-1c44-4139-9ca7-c4fe94d42b46; bcookie="v=2&a43ff172-4d0b-4e7e-8f92-b2cb83ca2f83"; bscookie="v=1&202510130858025721ce1e-d4f2-4726-8b54-774f98d910c6AQGNpQmH6f7Wg5nhncAHsQLmFwhIgknM"; lang=v=2&lang=en-us; g_state={"i_l":0}; liap=true; JSESSIONID="ajax:4828844681821280706"; timezone=Asia/Karachi; li_theme=light; li_theme_set=app; _guid=229d7f19-6b06-4b54-946f-d964a5c14c33; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; aam_uuid=12213011589685743870810919716382131465; dfpfpt=a80fea408d4842768edc4c71a15af968; bitmovin_analytics_uuid=b224ece1-afd6-456b-a2e3-ef1855a6b95f; li_at=AQEDATg44PMFY0G9AAABmeJMEdsAAAGaVYTDIE0Aj4gj2TbJx1LtRl9qGjJWpdCauw4n_MJNEV8OsTP6e4anRl_SE9hEpskNEdEqYS87sZiKZj19LAD0kljEm7Z1ngeUVE8ra3HP0LsjRTROPLKin0UF; _gcl_au=1.1.1807358725.1760438289.280714653.1761770220.1761770220; AnalyticsSyncHistory=AQKLB7515Ry8lAAAAZpKwjeeh5Yrco6QgwNzWkJot_ZSZlO1hpdta9Al12V7nLUwESYQUZgHE_GwgqeE_jgl8A; lms_ads=AQE8zN1wTG27TQAAAZpKwjmd4hk2qHEJLJodzC8L-ZVQHM4NpTWed2-TJYqsJZeo8lF-HwApXBmvD70n4uBB9026_XYJNQO4; lms_analytics=AQE8zN1wTG27TQAAAZpKwjmd4hk2qHEJLJodzC8L-ZVQHM4NpTWed2-TJYqsJZeo8lF-HwApXBmvD70n4uBB9026_XYJNQO4; __cf_bm=Sfh7rLeRNU8lE6VusPfcgU_gnS5jwY9HR2RFqh.FRis-1762240293-1.0.1.1-PYhFCEFSd6_D3ttccaSU3PVt6.YakefQFF4eC1LvyXkhkwKy4gB.h3ZYetodYOEWtg48lpRHqgt.MnfGcZHQOurYkYMJn1Ar8rdx4l35YEU; sdui_ver=sdui-flagship:0.1.18844+SduiFlagship0; UserMatchHistory=AQL4Y8f92esXTQAAAZpNtRiHaulrkt3UiryAgGXA5OVRF4uXOXeiiAmBVvepDCwB7vAaGFslnZ54NQvjdBjsz3lSoUnhYOL4zH_bwBm4YO5i_djZFiP3aqti7OhX1bZWdqN-3OQdxVA8yEUSfDQRZlXh7oKRWPb1wHlZ8jyqc_H0fgwG3zj27nnCcW0DrpOlzgOHy1sY2TSaBGYP2pzklkBNCU65y5TpwwgdKECFZVdatOwEwq0721jsmA30GwPbRMpTspQK8TP05Kp7NT5_afWzQlXxeMG2AsJgPNpGLYE-M7Ve6JcibnhgZp6c96sPiygXZz4YAytMxC7cIDsYBz8dxx6olG3sPYqwNkuiejTAMYxNew; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-637568504%7CMCIDTS%7C20397%7CMCMID%7C11703045871639394480833122033153062594%7CMCAAMLH-1762845105%7C3%7CMCAAMB-1762845105%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1762247505s%7CNONE%7CMCCIDH%7C1480600416%7CvVersion%7C5.1.1; fptctx2=taBcrIH61PuCVH7eNCyH0F58uBDuZFZOunQHZt3Fugkdf3GO0Ps3LXIj3ULbH9QPvLCIOrN4sSF3yHI79usYgtFXLc1yLm1OAIaESBPnD%252fX0YdMZSeWrbUcvhZNjaySyV5TG1GO6m2NSxchec3SzIoZKHxLaZyqta3Uk3v04ikzV7mSkS0EiRalhfEmg8WBqIVQlLy2B7CeZuFCSUouvD3AqEb1REY0gFnXtpwaN1oGQiItaWDy5eklCVAuIzVxAUTT%252b0zSxW08RGoCkOSQrr15uGqYivWmtsMSYGlbQgEpTDLf5E1IBD3uuEhmR1GbUWF5OQ0p6uyJ87EU6XyK1yYvNbplNIBqdUCVpDPBQRu4%253d; lidc="b=TB99:s=T:r=T:a=T:p=T:g=3568:u=453:x=1:i=1762240901:t=1762244509:v=2:sig=AQEbFzqeuzhzFqW8Ef14VC6KlEwN4GHB"',
    Referer: "https://www.linkedin.com/jobs/view/4259182341/",
  },
  {
    // Second fallback configuration
    accept: "application/vnd.linkedin.normalized+json+2.1",
    "accept-language": "en-US,en;q=0.9",
    "csrf-token": "ajax:5000000000000000000",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-li-lang": "en_US",
    "x-restli-protocol-version": "2.0.0",
    cookie: "li_sugr=fallback-cookie",
    Referer: "https://www.linkedin.com/jobs/",
  },
  {
    // Third minimal fallback configuration
    accept: "application/vnd.linkedin.normalized+json+2.1",
    "accept-language": "en-US,en;q=0.9",
    "x-restli-protocol-version": "2.0.0",
    Referer: "https://www.linkedin.com/",
  },
];
