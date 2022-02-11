const dns = require("dns").promises;

(async () => {
  dns.setServers([
    "1.1.1.1",
    "[2606:4700:4700::1111]",
  ]);

  const ip = await dns.resolve("emusak.coveforme.com");
  console.log(ip);
})();
