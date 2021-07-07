# aws-route-53-outbound-resolver-example

AWS R53 Outbound Resolver example CDK stack.

- ServerA & ServerB
  - dnsmasq in Docker on AmazonLinux2
- perfTester
  - runs dnsperf on Ubuntu
- Route53 outbound resolver has a rule to **FORWARD** `.lab.javydekoning.com.` to `serverA` and `serverB`. Rule is associated with VPC.