Most of the API is a self describing single method system, meaning that any given root endpoint (i.e. /lodestone/1.0/) describes every endpoint it holds, including with params and expire timers.
All non-root endpoints can return XML (i.e. /aetheryte/1.0/time.xml), JSON (i.e. /aetheryte/1.0/time.json), and JSONP (i.e. /aetheryte/1.0/time.js)
You can specify the JSONP callback function with the ?callback= query param (i.e. /aetheryte/1.0/time.js?callback=foo).
All non-root endpoints have a wildcard cross origin header, meaning this is one of the two API sites that you can use XMLHttpRequest with.
