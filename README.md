# agentic-archive.is-ifier

this is a vibe coded chrome extension tryint to mimic https://chromewebstore.google.com/detail/archiveisifier/mcpaaodjfngbeolmaaobjmoefnafljkc

## requirements:
Adds archive.is-content to contextmenu

This extension allows users to right click urls and
- archive the link with archive.is
- archive the link and copy archive.is-link to clipboard
- show all archived versions of link
- show real URL (if right clicked archive.is/fo-link)
- open selected url on archive.is (urls that are not a-tags)
- open current page on archive.is
- make the url an option which can be edited in options https://archive.ph/ could be another URL
- copy the options and interface from https://github.com/falkorichter/export-tabs-urls
- the icon should be some basic png with `is!` written in it

here is the form on archive.is
```
<form id="submiturl" style="text-align:left;height:75px;background-color:#B40010;position:relative" action="https://archive.ph/submit/" method="GET"><div style="padding:5px;margin:0 20px;color:white;font-weight:bold;font-size:16px">My url is alive and I want to archive its content</div><div style="margin:0;padding:0;position:absolute;left:20px;right:140px"><input id="url" style="padding:0px 2px;height:2em;width:100%;border:0" type="text" name="url" placeholder="http://www.domain.com/url" value="" tabindex="1"></div><div style="margin:0;padding:0;position:absolute;width:100px;right:20px"><input style="padding:4px;height:2em;width:100px" type="submit" value="save" tabindex="-1"></div></form>
```
which we want to mimic. we don't want to open the URL but post the URL to the same endpoint.

