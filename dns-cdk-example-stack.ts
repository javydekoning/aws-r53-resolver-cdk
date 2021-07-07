import { Construct } from 'constructs';
import {
  App,
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_route53resolver as r53Resolver,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { AmazonLinuxGeneration } from 'aws-cdk-lib/lib/aws-ec2';

const fs = require('fs');
const bootstrap = fs.readFileSync('./bootstrap.sh', 'utf8');
const bootstrapTester = fs.readFileSync('./bootstrapPerfTester.sh', 'utf8');

export class DnsCdkExampleStack extends Stack {
  vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'dnsvpc', {
      maxAzs: 2,
    });

    this.vpc = vpc;

    //DNS Servers
    const userData = ec2.UserData.forLinux();
    userData.addCommands(bootstrap);

    const instanceSG = new ec2.SecurityGroup(this, 'InstanceSG', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'instanceSG',
    });

    const role = iam.Role.fromRoleArn(
      this,
      'role',
      'arn:aws:iam::922457306128:role/TeamRole'
    );

    const machineImage = new ec2.AmazonLinuxImage({
      generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
    });

    const dnsServers = ['serverA', 'serverB'].map(
      (x) =>
        new ec2.Instance(this, x, {
          instanceType: new ec2.InstanceType('c5n.large'),
          machineImage,
          vpc,
          userData,
          securityGroup: instanceSG,
          role,
          keyName: 'win',
          vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        })
    );

    const ubuntuUserData = ec2.UserData.forLinux();
    ubuntuUserData.addCommands(bootstrapTester);

    new ec2.Instance(this, 'perfTester', {
      instanceType: new ec2.InstanceType('c5n.large'),
      machineImage: ec2.MachineImage.fromSSMParameter(
        '/aws/service/canonical/ubuntu/server/18.04/stable/current/amd64/hvm/ebs-gp2/ami-id',
        ec2.OperatingSystemType.LINUX
      ),
      vpc,
      securityGroup: instanceSG,
      role,
      keyName: 'win',
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      userData: ubuntuUserData,
    });

    //Route53resolvers
    const resolverSG = new ec2.SecurityGroup(this, 'r53sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'route53resolversg',
    });

    const rules = [
      {
        peer: ec2.Peer.ipv4(vpc.vpcCidrBlock),
        connection: ec2.Port.udp(53),
      },
      {
        peer: ec2.Peer.ipv4(vpc.vpcCidrBlock),
        connection: ec2.Port.tcp(53),
      },
    ];

    rules.forEach((r) => {
      resolverSG.addIngressRule(r.peer, r.connection);
      instanceSG.addIngressRule(r.peer, r.connection);
    });

    const outBoundResolver = new r53Resolver.CfnResolverEndpoint(
      this,
      'endpoint',
      {
        direction: 'OUTBOUND',
        ipAddresses: [
          { subnetId: vpc.privateSubnets[0].subnetId },
          { subnetId: vpc.privateSubnets[1].subnetId },
        ],
        securityGroupIds: [resolverSG.securityGroupId],
      }
    );

    const resolverRules = new r53Resolver.CfnResolverRule(this, 'rules', {
      domainName: 'lab.javydekoning.com',
      name: 'forwardTest',
      resolverEndpointId: outBoundResolver.ref,
      ruleType: 'FORWARD',
      targetIps: [
        { ip: dnsServers[0].instancePrivateIp },
        { ip: dnsServers[1].instancePrivateIp },
      ],
    });

    new r53Resolver.CfnResolverRuleAssociation(this, 'assoc', {
      resolverRuleId: resolverRules.attrResolverRuleId,
      vpcId: vpc.vpcId,
    });
  }
}

const app = new App();
new DnsCdkExampleStack(app, 'DnsCdkExampleStack');
