---
layout: page
title: News
permalink: /news/
---

Stay up to date with the latest announcements and updates for **agentic-archive.is-ifier**.

{% for post in site.posts %}
<article>
  <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
  <p><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></p>
  <p>{{ post.excerpt }}</p>
  <a href="{{ post.url | relative_url }}">Read more →</a>
</article>
{% endfor %}
