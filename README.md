<br>

<h1 align="center" >Open-source favicon provider</h3>
<p align="center">brought to you by the <a href="https://www.twenty.com">Twenty</a> team.</p>
<br />

<p align="center">
  <a href="https://www.twenty.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/twentyhq/favicon/main/docs/cover-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/twentyhq/favicon/main/docs/cover-light.png">
      <img src="./docs/static/img/preview-light.png" alt="Companies view" />
    </picture>
  </a>
</p>

## Usage

Looking for a company logo? Just fetch it from [https://favicon.twenty.com/airbnb.com](https://favicon.twenty.com/airbnb.com)
For example, if you're looking to display the Apple logo on your website, you can use: `<img src="https://favicon.twenty.com/apple.com" alt="Logo" />`

You can also specify a size with an optional parameter [https://favicon.twenty.com/github.com/128](https://favicon.twenty.com/github.com/128).
We support and store `[16x16, 32x32, 64x64, 128x128, 180x180, 192x192]` sizes.
If no size is specified, the highest available supported size will be used.

## Example

There are many other use-cases, mostly for B2B companies.
For example if you are a SaaS you could look at the domain when someone signups and automatically set their workspace logo based on that.

In our case, we built it because we needed it for our CRM [Twenty](https://github.com/twentyhq/twenty):
[![Twenty](https://raw.githubusercontent.com/twentyhq/twenty/main/docs/static/img/preview-light.png)](https://github.com/twentyhq/twenty)

## Features

- Fast delivery on the edge thanks to Cloudflare
- Delivered securely via SSL
- Support fetching larger icons, not just 16x16 favicons
