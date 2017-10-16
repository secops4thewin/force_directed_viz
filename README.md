# Force Directed App For Splunk #
This app was created to allow IT Operations administrators and the security team to visualize there networks attack paths inside an environment. 

### Installation Instructions

1. Download the app and unzip to $SPLUNK_HOME/etc/apps on your Search Head
2. Restart Splunk
3. Generate a search that has a 'source', 'target' and optionally a count. For example

- index=firewall action=allowed | stats count by src_ip, dest_ip | table src_ip, dest_ip, count

### Bugs I am not smart enough to fix 
Text overlapping.
Any other bugs please report :)

### To do once release ready
Clean up node modules folder

### Tested on
**Mac**
- Safari Version 11.0 
- Chrome Version 61.0.X (Official Build) (64-bit)
- Firefox 64.0

