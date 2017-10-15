<h1>Force Directed App For Splunk<h1>
This app was created to allow IT Operations administrators and the security team to visualize there networks and attack paths inside an environment.  Once the app is installed a simple format of a command like the following can be used to visualize the data.
*index=firewall action=allowed | stats count by src_ip, dest_ip | table src_ip, dest_ip, count*

It is important to have the search formatted in the manner above, essentially translating to source, target, count.

Have fun and help me make this better by reporting bugs :).  

***Known Issues that I am not smart enough.. yet... to fix***
Text overlapping

