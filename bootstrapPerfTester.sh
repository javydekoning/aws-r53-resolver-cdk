apt-get update && apt-get upgrade -y && snap install --devmode --beta dnsperf

echo "lab.javydekoning.com A" >> /tmp/datafile
echo "a.lab.javydekoning.com A" >> /tmp/datafile
echo "b.lab.javydekoning.com A" >> /tmp/datafile
echo "c.lab.javydekoning.com A" >> /tmp/datafile
echo "d.lab.javydekoning.com A" >> /tmp/datafile
echo "e.lab.javydekoning.com A" >> /tmp/datafile
echo "f.lab.javydekoning.com A" >> /tmp/datafile
echo "google.com A" >> /tmp/datafile

chmod a+rwx /tmp/datafile