yum update -y && amazon-linux-extras install docker -y && service docker start
mkdir /tmp/etc-dnsmasq.d/
echo "address=/lab.javydekoning.com/192.168.1.9" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "address=/a.lab.javydekoning.com/192.168.1.1" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "address=/b.lab.javydekoning.com/192.168.1.2" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "address=/c.lab.javydekoning.com/192.168.1.3" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "address=/d.lab.javydekoning.com/192.168.1.4" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "address=/e.lab.javydekoning.com/192.168.1.5" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "address=/f.lab.javydekoning.com/192.168.1.6" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
echo "server=10.0.0.2" >> /tmp/etc-dnsmasq.d/dnsmasq.conf
docker run -d --cap-add NET_ADMIN -p 53:53/tcp -p 53:53/udp -v "/tmp/etc-dnsmasq.d/dnsmasq.conf:/etc/dnsmasq.conf" strm/dnsmasq:latest