---
title: "Website"
date: "2020-02-04"
about: "How I made my personal website."
publish: false
---

# Creating My Personal Website

## Purpose

This website was created so that I could have a place to post little applications and experiments I've created.

The aim being a basic homepage with links to my creations and a blog post to explain each one.

### Application

The home page and blog posts would have static content, but I'd need flexibility for any custom pages and to host APIs.

I wanted a consistent look and structure to pages that wold make it simple to expand on.
This meant breaking the pages down into components.
I played around with [NextJS](https://nextjs.org/), which is a framework to simplify creating react apps.
It had an interesting structure where within a certain directory it will build a page for each file in a mirrored location.

I had previously used [Nunjucks](https://mozilla.github.io/nunjucks/) for html templating which is a simple javascript tool for templating.
Using this I was able to create reusable components and a generic page template.
I created a directory to contain the static page structure with the templates and another for dynamic content.

I wanted to write my blog posts in markdown rather than HTML so I can focus on the content and have it in a format that I could easily upload to other platforms.

I used a library called [Gray Matter](https://github.com/jonschlinkert/gray-matter) to extract some meta information from the top of the markdown such as the date and a link to the relevant app.

The homepage also used all of this info to generate a card for each post sorted by dates with links to both the blog post and app.

### Infrastructure

Originally I was hosting the static content on [AWS S3](https://aws.amazon.com/s3/) and then had APIs on a subdomain.
However I wanted to put the entire site under one domain and front some of the api calls with a cache.

I then investigated a few options about executing code at the edge using [Cloudflare Workers](https://workers.cloudflare.com/).
I'd seen the cold start speed was faster than [AWS Lambda Edge](https://aws.amazon.com/lambda/edge/) and the execution environment was JavaScript which worked with the sort of stack I'm familiar with.
Cloudflare workers has a service called [KV](https://developers.cloudflare.com/workers/learning/how-kv-works) which I used to store the static content.
Then I created a default worker which looks for the static content.
All dynamic pages have their own workers.

All of the infrastructure is managed through [Terraform](https://www.terraform.io/) which allowed me to store it in code so environments can easily be created and destroyed.

